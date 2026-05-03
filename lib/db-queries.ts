// lib/db-queries.ts
// Data access layer — Drizzle ORM on Neon.

import { and, desc, eq, gte, ilike, inArray, lte, or, sql, asc } from "drizzle-orm"
import { db } from "@/lib/db"
import {
  categories,
  coupons,
  drops,
  newsletterSubscribers,
  orderItems,
  orders,
  pages,
  productCategories,
  productVariants,
  products,
  siteSettings,
} from "@/lib/db/schema"

// ============================================================
// Types (frontend-facing — mirror what the rest of the app expects)
// ============================================================
export interface ProductImage {
  url: string
  alt?: string
}

export interface Product {
  id: string
  name: string
  slug: string
  description?: string
  price: number
  sale_price?: number | null
  currency: string
  images: ProductImage[]
  stock_status: "in_stock" | "out_of_stock" | "low_stock"
  stock_level?: number
  stock_tracking: boolean
  active: boolean
  attributes: Record<string, unknown>
  sort_order: number
  categories?: Category[]
  variants?: ProductVariant[]
  created_at: string
  updated_at: string
}

export interface ProductVariant {
  id: string
  product_id: string
  name: string
  price?: number | null
  stock_level: number
  option_values: Record<string, string>
  active: boolean
  sort_order: number
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image_url?: string
  sort_order: number
}

export interface Coupon {
  id: string
  code: string
  name?: string
  description?: string
  discount_type: "percent" | "fixed" | "shipping"
  discount_amount?: number
  discount_percent?: number
  min_order_amount?: number
  max_uses?: number
  times_used: number
  active: boolean
  starts_at?: string
  expires_at?: string
}

export interface Order {
  id: string
  order_number: string
  status: string
  customer_email?: string
  customer_first_name?: string
  customer_last_name?: string
  customer_phone?: string
  shipping_address1?: string
  shipping_address2?: string
  shipping_city?: string
  shipping_state?: string
  shipping_zip?: string
  shipping_country?: string
  shipping_method?: string
  shipping_method_name?: string
  shipping_price: number
  currency: string
  subtotal: number
  discount_total: number
  shipping_total: number
  grand_total: number
  coupon_code?: string
  coupon_id?: string
  payment_method: string
  payment_status: string
  stripe_session_id?: string
  stripe_payment_intent_id?: string
  notes?: string
  metadata: Record<string, unknown>
  items?: OrderItem[]
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id?: string
  variant_id?: string
  product_name: string
  product_image_url?: string
  price: number
  quantity: number
  line_total: number
}

export interface Page {
  id: string
  name: string
  slug: string
  content?: string
  meta_description?: string
  active: boolean
}

export interface Drop {
  id: string
  name: string
  slug: string
  tagline?: string
  description?: string
  badge_text?: string
  starts_at?: string
  ends_at?: string
  hero_image_url?: string
  background_color?: string
  active: boolean
  featured: boolean
  product_ids: string[]
  sort_order: number
  created_at: string
  updated_at: string
}

// ============================================================
// Transform helpers (db row → public shape)
// ============================================================
function toProduct(row: any, opts: { categories?: any[]; variants?: any[] } = {}): Product {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? "",
    price: Number(row.price) || 0,
    sale_price: row.salePrice != null ? Number(row.salePrice) : null,
    currency: row.currency || "EUR",
    images: Array.isArray(row.images) ? row.images : [],
    stock_status: row.stockStatus || "in_stock",
    stock_level: row.stockLevel ?? undefined,
    stock_tracking: !!row.stockTracking,
    active: row.active !== false,
    attributes: row.attributes || {},
    sort_order: row.sortOrder || 0,
    categories: (opts.categories || []).map(toCategory),
    variants: (opts.variants || []).map(toVariant),
    created_at: row.createdAt instanceof Date ? row.createdAt.toISOString() : String(row.createdAt),
    updated_at: row.updatedAt instanceof Date ? row.updatedAt.toISOString() : String(row.updatedAt),
  }
}

function toCategory(row: any): Category {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? undefined,
    image_url: row.imageUrl ?? undefined,
    sort_order: row.sortOrder || 0,
  }
}

function toVariant(row: any): ProductVariant {
  return {
    id: row.id,
    product_id: row.productId,
    name: row.name,
    price: row.price != null ? Number(row.price) : null,
    stock_level: row.stockLevel || 0,
    option_values: row.optionValues || {},
    active: row.active !== false,
    sort_order: row.sortOrder || 0,
  }
}

