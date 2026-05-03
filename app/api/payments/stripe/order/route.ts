// app/api/payments/stripe/order/route.ts
//
// Used by the /checkout/success page right after Stripe redirects back.
//
// Primary path: the Stripe webhook (checkout.session.completed) has flipped
// the order to status='paid' and fired the order email already.
//
// Fallback path: if the webhook hasn't been configured (or is delayed), we
// reconcile here by asking Stripe directly whether the session is paid. If
// it is and our DB row is still pending, we promote it, decrement stock,
// bump coupon usage, and send the order email. This way emails still go out
// even when the webhook isn't wired up.

import { type NextRequest, NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import {
  getOrder,
  getOrderByStripeSession,
  decrementStock,
  incrementCouponUsage,
} from "@/lib/db-queries"
import { db } from "@/lib/db"
import { orderItems, orders } from "@/lib/db/schema"
import { getStripeClient } from "@/lib/stripe"
import { sendOrderConfirmation } from "@/lib/order-emails"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get("session_id")
  if (!sessionId) {
    return NextResponse.json({ error: "session_id required" }, { status: 400 })
  }

  let order = await getOrderByStripeSession(sessionId)
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 })
  }

  // If the webhook already promoted the order, just return it.
  if (order.status !== "payment_pending") {
    return NextResponse.json({ order })
  }

  // Otherwise, ask Stripe directly. We treat a paid session as authoritative.
  try {
    const stripe = getStripeClient()
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    const isPaid =
      session.payment_status === "paid" || session.payment_status === "no_payment_required"

    if (!isPaid) {
      return NextResponse.json({ order })
    }

    await db
      .update(orders)
      .set({
        status: "paid",
        paymentStatus: "completed",
        stripePaymentIntentId:
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : session.payment_intent?.id,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, order.id))

    // Decrement stock for each item.
    const items = await db
      .select({
        productId: orderItems.productId,
        variantId: orderItems.variantId,
        quantity: orderItems.quantity,
      })
      .from(orderItems)
      .where(eq(orderItems.orderId, order.id))
    for (const item of items) {
      if (item.productId) {
        await decrementStock(item.productId, item.quantity, item.variantId ?? undefined)
      }
    }

    // Coupon usage.
    const orderRow = await db.query.orders.findFirst({
      where: eq(orders.id, order.id),
      columns: { couponId: true },
    })
    if (orderRow?.couponId) {
      await incrementCouponUsage(orderRow.couponId)
    }

    // Re-load with the new status, then fire the email.
    order = await getOrder(order.id)
    if (order) {
      try {
        await sendOrderConfirmation(order, order.items || [])
      } catch (e) {
        console.error("[order-route] email send failed:", e)
      }
    }
  } catch (e) {
    console.error("[order-route] Stripe reconcile failed:", e)
  }

  return NextResponse.json({ order })
}
