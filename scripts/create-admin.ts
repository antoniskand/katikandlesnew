// scripts/create-admin.ts
// Add an email to the admin allowlist. No password — login is via magic link.
//
// Usage:
//   pnpm tsx scripts/create-admin.ts you@example.com 'Antonis' owner
//
// DATABASE_URL must be set.

import { db } from "@/lib/db"
import { adminUsers } from "@/lib/db/schema"

async function main() {
  const [, , emailArg, nameArg = null, roleArg = "owner"] = process.argv

  if (!emailArg) {
    console.error("Usage: pnpm tsx scripts/create-admin.ts <email> [displayName] [role]")
    process.exit(1)
  }

  const email = emailArg.toLowerCase().trim()

  const [row] = await db
    .insert(adminUsers)
    .values({
      email,
      displayName: nameArg ?? undefined,
      role: roleArg,
    })
    .onConflictDoUpdate({
      target: adminUsers.email,
      set: {
        displayName: nameArg ?? undefined,
        role: roleArg,
      },
    })
    .returning()

  console.log("Admin saved:", { id: row.id, email: row.email, role: row.role })
  console.log("→ Sign in at /admin/login with this email; you'll get a magic link.")
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