function toOrder(row: any, items: any[] = []): Order {
  return {
    id: row.id,
    order_number: row.orderNumber,
    status: row.status,
    customer_email: row.customerEmail ?? undefined,
    customer_first_name: row.customerFirstName ?? undefined,
    customer_last_name: row.customerLastName ?? undefined,
    customer_phone: row.customerPhone ?? undefined,
    shipping_address1: row.shippingAddress1 ?? undefined,
    shipping_address2: row.shippingAddress2 ?? undefined,
    shipping_city: row.shippingCity ?? undefined,
    shipping_state: row.shippingState ?? undefined,
    shipping_zip: row.shippingZip ?? undefined,
    shipping_country: row.shippingCountry ?? undefined,
    shipping_method: row.shippingMethod ?? undefined,
    shipping_method_name: row.shippingMethodName ?? undefined,
    shipping_price: Number(row.shippingPrice) || 0,
    currency: row.currency || "EUR",
    subtotal: Number(row.subtotal) || 0,
    discount_total: Number(row.discountTotal) || 0,
    shipping_total: Number(row.shippingTotal) || 0,
    grand_total: Number(row.grandTotal) || 0,
    coupon_code: row.couponCode ?? undefined,
    coupon_id: row.couponId ?? undefined,
    payment_method: row.paymentMethod ?? "",
    payment_status: row.paymentStatus ?? "pending",
    stripe_session_id: row.stripeSessionId ?? undefined,
    stripe_payment_intent_id: row.stripePaymentIntentId ?? undefined,
    notes: row.notes ?? undefined,
    metadata: row.metadata || {},
    items: items.map(toOrderItem),
    created_at: row.createdAt instanceof Date ? row.createdAt.toISOString() : String(row.createdAt),
    updated_at: row.updatedAt instanceof Date ? row.updatedAt.toISOString() : String(row.updatedAt),
  }
}

function toOrderItem(row: any): OrderItem {
  return {
    id: row.id,
    order_id: row.orderId,
    product_id: row.productId ?? undefined,
    variant_id: row.variantId ?? undefined,
    product_name: row.productName,
    product_image_url: row.productImageUrl ?? undefined,
    price: Number(row.price) || 0,
    quantity: row.quantity || 1,
    line_total: Number(row.lineTotal) || 0,
  }
}

function toCoupon(row: any): Coupon {
  return {
    id: row.id,
    code: row.code,
    name: row.name ?? undefined,
    description: row.description ?? undefined,
    discount_type: row.discountType,
    discount_amount: row.discountAmount != null ? Number(row.discountAmount) : undefined,
    discount_percent: row.discountPercent != null ? Number(row.discountPercent) : undefined,
    min_order_amount: row.minOrderAmount != null ? Number(row.minOrderAmount) : undefined,
    max_uses: row.maxUses ?? undefined,
    times_used: row.timesUsed || 0,
    active: row.active !== false,
    starts_at: row.startsAt instanceof Date ? row.startsAt.toISOString() : row.startsAt ?? undefined,
    expires_at: row.expiresAt instanceof Date ? row.expiresAt.toISOString() : row.expiresAt ?? undefined,
  }
}

function toDrop(row: any): Drop {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    tagline: row.tagline ?? undefined,
    description: row.description ?? undefined,
    badge_text: row.badgeText ?? undefined,
    starts_at: row.startsAt instanceof Date ? row.startsAt.toISOString() : row.startsAt ?? undefined,
    ends_at: row.endsAt instanceof Date ? row.endsAt.toISOString() : row.endsAt ?? undefined,
    hero_image_url: row.heroImageUrl ?? undefined,
    background_color: row.backgroundColor ?? undefined,
    active: row.active !== false,
    featured: !!row.featured,
    product_ids: Array.isArray(row.productIds) ? row.productIds : [],
    sort_order: row.sortOrder || 0,
    created_at: row.createdAt instanceof Date ? row.createdAt.toISOString() : String(row.createdAt),
    updated_at: row.updatedAt instanceof Date ? row.updatedAt.toISOString() : String(row.updatedAt),
  }
}

function toPage(row: any): Page {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    content: row.content ?? undefined,
    meta_description: row.metaDescription ?? undefined,
    active: row.active !== false,
  }
}

