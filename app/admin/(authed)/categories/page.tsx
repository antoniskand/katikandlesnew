import { asc } from "drizzle-orm"
import { db } from "@/lib/db"
import { categories } from "@/lib/db/schema"
import { AdminPageHeader } from "@/components/admin/page-header"
import { SimpleCrudList } from "@/components/admin/simple-crud-list"

export const dynamic = "force-dynamic"

export default async function CategoriesAdmin() {
  const rows = await db.select().from(categories).orderBy(asc(categories.sortOrder))

  // Map db column names → API/form field names so SimpleCrudList works as before
  const data = rows.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description ?? "",
    image_url: c.imageUrl ?? "",
    sort_order: c.sortOrder,
  }))

  return (
    <div>
      <AdminPageHeader eyebrow="catalog" title="Κατηγορίες" />
      <SimpleCrudList
        endpoint="/api/admin/categories"
        rows={data}
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
