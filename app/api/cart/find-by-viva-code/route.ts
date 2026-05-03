// app/api/cart/find-by-viva-code/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { getOrderByVivaCode } from "@/lib/supabase-api"

export async function GET(request: NextRequest) {
  const vivaOrderCode = request.nextUrl.searchParams.get("vivaOrderCode")
  if (!vivaOrderCode) {
    return NextResponse.json({ error: "Viva order code required" }, { status: 400 })
  }
  return findOrder(vivaOrderCode)
}

export async function POST(request: NextRequest) {
  const { vivaOrderCode } = await request.json()
  if (!vivaOrderCode) {
    return NextResponse.json({ error: "Viva order code required" }, { status: 400 })
  }
  return findOrder(vivaOrderCode)
}

async function findOrder(vivaOrderCode: string) {
  try {
    const order = await getOrderByVivaCode(vivaOrderCode)

    if (!order) {
      return NextResponse.json({
        order: null,
        message: "Order not found",
        vivaOrderCode,
      })
    }

    return NextResponse.json({
      order: {
        id: order.id,
        number: order.order_number,
        grand_total: order.grand_total,
        items: order.items,
        account: {
          email: order.customer_email,
          first_name: order.customer_first_name,
          last_name: order.customer_last_name,
        },
        status: order.status,
        payment_status: order.payment_status,
      },
      message: "Order found",
      vivaOrderCode,
    })
  } catch (error) {
    console.error("Error finding order:", error)
    return NextResponse.json({ error: "Failed to find order" }, { status: 500 })
  }
}
