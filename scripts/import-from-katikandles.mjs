#!/usr/bin/env node
// scripts/import-from-katikandles.mjs
//
// Imports products from the live katikandles.gr storefront (Swell-backed) into
// our own Neon DB + Vercel Blob.
//
//   1. GET https://katikandles.gr/api/products  (16 live products)
//   2. For each image on cdn.swell.store: download, upload to Vercel Blob.
//   3. INSERT into products with rewritten image URLs.
//   4. INSERT into product_categories based on Swell attributes:
//        candle             -> candles
//        wax_melt           -> wax-melts
//        car_diffuser       -> car-diffuser
//        fragrance_wardrobe -> aromatics
//        (latest_drop is a drop badge, not a category — ignored here.)
//
// Usage:  node scripts/import-from-katikandles.mjs [--dry-run]
//
// Required env (loaded from .env.local at repo root):
//   NEON_DATABASE_URL
//   BLOB_READ_WRITE_TOKEN

import { existsSync, readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import path from "node:path"
import { neon } from "@neondatabase/serverless"
import { put } from "@vercel/blob"

// --- env loader (no external deps) ----------------------------------------
// Walk up from this script's dir looking for .env.local. This way the script
// works whether invoked from the worktree, the main repo, or anywhere else.
function loadEnv() {
  const __dirname = path.dirname(fileURLToPath(import.meta.url))
  const candidates = []
  let cur = __dirname
  for (let i = 0; i < 8; i++) {
    candidates.push(path.join(cur, ".env.local"))
    const parent = path.dirname(cur)
    if (parent === cur) break
    cur = parent
  }
  candidates.push(path.join(process.cwd(), ".env.local"))

  for (const envFile of candidates) {
    if (!existsSync(envFile)) continue
    const raw = readFileSync(envFile, "utf-8")
    for (const line of raw.split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/)
      if (!m) continue
      let v = m[2]
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1)
      }
      if (process.env[m[1]] === undefined) process.env[m[1]] = v
    }
    return envFile
  }
  return null
}
const loaded = loadEnv()
if (loaded) console.log(`env: loaded ${loaded}`)

const DRY_RUN = process.argv.includes("--dry-run")
const SOURCE_API = "https://katikandles.gr/api/products"

// attribute key (Swell) -> our category slug
const CATEGORY_MAP = {
  candle: "candles",
  wax_melt: "wax-melts",
  car_diffuser: "car-diffuser",
  fragrance_wardrobe: "aromatics",
}

const databaseUrl = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL
const blobToken = process.env.BLOB_READ_WRITE_TOKEN

if (!databaseUrl) {
  console.error("Missing NEON_DATABASE_URL (or DATABASE_URL) in env")
  process.exit(1)
}
if (!blobToken && !DRY_RUN) {
  console.error("Missing BLOB_READ_WRITE_TOKEN in env")
  process.exit(1)
}

const sql = neon(databaseUrl)

// ---------------------------------------------------------------------------
async function fetchSourceProducts() {
  const res = await fetch(SOURCE_API)
  if (!res.ok) throw new Error(`source API ${res.status}`)
  const json = await res.json()
  return json.results || []
}

async function loadCategoryIdMap() {
  const rows = await sql`SELECT id, slug FROM categories`
  return Object.fromEntries(rows.map((r) => [r.slug, r.id]))
}

function inferCategorySlugs(attributes) {
  const slugs = new Set()
  for (const [key, value] of Object.entries(attributes || {})) {
    if (String(value).toUpperCase() !== "TRUE") continue
    const cat = CATEGORY_MAP[key]
    if (cat) slugs.add(cat)
  }
  return [...slugs]
}

function pickPathname(swellUrl, productSlug, idx) {
  // produce a stable, readable pathname for the Blob
  try {
    const u = new URL(swellUrl)
    const ext = path.extname(u.pathname).toLowerCase() || ".png"
    return `products/${productSlug}/${idx}${ext}`
  } catch {
    return `products/${productSlug}/${idx}.png`
  }
}