// ============================================================
// Products
// ============================================================
export async function getProducts(
  params: {
    limit?: number
    page?: number
    category?: string
    search?: string
    sort?: string
    activeOnly?: boolean
  } = {},
): Promise<{ results: Product[]; count: number }> {
  const { limit = 100, page = 1, category, search, sort, activeOnly = true } = params
  const offset = (page - 1) * limit

  let productIds: string[] | undefined

  // category filter via product_categories join
  if (category) {
    const cat = await db.query.categories.findFirst({
      where: eq(categories.slug, category),
      columns: { id: true },
    })
    if (!cat) return { results: [], count: 0 }
    const links = await db
      .select({ productId: productCategories.productId })
      .from(productCategories)
      .where(eq(productCategories.categoryId, cat.id))
    productIds = links.map((l) => l.productId)
    if (productIds.length === 0) return { results: [], count: 0 }
  }

  const whereParts = []
  if (activeOnly) whereParts.push(eq(products.active, true))
  if (productIds) whereParts.push(inArray(products.id, productIds))
  if (search) {
    whereParts.push(
      or(ilike(products.name, `%${search}%`), ilike(products.description, `%${search}%`))!,
    )
  }
  const whereClause = whereParts.length > 0 ? and(...whereParts) : undefined

  const orderBy = (() => {
    switch (sort) {
      case "price_asc":
        return [asc(products.price)]
      case "price_desc":
        return [desc(products.price)]
      case "newest":
        return [desc(products.createdAt)]
      default:
        return [asc(products.sortOrder), desc(products.createdAt)]
    }
  })()

  const rows = await db
    .select()
    .from(products)
    .where(whereClause)
    .orderBy(...orderBy)
    .limit(limit)
    .offset(offset)

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(products)
    .where(whereClause)

  // batch-load categories + variants
  const ids = rows.map((r) => r.id)
  let catsByProd: Record<string, any[]> = {}
  let varsByProd: Record<string, any[]> = {}

  if (ids.length > 0) {
    const catLinks = await db
      .select({
        productId: productCategories.productId,
        category: categories,
      })
      .from(productCategories)
      .innerJoin(categories, eq(productCategories.categoryId, categories.id))
      .where(inArray(productCategories.productId, ids))

    for (const link of catLinks) {
      if (!catsByProd[link.productId]) catsByProd[link.productId] = []
      catsByProd[link.productId].push(link.category)
    }

    const variantRows = await db
      .select()
      .from(productVariants)
      .where(inArray(productVariants.productId, ids))

    for (const v of variantRows) {
      if (!varsByProd[v.productId]) varsByProd[v.productId] = []
      varsByProd[v.productId].push(v)
    }
  }

  return {
    results: rows.map((r) =>
      toProduct(r, { categories: catsByProd[r.id], variants: varsByProd[r.id] }),
    ),
    count: count || 0,
  }
}

export async function getProduct(slug: string): Promise<Product | null> {
  const row = await db.query.products.findFirst({
    where: and(eq(products.slug, slug), eq(products.active, true)),
  })
  if (!row) return null
  return await loadProductRelations(row)
}

export async function getProductById(id: string): Promise<Product | null> {
  const row = await db.query.products.findFirst({ where: eq(products.id, id) })
  if (!row) return null
  return await loadProductRelations(row)
}

async function loadProductRelations(row: any): Promise<Product> {
  const [catLinks, vars] = await Promise.all([
    db
      .select({ category: categories })
      .from(productCategories)
      .innerJoin(categories, eq(productCategories.categoryId, categories.id))
      .where(eq(productCategories.productId, row.id)),
    db.select().from(productVariants).where(eq(productVariants.productId, row.id)),
  ])
  return toProduct(row, {
    categories: catLinks.map((l) => l.category),
    variants: vars,
  })
}

export async function getAllProductSlugs(): Promise<string[]> {
  const rows = await db
    .select({ slug: products.slug })
    .from(products)
    .where(eq(products.active, true))
  return rows.map((r) => r.slug)
}

// ============================================================
// Categories
// ============================================================
export async function getCategory(slug: string): Promise<Category | null> {
  const row = await db.query.categories.findFirst({ where: eq(categories.slug, slug) })
  return row ? toCategory(row) : null
}

export async function getCategories(): Promise<Category[]> {
  const rows = await db.select().from(categories).orderBy(asc(categories.sortOrder))
  return rows.map(toCategory)
}

// ============================================================
// Coupons
// ============================================================
export async function validateCoupon(code: string): Promise<Coupon | null> {
  const row = await db.query.coupons.findFirst({
    where: and(eq(coupons.code, code.toUpperCase().trim()), eq(coupons.active, true)),
  })
  if (!row) return null

  const c = toCoupon(row)
  const now = new Date()
  if (c.expires_at && new Date(c.expires_at) < now) return null
  if (c.starts_at && new Date(c.starts_at) > now) return null
  if (c.max_uses && c.times_used >= c.max_uses) return null
  return c
}

