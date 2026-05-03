// lib/db/index.ts
// Neon serverless + Drizzle client.

import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import * as schema from "./schema"

const url = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL

if (!url) {
  // Don't crash at module load (e.g. during certain build phases). The neon()
  // call below with an empty string returns a function that errors on first
  // use, which gives a clearer runtime error than a build-time crash.
  console.warn(
    "DATABASE_URL / NEON_DATABASE_URL is not set. Database calls will fail at runtime.",
  )
}

const client = neon(url || "postgresql://invalid")

// Real Drizzle instance — needed because @auth/drizzle-adapter inspects this
// object's internals to detect the SQL dialect. A Proxy breaks that detection.
export const db = drizzle(client, { schema })

export { schema }
export * from "./schema"
