import { type NextRequest, NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { categories } from "@/lib/db/schema"


export const dynamic = "force-dynamic"

interface Ctx {
  params: Promise<{ id: string }>
}

export async function PUT(request: NextRequest, { params }: Ctx) {
  const { id } = await params
  const body = await request.json()

  const update: Record<string, unknown> = { updatedAt: new Date() }
  if (body.name !== undefined) update.name = body.name
  if (body.slug !== undefined) update.slug = body.slug
  if (body.description !== undefined) update.description = body.description
  if (body.image_url !== undefined) update.imageUrl = body.image_url
  if (body.sort_order !== undefined) update.sortOrder = body.sort_order

  const [category] = await db
    .update(categories)
    .set(update)
    .where(eq(categories.id, id))
    .returning()
  return NextResponse.json({ success: true, category })
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params
  await db.delete(categories).where(eq(categories.id, id))
  return NextResponse.json({ success: true })
}
