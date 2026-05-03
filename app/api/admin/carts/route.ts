// app/api/admin/carts/route.ts
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
    .from("carts")
    .select("*", { count: "exact" })

  if (status && status !== "") query = query.eq("status", status)

  query = query.order("last_activity", { ascending: false }).range(offset, offset + limit - 1)

  const { data, error, count } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Fetch items for each cart
  const cartIds = (data || []).map((c: any) => c.id)
  const { data: allItems } = await supabase
    .from("cart_items")
    .select("*")
    .in("cart_id", cartIds)

  const cartsWithItems = (data || []).map((cart: any) => ({
    ...cart,
    items: (allItems || []).filter((item: any) => item.cart_id === cart.id),
  }))

  return NextResponse.json({ results: cartsWithItems, count: count || 0 })
}
