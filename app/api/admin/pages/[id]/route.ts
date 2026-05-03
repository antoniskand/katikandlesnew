import { type NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { pages } from "@/lib/db/schema"


export const dynamic = "force-dynamic"

interface Ctx {
  params: Promise<{ id: string }>
}

// Public surfaces a page row can affect. Pinging them clears the ISR cache
// so editor changes show up immediately instead of waiting on revalidate.
function revalidateForSlug(slug: string | undefined | null) {
  revalidatePath("/")
  if (!slug) return
  if (slug === "about-us" || slug === "about-home") {
    revalidatePath("/about")
  } else if (slug === "terms-privacy") {
    revalidatePath("/terms-privacy")
  } else if (slug === "shipping-returns") {
    revalidatePath("/shipping-returns")
  } else if (slug === "privacy-policy") {
    revalidatePath("/privacy-policy")
  }
  revalidatePath(`/${slug}`)
}

export async function PUT(request: NextRequest, { params }: Ctx) {
  const { id } = await params
  const body = await request.json()

  const update: Record<string, unknown> = { updatedAt: new Date() }
  if (body.name !== undefined) update.name = body.name
  if (body.slug !== undefined) update.slug = body.slug
  if (body.content !== undefined) update.content = body.content
  if (body.meta_description !== undefined) update.metaDescription = body.meta_description
  if (body.active !== undefined) update.active = body.active

  const [page] = await db.update(pages).set(update).where(eq(pages.id, id)).returning()
  revalidateForSlug(page?.slug)
  return NextResponse.json({ success: true, page })
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params
  const [page] = await db.delete(pages).where(eq(pages.id, id)).returning()
  revalidateForSlug(page?.slug)
  return NextResponse.json({ success: true })
}