async function migrateImage(swellUrl, productSlug, idx) {
  const res = await fetch(swellUrl)
  if (!res.ok) throw new Error(`download ${swellUrl} -> ${res.status}`)
  const arr = await res.arrayBuffer()
  const buf = Buffer.from(arr)
  const pathname = pickPathname(swellUrl, productSlug, idx)
  const contentType = res.headers.get("content-type") || "image/png"
  if (DRY_RUN) {
    return { url: `https://blob.example/${pathname}`, bytes: buf.byteLength, dryRun: true }
  }
  const result = await put(pathname, buf, {
    access: "public",
    contentType,
    token: blobToken,
    addRandomSuffix: true, // Vercel Blob defaults: avoid collision on re-runs
  })
  return { url: result.url, bytes: buf.byteLength }
}

async function importOne(p, categoryIdMap) {
  const slug = p.slug
  const name = p.name?.trim() || slug
  const description = p.description || ""
  const price = Number(p.price ?? 0)
  const salePrice = p.sale_price != null ? Number(p.sale_price) : null
  const stockStatus = p.stock_status || "in_stock"
  const attributes = p.attributes || {}

  console.log(`\n→ ${slug}  (${name})`)

  // 1. images: download swell → upload to blob
  const newImages = []
  for (let i = 0; i < (p.images || []).length; i++) {
    const img = p.images[i]
    const swellUrl = img?.file?.url
    if (!swellUrl) continue
    try {
      const { url, bytes } = await migrateImage(swellUrl, slug, i)
      newImages.push({ url, alt: name })
      console.log(`   image ${i}: ${(bytes / 1024).toFixed(1)} kB → ${url.slice(0, 70)}…`)
    } catch (err) {
      console.error(`   image ${i} FAILED: ${err.message}`)
    }
  }

  if (DRY_RUN) {
    console.log(
      `   [dry-run] would upsert: price=${price} sale=${salePrice} imgs=${newImages.length} attrs=${JSON.stringify(attributes)}`,
    )
    return
  }

  // 2. upsert product (slug-conflict update)
  const upserted = await sql`
    INSERT INTO products (
      name, slug, description, price, sale_price, currency,
      images, stock_status, stock_level, stock_tracking, active, attributes
    ) VALUES (
      ${name}, ${slug}, ${description}, ${price}, ${salePrice}, 'EUR',
      ${JSON.stringify(newImages)}::jsonb, ${stockStatus}, 0, false, true, ${JSON.stringify(attributes)}::jsonb
    )
    ON CONFLICT (slug) DO UPDATE SET
      name = EXCLUDED.name,
      description = EXCLUDED.description,
      price = EXCLUDED.price,
      sale_price = EXCLUDED.sale_price,
      images = EXCLUDED.images,
      stock_status = EXCLUDED.stock_status,
      attributes = EXCLUDED.attributes,
      updated_at = now()
    RETURNING id
  `
  const productId = upserted[0].id

  // 3. category links (idempotent — clear & re-insert)
  await sql`DELETE FROM product_categories WHERE product_id = ${productId}`
  const catSlugs = inferCategorySlugs(attributes)
  for (const cs of catSlugs) {
    const cid = categoryIdMap[cs]
    if (!cid) {
      console.warn(`   ! category '${cs}' not found in DB, skipped`)
      continue
    }
    await sql`INSERT INTO product_categories (product_id, category_id) VALUES (${productId}, ${cid})`
  }
  console.log(
    `   ✓ saved id=${productId.slice(0, 8)}…  categories=[${catSlugs.join(", ")}]`,
  )
}

async function main() {
  console.log(`mode: ${DRY_RUN ? "DRY-RUN (no writes)" : "LIVE"}`)
  const products = await fetchSourceProducts()
  console.log(`fetched ${products.length} products from ${SOURCE_API}`)

  const categoryIdMap = await loadCategoryIdMap()
  console.log(`categories in DB: ${Object.keys(categoryIdMap).join(", ")}`)

  let ok = 0
  let fail = 0
  for (const p of products) {
    try {
      await importOne(p, categoryIdMap)
      ok++
    } catch (err) {
      fail++
      console.error(`   FAILED ${p.slug}:`, err.message)
    }
  }

  console.log(`\nDone. ok=${ok} fail=${fail}`)
}

main().catch((err) => {
  console.error("fatal:", err)
  process.exit(1)
})
