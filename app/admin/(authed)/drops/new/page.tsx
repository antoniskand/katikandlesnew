import { getSupabaseServiceClient } from "@/lib/supabase-server"
import { AdminPageHeader } from "@/components/admin/page-header"
import { DropForm } from "@/components/admin/drop-form"

export const dynamic = "force-dynamic"

export default async function NewDropPage() {
  const supabase = getSupabaseServiceClient()
  const { data: products } = await supabase
    .from("products")
    .select("id, name, images")
    .eq("active", true)
    .order("created_at", { ascending: false })

  return (
    <div>
      <AdminPageHeader
        eyebrow="releases"
        title="Νέο drop"
        back={{ href: "/admin/drops", label: "πίσω στα drops" }}
      />
      <DropForm products={(products as any) || []} />
    </div>
  )
}
