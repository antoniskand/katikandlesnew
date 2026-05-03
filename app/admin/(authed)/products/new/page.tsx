import { asc } from "drizzle-orm"
import { db } from "@/lib/db"
import { categories } from "@/lib/db/schema"
import { AdminPageHeader } from "@/components/admin/page-header"
import { ProductForm } from "@/components/admin/product-form"

export const dynamic = "force-dynamic"

export default async function NewProductPage() {
  const cats = await db.select().from(categories).orderBy(asc(categories.sortOrder))

  return (
    <div>
      <AdminPageHeader
        eyebrow="catalog"
        title="Νέο προϊόν"
        back={{ href: "/admin/products", label: "πίσω στα προϊόντα" }}
      />
      <ProductForm categories={cats} />
    </div>
  )
}
