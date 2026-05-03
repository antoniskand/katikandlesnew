import { desc, eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { products } from "@/lib/db/schema"
import { AdminPageHeader } from "@/components/admin/page-header"
import { DropForm } from "@/components/admin/drop-form"

export const dynamic = "force-dynamic"

export default async function NewDropPage() {
  const rows = await db
    .select({ id: products.id, name: products.name, images: products.images })
    .from(products)
    .where(eq(products.active, true))
    .orderBy(desc(products.createdAt))

  return (
    <div>
      <AdminPageHeader
        eyebrow="releases"
        title="Νέο drop"
        back={{ href: "/admin/drops", label: "πίσω στα drops" }}
      />
      <DropForm products={rows as any} />
    </div>
  )
}
