// scripts/create-admin.ts
// One-shot helper to create the first admin user.
// Usage:
//   pnpm tsx scripts/create-admin.ts you@example.com 'YourStrongPassword' 'Antonis' owner
//
// Or just run with no args to be prompted (interactive mode is not implemented;
// use args). Make sure DATABASE_URL is set.

import bcrypt from "bcryptjs"
import { db } from "@/lib/db"
import { adminUsers } from "@/lib/db/schema"

async function main() {
  const [, , emailArg, passwordArg, nameArg = null, roleArg = "owner"] =
    process.argv

  if (!emailArg || !passwordArg) {
    console.error(
      "Usage: pnpm tsx scripts/create-admin.ts <email> <password> [displayName] [role]",
    )
    process.exit(1)
  }

  const email = emailArg.toLowerCase().trim()
  const passwordHash = await bcrypt.hash(passwordArg, 12)

  const [user] = await db
    .insert(adminUsers)
    .values({
      email,
      passwordHash,
      displayName: nameArg ?? undefined,
      role: roleArg,
    })
    .onConflictDoUpdate({
      target: adminUsers.email,
      set: { passwordHash, displayName: nameArg ?? undefined, role: roleArg },
    })
    .returning()

  console.log("Admin saved:", { id: user.id, email: user.email, role: user.role })
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
