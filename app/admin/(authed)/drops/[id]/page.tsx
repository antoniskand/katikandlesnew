import { notFound } from "next/navigation"
import { desc, eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { drops, products } from "@/lib/db/schema"
import { AdminPageHeader } from "@/components/admin/page-header"
import { DropForm } from "@/components/admin/drop-form"

export const dynamic = "force-dynamic"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditDropPage({ params }: PageProps) {
  const { id } = await params

  const [drop, productRows] = await Promise.all([
    db.query.drops.findFirst({ where: eq(drops.id, id) }),
    db
      .select({ id: products.id, name: products.name, images: products.images })
      .from(products)
      .where(eq(products.active, true))
      .orderBy(desc(products.createdAt)),
  ])

  if (!drop) notFound()

  return (
    <div>
      <AdminPageHeader
        eyebrow="releases"
        title={drop.name}
        back={{ href: "/admin/drops", label: "πίσω στα drops" }}
      />
      <DropForm
        initial={{
          ...drop,
          background_color: drop.backgroundColor,
          product_ids: Array.isArray(drop.productIds) ? drop.productIds : [],
          starts_at: drop.startsAt instanceof Date ? drop.startsAt.toISOString() : null,
          ends_at: drop.endsAt instanceof Date ? drop.endsAt.toISOString() : null,
          hero_image_url: drop.heroImageUrl,
          badge_text: drop.badgeText,
          sort_order: drop.sortOrder,
        }}
        products={productRows as any}
      />
    </div>
  )
}
