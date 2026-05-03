import { type NextRequest, NextResponse } from "next/server"
import { getOrderByStripeSession } from "@/lib/db-queries"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get("session_id")
  if (!sessionId) {
    return NextResponse.json({ error: "session_id required" }, { status: 400 })
  }
  const order = await getOrderByStripeSession(sessionId)
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 })
  }
  return NextResponse.json({ order })
}
