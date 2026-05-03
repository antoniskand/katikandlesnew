import { type NextRequest, NextResponse } from "next/server"
import { desc, eq, inArray, sql } from "drizzle-orm"
import { db } from "@/lib/db"
import { orderItems, orders } from "@/lib/db/schema"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "50")
  const status = searchParams.get("status")
  const offset = (page - 1) * limit

  const where = status ? eq(orders.status, status) : undefined

  const rows = await db
    .select()
    .from(orders)
    .where(where)
    .orderBy(desc(orders.createdAt))
    .limit(limit)
    .offset(offset)

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(orders)
    .where(where)

  const ids = rows.map((o) => o.id)
  const items = ids.length
    ? await db.select().from(orderItems).where(inArray(orderItems.orderId, ids))
    : []

  const ordersWithItems = rows.map((o) => ({
    ...o,
    items: items.filter((i) => i.orderId === o.id),
  }))

  return NextResponse.json({ results: ordersWithItems, count: Number(count) || 0 })
}
