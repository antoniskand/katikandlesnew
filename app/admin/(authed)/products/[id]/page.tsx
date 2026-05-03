import { notFound } from "next/navigation"
import { asc, eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { categories, productCategories, products } from "@/lib/db/schema"
import { AdminPageHeader } from "@/components/admin/page-header"
import { ProductForm } from "@/components/admin/product-form"

export const dynamic = "force-dynamic"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditProductPage({ params }: PageProps) {
  const { id } = await params

  const [product, cats, links] = await Promise.all([
    db.query.products.findFirst({ where: eq(products.id, id) }),
    db.select().from(categories).orderBy(asc(categories.sortOrder)),
    db
      .select({ categoryId: productCategories.categoryId })
      .from(productCategories)
      .where(eq(productCategories.productId, id)),
  ])

  if (!product) notFound()

  const categoryIds = links.map((r) => r.categoryId)

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
          description: product.description ?? "",
          price: Number(product.price),
          sale_price: product.salePrice != null ? Number(product.salePrice) : null,
          currency: product.currency,
          images: Array.isArray(product.images) ? (product.images as any[]) : [],
          stock_status: product.stockStatus,
          stock_level: product.stockLevel ?? 0,
          stock_tracking: !!product.stockTracking,
          active: product.active,
          categoryIds,
        }}
        categories={cats}
      />
    </div>
  )
}
