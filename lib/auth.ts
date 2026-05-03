// lib/auth.ts
// Server-only auth helpers built on Stack Auth + the admin_users table.

import "server-only"
import { eq } from "drizzle-orm"
import { stackServerApp } from "@/stack"
import { db } from "@/lib/db"
import { adminUsers, type AdminUser } from "@/lib/db/schema"

/**
 * Get the currently signed-in Stack user (or null).
 * Use in server components / route handlers.
 */
export async function getCurrentUser() {
  return await stackServerApp.getUser()
}

/**
 * Get the current user *and* check it has an admin_users row.
 * Returns null if not signed in or not an admin.
 */
export async function getAdminUser(): Promise<
  (AdminUser & { stackId: string }) | null
> {
  const user = await stackServerApp.getUser()
  if (!user) return null

  // Look up by id (Stack user id stored as text)
  const row = await db.query.adminUsers.findFirst({
    where: eq(adminUsers.id, user.id),
  })
  if (!row) return null

  return { ...row, stackId: user.id }
}

/**
 * Throw 401 if no admin session.
 */
export async function requireAdmin() {
  const admin = await getAdminUser()
  if (!admin) throw new Error("UNAUTHORIZED")
  return admin
}
