// app/api/payments/stripe/checkout/route.ts
//
// Build a Stripe Checkout Session from a client-submitted cart.
//
// IMPORTANT: All prices, discounts, totals, and product data are authoritatively
// recomputed on the server from the database. The body's `price`, `price_total`,
// `coupon.discount`, and `shippingMethod.price` are intentionally IGNORED — only
// `product_id`, `variant_id`, `quantity`, `coupon.code`, and `shippingMethod.id`
// are trusted as references. This prevents a malicious client from charging
// arbitrary amounts.

import { type NextRequest, NextResponse } from "next/server"
import type Stripe from "stripe"
import { eq } from "drizzle-orm"
import { getStripeClient } from "@/lib/stripe"
import {
  createOrder,
  getProductById,
  validateCoupon,
  calculateDiscount,
} from "@/lib/db-queries"
import { db } from "@/lib/db"
import { orders } from "@/lib/db/schema"

export const dynamic = "force-dynamic"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

const FREE_SHIPPING_THRESHOLD = 30

const SHIPPING_METHODS: Record<string, { name: string; price: number }> = {
  courier: { name: "Courier", price: 2 },
  boxnow: { name: "BoxNow", price: 2 },
}

interface CheckoutBody {
  customerInfo: {
    firstName: string
    lastName: string
    email: string
    phone: string
  }
  shippingInfo: {
    address1: string
    address2?: string
    city: string
    state?: string
    zip: string
    country: string
  }
  shippingMethod: { id: string }
  items: Array<{
    product_id: string
    variant_id?: string
    quantity: number
  }>
  coupon?: { code: string } | null
}

// Round to 2 decimal places without floating-point drift.
const r2 = (n: number) => Math.round(n * 100) / 100

