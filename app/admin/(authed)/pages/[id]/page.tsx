import { notFound } from "next/navigation"
import { getSupabaseServiceClient } from "@/lib/supabase-server"
import { AdminPageHeader } from "@/components/admin/page-header"
import { PageForm } from "@/components/admin/page-form"

export const dynamic = "force-dynamic"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditPageRoute({ params }: PageProps) {
  const { id } = await params
  const supabase = getSupabaseServiceClient()
  const { data, error } = await supabase.from("pages").select("*").eq("id", id).single()

  if (error || !data) notFound()

  return (
    <div>
      <AdminPageHeader
        eyebrow="cms"
        title={data.name}
        back={{ href: "/admin/pages", label: "πίσω στις σελίδες" }}
      />
      <PageForm initial={data} />
    </div>
  )
}
