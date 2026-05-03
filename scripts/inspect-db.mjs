// Quick read-only inspection of the Neon DB.
import { neon } from "@neondatabase/serverless"
import { config } from "dotenv"

config({ path: ".env.local" })

const url = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL
if (!url) throw new Error("No DB url")
const sql = neon(url)

const cols = await sql`
  SELECT column_name, data_type, column_default, is_nullable
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'admin_users'
  ORDER BY ordinal_position
`
console.log("admin_users columns:", cols)

const ext = await sql`SELECT extname FROM pg_extension`
console.log("Extensions:", ext.map((e) => e.extname))
