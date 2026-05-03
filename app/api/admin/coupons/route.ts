import { type NextRequest, NextResponse } from "next/server"
import { desc } from "drizzle-orm"
import { db } from "@/lib/db"
import { coupons } from "@/lib/db/schema"

export async function GET() {
  const rows = await db.select().from(coupons).orderBy(desc(coupons.createdAt))
  return NextResponse.json(rows)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const [coupon] = await db
    .insert(coupons)
    .values({
      code: String(body.code).toUpperCase().trim(),
      name: body.name,
      description: body.description,
      discountType: body.discount_type,
      discountAmount: body.discount_amount != null ? String(body.discount_amount) : null,
      discountPercent: body.discount_percent != null ? String(body.discount_percent) : null,
      minOrderAmount: body.min_order_amount != null ? String(body.min_order_amount) : null,
      maxUses: body.max_uses,
      timesUsed: body.times_used ?? 0,
      active: body.active !== false,
      startsAt: body.starts_at ? new Date(body.starts_at) : null,
      expiresAt: body.expires_at ? new Date(body.expires_at) : null,
    })
    .returning()
  return NextResponse.json({ success: true, coupon })
}