export async function POST(request: NextRequest) {
  try {
    const body: CheckoutBody = await request.json()

    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: "Άδειο καλάθι" }, { status: 400 })
    }

    // Basic customer validation
    const c = body.customerInfo
    if (!c?.email || !c.firstName || !c.lastName || !c.phone) {
      return NextResponse.json({ error: "Ελλιπή στοιχεία πελάτη" }, { status: 400 })
    }
    const s = body.shippingInfo
    if (!s?.address1 || !s.city || !s.zip) {
      return NextResponse.json({ error: "Ελλιπή στοιχεία αποστολής" }, { status: 400 })
    }

    // Re-fetch every product from DB and compute authoritative line items
    const itemsResolved: Array<{
      product_id: string
      variant_id?: string
      product_name: string
      product_image_url: string
      product_currency: string
      unit_price: number
      quantity: number
      line_total: number
    }> = []

    for (const incoming of body.items) {
      const qty = Math.max(1, Math.floor(Number(incoming.quantity) || 0))
      if (!incoming.product_id || qty <= 0) {
        return NextResponse.json({ error: "Άκυρο προϊόν" }, { status: 400 })
      }
      const product = await getProductById(incoming.product_id)
      if (!product || product.active === false) {
        return NextResponse.json(
          { error: `Το προϊόν δεν είναι διαθέσιμο` },
          { status: 400 },
        )
      }
      const onSale =
        product.sale_price != null &&
        product.sale_price > 0 &&
        product.sale_price < product.price
      const unitPrice = onSale ? Number(product.sale_price) : Number(product.price)
      if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
        return NextResponse.json(
          { error: `Άκυρη τιμή για ${product.name}` },
          { status: 400 },
        )
      }
      itemsResolved.push({
        product_id: product.id,
        variant_id: incoming.variant_id,
        product_name: product.name,
        product_image_url: product.images?.[0]?.url || "",
        product_currency: (product.currency || "EUR").toLowerCase(),
        unit_price: r2(unitPrice),
        quantity: qty,
        line_total: r2(unitPrice * qty),
      })
    }

    const subtotal = r2(itemsResolved.reduce((sum, i) => sum + i.line_total, 0))

    // Validate coupon and compute discount server-side
    let couponDb = null
    let discount = 0
    if (body.coupon?.code) {
      couponDb = await validateCoupon(body.coupon.code)
      if (!couponDb) {
        return NextResponse.json({ error: "Μη έγκυρο κουπόνι" }, { status: 400 })
      }
      discount = calculateDiscount(couponDb, subtotal)
    }

    // Resolve shipping method from a server-side allowlist
    const methodId = body.shippingMethod?.id
    const methodMeta = methodId ? SHIPPING_METHODS[methodId] : null
    if (!methodMeta) {
      return NextResponse.json({ error: "Άκυρος τρόπος αποστολής" }, { status: 400 })
    }
    const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD
    const baseShipping = isFreeShipping ? 0 : methodMeta.price
    const shippingPrice =
      couponDb?.discount_type === "shipping" ? 0 : baseShipping
    const total = r2(subtotal + shippingPrice - discount)

    if (total <= 0) {
      return NextResponse.json(
        { error: "Σφάλμα υπολογισμού συνόλου" },
        { status: 400 },
      )
    }

    // Create the pending order in DB
    const order = await createOrder({
      customer_email: c.email,
      customer_first_name: c.firstName,
      customer_last_name: c.lastName,
      customer_phone: c.phone,
      shipping_address1: s.address1,
      shipping_address2: s.address2,
      shipping_city: s.city,
      shipping_state: s.state,
      shipping_zip: s.zip,
      shipping_country: s.country || "GR",
      shipping_method: methodId,
      shipping_method_name: methodMeta.name,
      shipping_price: shippingPrice,
      shipping_total: shippingPrice,
      subtotal,
      discount_total: discount,
      grand_total: total,
      coupon_code: couponDb?.code,
      coupon_id: couponDb?.id,
      payment_method: "stripe",
      payment_status: "pending",
      status: "payment_pending",
      items: itemsResolved.map((i) => ({
        product_id: i.product_id,
        variant_id: i.variant_id,
        product_name: i.product_name,
        product_image_url: i.product_image_url,
        price: i.unit_price,
        quantity: i.quantity,
        line_total: i.line_total,
      })),
    } as any)

    if (!order) {
      return NextResponse.json({ error: "Αποτυχία δημιουργίας παραγγελίας" }, { status: 500 })
    }

    // Build Stripe line items with the authoritative prices we just computed
    const stripe = getStripeClient()
    const line_items = itemsResolved.map((i) => ({
      price_data: {
        currency: i.product_currency || "eur",
        product_data: {
          name: i.product_name,
          images: i.product_image_url ? [i.product_image_url] : undefined,
        },
        unit_amount: Math.round(i.unit_price * 100),
      },
      quantity: i.quantity,
    }))
    if (shippingPrice > 0) {
      line_items.push({
        price_data: {
          currency: "eur",
          product_data: {
            name: `Αποστολή — ${methodMeta.name}`,
            images: undefined,
          },
          unit_amount: Math.round(shippingPrice * 100),
        },
        quantity: 1,
      })
    }

    let discounts: Stripe.Checkout.SessionCreateParams.Discount[] | undefined
    if (discount > 0) {
      const stripeCoupon = await stripe.coupons.create({
        amount_off: Math.round(discount * 100),
        currency: "eur",
        duration: "once",
        name: couponDb?.code || "Discount",
        max_redemptions: 1,
      })
      discounts = [{ coupon: stripeCoupon.id }]
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      discounts,
      customer_email: c.email,
      success_url: `${SITE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/cart`,
      metadata: {
        order_id: order.id,
        order_number: order.order_number,
      },
      payment_intent_data: {
        metadata: {
          order_id: order.id,
          order_number: order.order_number,
        },
      },
      shipping_address_collection: {
        allowed_countries: ["GR", "CY", "DE", "FR", "IT", "ES", "NL", "BE", "AT", "GB"],
      },
      locale: "el",
    })

    await db
      .update(orders)
      .set({ stripeSessionId: session.id, updatedAt: new Date() })
      .where(eq(orders.id, order.id))

    return NextResponse.json({ url: session.url, orderId: order.id })
  } catch (error) {
    console.error("Stripe checkout error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Checkout failed" },
      { status: 500 },
    )
  }
}
