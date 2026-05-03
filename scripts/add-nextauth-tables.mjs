// Adds the NextAuth (Auth.js) tables required by @auth/drizzle-adapter.
import { neon } from "@neondatabase/serverless"
import { config } from "dotenv"

config({ path: ".env.local" })

const url = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL
if (!url) throw new Error("No DB url")
const sql = neon(url)

await sql`
  CREATE TABLE IF NOT EXISTS "users" (
    id text PRIMARY KEY,
    name text,
    email text UNIQUE,
    "emailVerified" timestamp,
    image text
  )
`
await sql`
  CREATE TABLE IF NOT EXISTS accounts (
    "userId" text NOT NULL REFERENCES "users"(id) ON DELETE CASCADE,
    type text NOT NULL,
    provider text NOT NULL,
    "providerAccountId" text NOT NULL,
    refresh_token text,
    access_token text,
    expires_at int,
    token_type text,
    scope text,
    id_token text,
    session_state text,
    PRIMARY KEY (provider, "providerAccountId")
  )
`
await sql`
  CREATE TABLE IF NOT EXISTS sessions (
    "sessionToken" text PRIMARY KEY,
    "userId" text NOT NULL REFERENCES "users"(id) ON DELETE CASCADE,
    expires timestamp NOT NULL
  )
`
await sql`
  CREATE TABLE IF NOT EXISTS "verificationToken" (
    identifier text NOT NULL,
    token text NOT NULL,
    expires timestamp NOT NULL,
    PRIMARY KEY (identifier, token)
  )
`

console.log("✓ NextAuth tables created (users, accounts, sessions, verificationToken)")

const tables = await sql`
  SELECT table_name FROM information_schema.tables
  WHERE table_schema = 'public'
  ORDER BY table_name
`
console.log("All tables:", tables.map((t) => t.table_name))