export function calculateDiscount(coupon: Coupon, subtotal: number): number {
  if (coupon.min_order_amount && subtotal < coupon.min_order_amount) return 0
  switch (coupon.discount_type) {
    case "percent":
      return Math.round((subtotal * (coupon.discount_percent || 0)) / 100 * 100) / 100
    case "fixed":
      return Math.min(coupon.discount_amount || 0, subtotal)
    case "shipping":
      return 0
    default:
      return 0
  }
}

export async function incrementCouponUsage(couponId: string): Promise<void> {
  await db
    .update(coupons)
    .set({ timesUsed: sql`${coupons.timesUsed} + 1` })
    .where(eq(coupons.id, couponId))
}

// ============================================================
// Orders
// ============================================================
async function nextOrderNumber(): Promise<string> {
  // Atomic: find current max and add 1; format as KK-00001
  const [{ max }] = await db
    .select({
      max: sql<number>`coalesce(max((regexp_replace(${orders.orderNumber}, '^KK-', ''))::int), 0)`,
    })
    .from(orders)
  const next = (Number(max) || 0) + 1
  return `KK-${String(next).padStart(5, "0")}`
}

export async function createOrder(data: {
  customer_email: string
  customer_first_name: string
  customer_last_name: string
  customer_phone: string
  shipping_address1: string
  shipping_address2?: string
  shipping_city: string
  shipping_state?: string
  shipping_zip: string
  shipping_country?: string
  shipping_method: string
  shipping_method_name: string
  shipping_price: number
  subtotal: number
  discount_total?: number
  shipping_total?: number
  grand_total: number
  coupon_code?: string
  coupon_id?: string
  stripe_session_id?: string
  stripe_payment_intent_id?: string
  payment_method?: string
  payment_status?: string
  status?: string
  items: Array<{
    product_id: string
    variant_id?: string
    product_name: string
    product_image_url?: string
    price: number
    quantity: number
    line_total: number
  }>
  metadata?: Record<string, unknown>
}): Promise<Order | null> {
  const orderNumber = await nextOrderNumber()

  const [orderRow] = await db
    .insert(orders)
    .values({
      orderNumber,
      status: data.status || "pending",
      customerEmail: data.customer_email,
      customerFirstName: data.customer_first_name,
      customerLastName: data.customer_last_name,
      customerPhone: data.customer_phone,
      shippingAddress1: data.shipping_address1,
      shippingAddress2: data.shipping_address2,
      shippingCity: data.shipping_city,
      shippingState: data.shipping_state,
      shippingZip: data.shipping_zip,
      shippingCountry: data.shipping_country || "GR",
      shippingMethod: data.shipping_method,
      shippingMethodName: data.shipping_method_name,
      shippingPrice: data.shipping_price.toString(),
      shippingTotal: (data.shipping_total ?? data.shipping_price).toString(),
      subtotal: data.subtotal.toString(),
      discountTotal: (data.discount_total ?? 0).toString(),
      grandTotal: data.grand_total.toString(),
      couponCode: data.coupon_code,
      couponId: data.coupon_id,
      stripeSessionId: data.stripe_session_id,
      stripePaymentIntentId: data.stripe_payment_intent_id,
      paymentMethod: data.payment_method ?? "stripe",
      paymentStatus: data.payment_status ?? "pending",
      metadata: data.metadata ?? {},
    })
    .returning()

  if (!orderRow) return null

  if (data.items.length > 0) {
    await db.insert(orderItems).values(
      data.items.map((it) => ({
        orderId: orderRow.id,
        productId: it.product_id,
        variantId: it.variant_id,
        productName: it.product_name,
        productImageUrl: it.product_image_url,
        price: it.price.toString(),
        quantity: it.quantity,
        lineTotal: it.line_total.toString(),
      })),
    )
  }

  return toOrder(orderRow)
}

export async function getOrder(id: string): Promise<Order | null> {
  const row = await db.query.orders.findFirst({ where: eq(orders.id, id) })
  if (!row) return null
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id))
  return toOrder(row, items)
}

export async function getOrderByStripeSession(sessionId: string): Promise<Order | null> {
  const row = await db.query.orders.findFirst({
    where: eq(orders.stripeSessionId, sessionId),
  })
  if (!row) return null
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, row.id))
  return toOrder(row, items)
}

export async function updateOrderStatus(
  orderId: string,
  status: string,
  paymentStatus?: string,
  extra?: Record<string, unknown>,
): Promise<Order | null> {
  const update: Record<string, unknown> = { status, updatedAt: new Date() }
  if (paymentStatus) update.paymentStatus = paymentStatus
  if (extra) Object.assign(update, extra)

  const [row] = await db.update(orders).set(update).where(eq(orders.id, orderId)).returning()
  return row ? toOrder(row) : null
}

