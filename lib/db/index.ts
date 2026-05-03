// lib/db/index.ts
// Neon serverless + Drizzle client.
//
// Lazily-initialised so that importing this module at build time (e.g. during
// `next build` page-data collection) doesn't call `neon()` before DATABASE_URL
// is available. The Proxy below defers the connection until the first query.

import { neon } from "@neondatabase/serverless"
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http"
import * as schema from "./schema"

type Db = NeonHttpDatabase<typeof schema>

let cached: Db | null = null

function getDbInstance(): Db {
  if (cached) return cached
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Configure it in Vercel → Settings → Environment Variables.",
    )
  }
  const client = neon(url)
  cached = drizzle(client, { schema })
  return cached
}

export const db: Db = new Proxy({} as Db, {
  get(_target, prop) {
    const instance = getDbInstance() as any
    const value = instance[prop]
    return typeof value === "function" ? value.bind(instance) : value
  },
})

export { schema }
export * from "./schema"
