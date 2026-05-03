// Add (or upsert) an email to the admin_users allowlist.
// Usage: node scripts/add-admin.mjs you@example.com 'Antonis' owner
import { neon } from "@neondatabase/serverless"
import { config } from "dotenv"

config({ path: ".env.local" })

const url = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL
if (!url) throw new Error("Set DATABASE_URL or NEON_DATABASE_URL in .env.local")

const [, , emailArg, nameArg, roleArg = "owner"] = process.argv
if (!emailArg) {
  console.error("Usage: node scripts/add-admin.mjs <email> [displayName] [role]")
  process.exit(1)
}

const email = emailArg.toLowerCase().trim()
const sql = neon(url)

const [row] = await sql`
  INSERT INTO admin_users (email, display_name, role)
  VALUES (${email}, ${nameArg ?? null}, ${roleArg})
  ON CONFLICT (email) DO UPDATE
    SET display_name = EXCLUDED.display_name, role = EXCLUDED.role
  RETURNING id, email, display_name, role
`

console.log("✓ Admin saved:", row)
console.log("→ Sign in at /admin/login με αυτό το email — θα έρθει magic link.")
