import { type NextRequest, NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { drops } from "@/lib/db/schema"

interface Ctx {
  params: Promise<{ id: string }>
}

export async function PUT(request: NextRequest, { params }: Ctx) {
  const { id } = await params
  try {
    const body = await request.json()
    const update: Record<string, unknown> = { updatedAt: new Date() }
    if (body.name !== undefined) update.name = body.name
    if (body.slug !== undefined) update.slug = body.slug
    if (body.tagline !== undefined) update.tagline = body.tagline
    if (body.description !== undefined) update.description = body.description
    if (body.badge_text !== undefined) update.badgeText = body.badge_text
    if (body.starts_at !== undefined)
      update.startsAt = body.starts_at ? new Date(body.starts_at) : null
    if (body.ends_at !== undefined)
      update.endsAt = body.ends_at ? new Date(body.ends_at) : null
    if (body.hero_image_url !== undefined) update.heroImageUrl = body.hero_image_url
    if (body.background_color !== undefined) update.backgroundColor = body.background_color
    if (body.active !== undefined) update.active = body.active
    if (body.featured !== undefined) update.featured = body.featured
    if (body.product_ids !== undefined) update.productIds = body.product_ids
    if (body.sort_order !== undefined) update.sortOrder = body.sort_order

    const [drop] = await db.update(drops).set(update).where(eq(drops.id, id)).returning()
    return NextResponse.json({ success: true, drop })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 500 },
    )
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params
  await db.delete(drops).where(eq(drops.id, id))
  return NextResponse.json({ success: true })
}
