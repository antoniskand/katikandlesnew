import { getSupabaseServiceClient } from "@/lib/supabase-server"
import { AdminPageHeader } from "@/components/admin/page-header"
import { ProductForm } from "@/components/admin/product-form"

export const dynamic = "force-dynamic"

export default async function NewProductPage() {
  const supabase = getSupabaseServiceClient()
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("sort_order")

  return (
    <div>
      <AdminPageHeader
        eyebrow="catalog"
        title="Νέο προϊόν"
        back={{ href: "/admin/products", label: "πίσω στα προϊόντα" }}
      />
      <ProductForm categories={categories || []} />
    </div>
  )
}
