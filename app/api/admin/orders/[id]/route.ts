import { type NextRequest, NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { orders } from "@/lib/db/schema"

interface Ctx {
  params: Promise<{ id: string }>
}

export async function PUT(request: NextRequest, { params }: Ctx) {
  const { id } = await params
  const body = await request.json()

  const update: Record<string, unknown> = { updatedAt: new Date() }
  if (body.status !== undefined) update.status = body.status
  if (body.payment_status !== undefined) update.paymentStatus = body.payment_status
  if (body.notes !== undefined) update.notes = body.notes

  const [order] = await db.update(orders).set(update).where(eq(orders.id, id)).returning()
  return NextResponse.json({ success: true, order })
}
