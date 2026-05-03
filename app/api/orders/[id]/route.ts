// app/api/orders/[id]/route.ts
import { NextResponse } from "next/server"
import { getOrder } from "@/lib/supabase-api"

export const dynamic = "force-dynamic"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id: orderId } = params

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 })
    }

    const order = await getOrder(orderId)

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error("Error fetching order:", error)
    return NextResponse.json(
      { error: `Failed to fetch order: ${error instanceof Error ? error.message : "Unknown"}` },
      { status: 500 }
    )
  }
}
