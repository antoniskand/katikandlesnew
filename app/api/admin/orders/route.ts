// app/api/admin/orders/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { getServerClient } from "@/lib/supabase-api"

export async function GET(request: NextRequest) {
  const supabase = getServerClient()
  const { searchParams } = new URL(request.url)

  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "50")
  const status = searchParams.get("status")
  const offset = (page - 1) * limit

  let query = supabase
    .from("orders")
    .select("*", { count: "exact" })

  if (status) query = query.eq("status", status)

  query = query.order("created_at", { ascending: false }).range(offset, offset + limit - 1)

  const { data, error, count } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Fetch items for each order
  const orderIds = (data || []).map((o: any) => o.id)
  const { data: allItems } = await supabase
    .from("order_items")
    .select("*")
    .in("order_id", orderIds)

  const ordersWithItems = (data || []).map((order: any) => ({
    ...order,
    items: (allItems || []).filter((item: any) => item.order_id === order.id),
  }))

  return NextResponse.json({ results: ordersWithItems, count: count || 0 })
}

export async function PUT(request: NextRequest) {
  const supabase = getServerClient()
  const body = await request.json()
  const { id, ...updateData } = body

  const { data, error } = await supabase.from("orders").update(updateData).eq("id", id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, order: data })
}
