// lib/db/index.ts
// Neon serverless + Drizzle client.

import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import * as schema from "./schema"

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  // Allow build to succeed without DATABASE_URL, but fail fast at runtime.
  if (process.env.NODE_ENV === "production") {
    console.warn("DATABASE_URL is not set. Database calls will fail.")
  }
}

const client = neon(databaseUrl || "")

export const db = drizzle(client, { schema })

export { schema }
export * from "./schema"
