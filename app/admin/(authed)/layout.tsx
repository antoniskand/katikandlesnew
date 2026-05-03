import type { ReactNode } from "react"
import { redirect } from "next/navigation"
import { AdminShell } from "@/components/admin/admin-shell"
import { getAdminUser } from "@/lib/supabase-server"

export default async function AuthedAdminLayout({ children }: { children: ReactNode }) {
  const admin = await getAdminUser()
  if (!admin) redirect("/admin/login")

  return <AdminShell admin={admin}>{children}</AdminShell>
}
