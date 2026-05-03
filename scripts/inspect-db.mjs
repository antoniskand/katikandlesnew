// Quick read-only inspection of the Neon DB.
import "dotenv/config"
import { neon } from "@neondatabase/serverless"
import { config } from "dotenv"

config({ path: ".env.local" })

const url = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL
if (!url) throw new Error("No DB url")

const sql = neon(url)

const tables = await sql`
  SELECT table_name FROM information_schema.tables
  WHERE table_schema = 'public'
  ORDER BY table_name
`
console.log("Tables:", tables.map((t) => t.table_name))

if (tables.find((t) => t.table_name === "categories")) {
  const cats = await sql`SELECT id, name, slug FROM categories ORDER BY sort_order`
  console.log("Categories:", cats)
}

const constraints = await sql`
  SELECT tc.table_name, tc.constraint_name, tc.constraint_type
  FROM information_schema.table_constraints tc
  WHERE tc.table_schema = 'public' AND tc.constraint_type = 'UNIQUE'
  ORDER BY table_name
`
console.log("Unique constraints:", constraints)