export async function getOrders(
  params: { limit?: number; page?: number; status?: string } = {},
): Promise<{ results: Order[]; count: number }> {
  const { limit = 50, page = 1, status } = params
  const offset = (page - 1) * limit
  const where = status ? eq(orders.status, status) : undefined

  const rows = await db
    .select()
    .from(orders)
    .where(where)
    .orderBy(desc(orders.createdAt))
    .limit(limit)
    .offset(offset)

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(orders)
    .where(where)

  return {
    results: rows.map((r) => toOrder(r)),
    count: count || 0,
  }
}

// ============================================================
// Pages (CMS)
// ============================================================
export async function getPage(slug: string): Promise<Page | null> {
  const row = await db.query.pages.findFirst({
    where: and(eq(pages.slug, slug), eq(pages.active, true)),
  })
  return row ? toPage(row) : null
}

export async function getPages(): Promise<Page[]> {
  const rows = await db.select().from(pages).orderBy(asc(pages.name))
  return rows.map(toPage)
}

// ============================================================
// Drops
// ============================================================
export async function getFeaturedDrop(): Promise<{
  drop: Drop | null
  products: Product[]
}> {
  const now = new Date()
  const row = await db.query.drops.findFirst({
    where: and(
      eq(drops.active, true),
      eq(drops.featured, true),
      or(sql`${drops.startsAt} IS NULL`, lte(drops.startsAt, now))!,
      or(sql`${drops.endsAt} IS NULL`, gte(drops.endsAt, now))!,
    ),
    orderBy: [asc(drops.sortOrder), desc(drops.createdAt)],
  })

  if (!row) return { drop: null, products: [] }

  const drop = toDrop(row)
  let productList: Product[] = []
  if (drop.product_ids.length > 0) {
    const rows = await db
      .select()
      .from(products)
      .where(and(inArray(products.id, drop.product_ids), eq(products.active, true)))
    productList = await Promise.all(rows.map((r) => loadProductRelations(r)))
  }

  return { drop, products: productList }
}

export async function getDrops(): Promise<Drop[]> {
  const rows = await db
    .select()
    .from(drops)
    .orderBy(asc(drops.sortOrder), desc(drops.createdAt))
  return rows.map(toDrop)
}

// ============================================================
// Stock helpers
// ============================================================
export async function decrementStock(
  productId: string,
  quantity: number,
  variantId?: string,
): Promise<boolean> {
  if (variantId) {
    await db
      .update(productVariants)
      .set({ stockLevel: sql`greatest(${productVariants.stockLevel} - ${quantity}, 0)` })
      .where(eq(productVariants.id, variantId))
    return true
  }

  const product = await db.query.products.findFirst({
    where: eq(products.id, productId),
    columns: { stockLevel: true, stockTracking: true },
  })
  if (!product || !product.stockTracking) return true

  const newLevel = Math.max(0, (product.stockLevel || 0) - quantity)
  const newStatus = newLevel === 0 ? "out_of_stock" : newLevel <= 5 ? "low_stock" : "in_stock"

  await db
    .update(products)
    .set({ stockLevel: newLevel, stockStatus: newStatus, updatedAt: new Date() })
    .where(eq(products.id, productId))
  return true
}

// ============================================================
// Shipping helpers (kept for compatibility)
// ============================================================
const FREE_SHIPPING_THRESHOLD = 30
const STANDARD_SHIPPING_PRICE = 2

export function calculateShipping(subtotal: number): number {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_PRICE
}

export function isFreeShipping(subtotal: number): boolean {
  return subtotal >= FREE_SHIPPING_THRESHOLD
}

// ============================================================
// Settings
// ============================================================
export async function getSettings(): Promise<Record<string, any>> {
  const rows = await db.select().from(siteSettings)
  const map: Record<string, any> = {}
  for (const r of rows) map[r.key] = r.value
  return map
}

export async function setSetting(key: string, value: unknown): Promise<void> {
  await db
    .insert(siteSettings)
    .values({ key, value: value as any, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: siteSettings.key,
      set: { value: value as any, updatedAt: new Date() },
    })
}

// ============================================================
// Newsletter
// ============================================================
export async function findSubscriberByEmail(email: string) {
  return db.query.newsletterSubscribers.findFirst({
    where: eq(newsletterSubscribers.email, email),
  })
}

export async function addSubscriber(email: string, source = "website") {
  return db
    .insert(newsletterSubscribers)
    .values({ email, status: "active", source })
    .onConflictDoUpdate({
      target: newsletterSubscribers.email,
      set: { status: "active", subscribedAt: new Date() },
    })
}
