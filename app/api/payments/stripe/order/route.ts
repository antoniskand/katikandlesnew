import { type NextRequest, NextResponse } from "next/server"
import { getServerClient } from "@/lib/supabase-api"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get("session_id")
  if (!sessionId) {
    return NextResponse.json({ error: "session_id required" }, { status: 400 })
  }

  const supabase = getServerClient()
  const { data: order } = await supabase
    .from("orders")
    .select("id, order_number, customer_email, grand_total, status")
    .eq("stripe_session_id", sessionId)
    .single()

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 })
  }

  return NextResponse.json({ order })
}
