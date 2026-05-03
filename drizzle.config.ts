import { defineConfig } from "drizzle-kit"
import { config } from "dotenv"

// Load env vars from .env.local (created by `vercel env pull`)
config({ path: ".env.local" })

const databaseUrl = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL

if (!databaseUrl) {
  throw new Error("Set DATABASE_URL or NEON_DATABASE_URL")
}

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: databaseUrl },
  verbose: true,
  strict: true,
})
