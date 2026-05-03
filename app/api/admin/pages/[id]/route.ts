import { type NextRequest, NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { pages } from "@/lib/db/schema"


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
  if (body.content !== undefined) update.content = body.content
  if (body.meta_description !== undefined) update.metaDescription = body.meta_description
  if (body.active !== undefined) update.active = body.active

  const [page] = await db.update(pages).set(update).where(eq(pages.id, id)).returning()
  return NextResponse.json({ success: true, page })
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params
  await db.delete(pages).where(eq(pages.id, id))
  return NextResponse.json({ success: true })
}
