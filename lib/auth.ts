// lib/auth.ts
// Server-only helpers backed by NextAuth + admin_users.

import "server-only"
import { eq } from "drizzle-orm"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { adminUsers, type AdminUser } from "@/lib/db/schema"

/** The current NextAuth session (or null). */
export async function getSession() {
  return await auth()
}

/** Quick boolean — is anyone signed in. */
export async function getCurrentUser() {
  const session = await auth()
  return session?.user ?? null
}

/** Look up the admin_users row for the current session. Null if not an admin. */
export async function getAdminUser(): Promise<AdminUser | null> {
  const session = await auth()
  if (!session?.user?.email) return null
  const row = await db.query.adminUsers.findFirst({
    where: eq(adminUsers.email, session.user.email),
  })
  return row ?? null
}

/** Throw if not admin (used in server-side guards). */
export async function requireAdmin() {
  const admin = await getAdminUser()
  if (!admin) throw new Error("UNAUTHORIZED")
  return admin
}
