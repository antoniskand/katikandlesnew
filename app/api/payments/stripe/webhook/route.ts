import { type NextRequest, NextResponse } from "next/server"
import { getStripeClient, STRIPE_WEBHOOK_SECRET } from "@/lib/stripe"
import { getServerClient, decrementStock, incrementCouponUsage } from "@/lib/supabase-api"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get("stripe-signature")

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 })
  }

  const stripe = getStripeClient()
  let event
  try {
    event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error("Webhook signature verification failed:", err)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  const supabase = getServerClient()

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object
      const orderId = session.metadata?.order_id
      if (!orderId) break

      // Update order
      await supabase
        .from("orders")
        .update({
          status: "paid",
          payment_status: "completed",
          stripe_session_id: session.id,
          stripe_payment_intent_id: session.payment_intent as string,
        })
        .eq("id", orderId)

      // Decrement stock
      const { data: items } = await supabase
        .from("order_items")
        .select("product_id, variant_id, quantity")
        .eq("order_id", orderId)

      for (const item of items || []) {
        if (item.product_id) {
          await decrementStock(item.product_id, item.quantity, item.variant_id)
        }
      }

      // Increment coupon usage
      const { data: order } = await supabase
        .from("orders")
        .select("coupon_id")
        .eq("id", orderId)
        .single()

      if (order?.coupon_id) {
        await incrementCouponUsage(order.coupon_id)
      }
      break
    }

    case "checkout.session.expired":
    case "checkout.session.async_payment_failed": {
      const session = event.data.object
      const orderId = session.metadata?.order_id
      if (!orderId) break
      await supabase
        .from("orders")
        .update({ status: "cancelled", payment_status: "failed" })
        .eq("id", orderId)
      break
    }

    case "charge.refunded": {
      const charge = event.data.object
      const intent = typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id
      if (!intent) break
      await supabase
        .from("orders")
        .update({ status: "refunded", payment_status: "refunded" })
        .eq("stripe_payment_intent_id", intent)
      break
    }
  }

  return NextResponse.json({ received: true })
}
