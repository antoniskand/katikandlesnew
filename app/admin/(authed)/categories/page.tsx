import { getSupabaseServiceClient } from "@/lib/supabase-server"
import { AdminPageHeader } from "@/components/admin/page-header"
import { SimpleCrudList } from "@/components/admin/simple-crud-list"

export const dynamic = "force-dynamic"

export default async function CategoriesAdmin() {
  const supabase = getSupabaseServiceClient()
  const { data } = await supabase.from("categories").select("*").order("sort_order")

  return (
    <div>
      <AdminPageHeader eyebrow="catalog" title="Κατηγορίες" />
      <SimpleCrudList
        endpoint="/api/admin/categories"
        rows={data || []}
        itemNoun="κατηγορίας"
        newDefaults={{ sort_order: 0 }}
        columns={[
          { key: "name", label: "Όνομα", required: true },
          { key: "slug", label: "Slug", required: true },
          { key: "description", label: "Περιγραφή", hideInList: true },
          { key: "image_url", label: "Image URL", hideInList: true },
          { key: "sort_order", label: "Σειρά", type: "number" },
        ]}
      />
    </div>
  )
}
