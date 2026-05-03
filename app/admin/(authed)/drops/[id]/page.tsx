import { notFound } from "next/navigation"
import { getSupabaseServiceClient } from "@/lib/supabase-server"
import { AdminPageHeader } from "@/components/admin/page-header"
import { DropForm } from "@/components/admin/drop-form"

export const dynamic = "force-dynamic"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditDropPage({ params }: PageProps) {
  const { id } = await params
  const supabase = getSupabaseServiceClient()

  const [dropRes, productsRes] = await Promise.all([
    supabase.from("drops").select("*").eq("id", id).single(),
    supabase.from("products").select("id, name, images").eq("active", true).order("created_at", { ascending: false }),
  ])

  if (dropRes.error || !dropRes.data) notFound()

  return (
    <div>
      <AdminPageHeader
        eyebrow="releases"
        title={dropRes.data.name}
        back={{ href: "/admin/drops", label: "πίσω στα drops" }}
      />
      <DropForm initial={dropRes.data} products={(productsRes.data as any) || []} />
    </div>
  )
}
