import { notFound } from "next/navigation"
import { getSupabaseServiceClient } from "@/lib/supabase-server"
import { AdminPageHeader } from "@/components/admin/page-header"
import { ProductForm } from "@/components/admin/product-form"

export const dynamic = "force-dynamic"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditProductPage({ params }: PageProps) {
  const { id } = await params
  const supabase = getSupabaseServiceClient()

  const [productRes, categoriesRes, linkRes] = await Promise.all([
    supabase.from("products").select("*").eq("id", id).single(),
    supabase.from("categories").select("id, name, slug").order("sort_order"),
    supabase.from("product_categories").select("category_id").eq("product_id", id),
  ])

  if (productRes.error || !productRes.data) notFound()

  const product = productRes.data as any
  const categoryIds = (linkRes.data || []).map((r: any) => r.category_id)

  return (
    <div>
      <AdminPageHeader
        eyebrow="catalog"
        title={`Επεξεργασία: ${product.name}`}
        back={{ href: "/admin/products", label: "πίσω στα προϊόντα" }}
      />
      <ProductForm
        initial={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          description: product.description,
          price: Number(product.price),
          sale_price: product.sale_price ? Number(product.sale_price) : null,
          currency: product.currency,
          images: Array.isArray(product.images) ? product.images : [],
          stock_status: product.stock_status,
          stock_level: product.stock_level,
          stock_tracking: product.stock_tracking,
          active: product.active,
          categoryIds,
        }}
        categories={categoriesRes.data || []}
      />
    </div>
  )
}
