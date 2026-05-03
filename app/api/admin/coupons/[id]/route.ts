import { type NextRequest, NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { coupons } from "@/lib/db/schema"


export const dynamic = "force-dynamic"

interface Ctx {
  params: Promise<{ id: string }>
}

export async function PUT(request: NextRequest, { params }: Ctx) {
  const { id } = await params
  const body = await request.json()

  const update: Record<string, unknown> = {}
  if (body.code !== undefined) update.code = String(body.code).toUpperCase().trim()
  if (body.name !== undefined) update.name = body.name
  if (body.description !== undefined) update.description = body.description
  if (body.discount_type !== undefined) update.discountType = body.discount_type
  if (body.discount_amount !== undefined)
    update.discountAmount = body.discount_amount == null ? null : String(body.discount_amount)
  if (body.discount_percent !== undefined)
    update.discountPercent = body.discount_percent == null ? null : String(body.discount_percent)
  if (body.min_order_amount !== undefined)
    update.minOrderAmount = body.min_order_amount == null ? null : String(body.min_order_amount)
  if (body.max_uses !== undefined) update.maxUses = body.max_uses
  if (body.active !== undefined) update.active = body.active
  if (body.starts_at !== undefined) update.startsAt = body.starts_at ? new Date(body.starts_at) : null
  if (body.expires_at !== undefined) update.expiresAt = body.expires_at ? new Date(body.expires_at) : null

  const [coupon] = await db.update(coupons).set(update).where(eq(coupons.id, id)).returning()
  return NextResponse.json({ success: true, coupon })
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params
  await db.delete(coupons).where(eq(coupons.id, id))
  return NextResponse.json({ success: true })
}
