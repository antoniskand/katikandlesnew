// app/api/payments/viva/webhook/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { isValidVivaIP } from "@/lib/vivapayments"
import { getOrderByVivaCode, getOrderByVivaTransaction, updateOrderStatus, decrementStock, getServerClient } from "@/lib/supabase-api"

// GET: Viva webhook verification
export async function GET() {
  try {
    const merchantId = process.env.VIVA_MERCHANT_ID
    const apiKey = process.env.VIVA_API_KEY

    if (!merchantId || !apiKey) {
      return NextResponse.json({ error: "Missing credentials" }, { status: 500 })
    }

    const credentials = Buffer.from(`${merchantId}:${apiKey}`).toString("base64")
    const vivaUrl =
      process.env.VIVA_ENVIRONMENT === "production"
        ? "https://www.vivapayments.com/api/messages/config/token"
        : "https://demo.vivapayments.com/api/messages/config/token"

    const response = await fetch(vivaUrl, {
      method: "GET",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to get verification key" }, { status: 500 })
    }

    const data = await response.json()
    return NextResponse.json({ key: data.Key }, { status: 200 })
  } catch {
    return NextResponse.json({ error: "Verification failed" }, { status: 500 })
  }
}

// POST: Handle payment webhook
export async function POST(request: NextRequest) {
  try {
    // IP validation
    const clientIP = request.headers.get("x-forwarded-for") || request.ip || "unknown"
    if (!isValidVivaIP(clientIP)) {
      console.error("Viva webhook: unauthorized IP:", clientIP)
      return NextResponse.json({ error: "Unauthorized IP" }, { status: 403 })
    }

    const body = await request.json()
    const { EventTypeId, EventData, CorrelationId } = body

    // Only process successful payment events
    if (EventTypeId !== 1796 || EventData?.StatusId !== "F") {
      return NextResponse.json({ message: "Event received but not a successful payment." }, { status: 200 })
    }

    const vivaOrderCode = EventData.OrderCode.toString()
    const transactionId = EventData.TransactionId

    console.log(`Viva webhook: Processing payment for order code ${vivaOrderCode}, tx ${transactionId}`)

    // Check if already processed
    const existingOrder = await getOrderByVivaTransaction(transactionId)
    if (existingOrder && existingOrder.payment_status === "completed") {
      console.log("Viva webhook: Order already processed for transaction", transactionId)
      return NextResponse.json({
        message: "Order already processed",
        order_id: existingOrder.id,
      })
    }

    // Find the pending order by Viva order code
    const order = await getOrderByVivaCode(vivaOrderCode)
    if (!order) {
      console.error("Viva webhook: Order not found for code", vivaOrderCode)
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Update order to paid
    const updatedOrder = await updateOrderStatus(order.id, "paid", "completed", {
      viva_transaction_id: transactionId,
      metadata: {
        ...order.metadata,
        viva_correlation_id: CorrelationId,
        webhook_processed_at: new Date().toISOString(),
      },
    })

    if (!updatedOrder) {
      console.error("Viva webhook: Failed to update order", order.id)
      return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
    }

    // Decrement stock for each item
    if (order.items && order.items.length > 0) {
      for (const item of order.items) {
        if (item.product_id) {
          await decrementStock(item.product_id, item.quantity, item.variant_id || undefined)
        }
      }
    }

    console.log(`Viva webhook: Order ${order.order_number} marked as paid`)

    return NextResponse.json({
      message: "Webhook processed successfully",
      order_id: order.id,
      order_number: order.order_number,
    })
  } catch (error) {
    console.error("Viva webhook error:", error instanceof Error ? error.message : error)
    return NextResponse.json({ message: "Webhook processing failed" }, { status: 500 })
  }
}
