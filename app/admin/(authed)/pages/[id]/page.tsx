import { notFound } from "next/navigation"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { pages } from "@/lib/db/schema"
import { AdminPageHeader } from "@/components/admin/page-header"
import { PageForm } from "@/components/admin/page-form"

export const dynamic = "force-dynamic"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditPageRoute({ params }: PageProps) {
  const { id } = await params
  const page = await db.query.pages.findFirst({ where: eq(pages.id, id) })
  if (!page) notFound()

  return (
    <div>
      <AdminPageHeader
        eyebrow="cms"
        title={page.name}
        back={{ href: "/admin/pages", label: "πίσω στις σελίδες" }}
      />
      <PageForm
        initial={{
          id: page.id,
          name: page.name,
          slug: page.slug,
          content: page.content ?? "",
          meta_description: page.metaDescription ?? "",
          active: page.active,
        }}
      />
    </div>
  )
}
