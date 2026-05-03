import { type NextRequest, NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import { getStripeClient, STRIPE_WEBHOOK_SECRET } from "@/lib/stripe"
import { db } from "@/lib/db"
import { orderItems, orders } from "@/lib/db/schema"
import { decrementStock, incrementCouponUsage } from "@/lib/db-queries"

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

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object
      const orderId = session.metadata?.order_id
      if (!orderId) break

      await db
        .update(orders)
        .set({
          status: "paid",
          paymentStatus: "completed",
          stripeSessionId: session.id,
          stripePaymentIntentId: session.payment_intent as string,
          updatedAt: new Date(),
        })
        .where(eq(orders.id, orderId))

      // Decrement stock for each item
      const items = await db
        .select({
          productId: orderItems.productId,
          variantId: orderItems.variantId,
          quantity: orderItems.quantity,
        })
        .from(orderItems)
        .where(eq(orderItems.orderId, orderId))

      for (const item of items) {
        if (item.productId) {
          await decrementStock(item.productId, item.quantity, item.variantId ?? undefined)
        }
      }

      // Increment coupon usage if any
      const order = await db.query.orders.findFirst({
        where: eq(orders.id, orderId),
        columns: { couponId: true },
      })
      if (order?.couponId) {
        await incrementCouponUsage(order.couponId)
      }
      break
    }

    case "checkout.session.expired":
    case "checkout.session.async_payment_failed": {
      const session = event.data.object
      const orderId = session.metadata?.order_id
      if (!orderId) break
      await db
        .update(orders)
        .set({ status: "cancelled", paymentStatus: "failed", updatedAt: new Date() })
        .where(eq(orders.id, orderId))
      break
    }

    case "charge.refunded": {
      const charge = event.data.object
      const intent =
        typeof charge.payment_intent === "string"
          ? charge.payment_intent
          : charge.payment_intent?.id
      if (!intent) break
      await db
        .update(orders)
        .set({ status: "refunded", paymentStatus: "refunded", updatedAt: new Date() })
        .where(eq(orders.stripePaymentIntentId, intent))
      break
    }
  }

  return NextResponse.json({ received: true })
}
