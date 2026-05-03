import type { ReactNode } from "react"
import { redirect } from "next/navigation"
import { AdminShell } from "@/components/admin/admin-shell"
import { getAdminUser } from "@/lib/auth"

export default async function AuthedAdminLayout({
  children,
}: {
  children: ReactNode
}) {
  const admin = await getAdminUser()
  if (!admin) redirect("/admin/login")

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
