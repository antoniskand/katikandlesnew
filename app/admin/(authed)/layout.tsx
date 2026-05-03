import type { ReactNode } from "react"
import { redirect } from "next/navigation"
import { AdminShell } from "@/components/admin/admin-shell"
import { getAdminUser, getCurrentUser } from "@/lib/auth"

export default async function AuthedAdminLayout({
  children,
}: {
  children: ReactNode
}) {
  const stackUser = await getCurrentUser()

  // Not signed in at all → login
  if (!stackUser) redirect("/admin/login")

  // Signed in but not in admin_users → kick out
  const admin = await getAdminUser()
  if (!admin) redirect("/admin/login?error=not_admin")

  return (
    <AdminShell
      admin={{
        id: admin.id,
        email: admin.email,
        role: admin.role as "owner" | "admin" | "editor",
        display_name: admin.displayName ?? undefined,
      }}
    >
      {children}
    </AdminShell>
  )
}
