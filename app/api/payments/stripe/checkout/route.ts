import { type NextRequest, NextResponse } from "next/server"
import type Stripe from "stripe"
import { eq } from "drizzle-orm"
import { getStripeClient } from "@/lib/stripe"
import { createOrder } from "@/lib/db-queries"
import { db } from "@/lib/db"
import { orders } from "@/lib/db/schema"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

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
  shippingMethod: { id: string; name: string; price: number }
  items: Array<{
    product_id: string
    variant_id?: string
    product: {
      name: string
      slug: string
      price: number
      sale_price?: number | null
      currency: string
      images: { url: string; alt?: string }[]
    }
    quantity: number
    price: number
    price_total: number
  }>
  coupon?: { id: string; code: string; discount: number } | null
}

export async function POST(request: NextRequest) {
  try {
    const body: CheckoutBody = await request.json()
    const stripe = getStripeClient()

    const subtotal = body.items.reduce((sum, i) => sum + i.price_total, 0)
    const isFreeShipping = subtotal >= 30
    const shippingPrice = isFreeShipping ? 0 : body.shippingMethod.price
    const discount = body.coupon?.discount || 0
    const total = Math.round((subtotal + shippingPrice - discount) * 100) / 100

    // Create the pending order in DB FIRST
    const order = await createOrder({
      customer_email: body.customerInfo.email,
      customer_first_name: body.customerInfo.firstName,
      customer_last_name: body.customerInfo.lastName,
      customer_phone: body.customerInfo.phone,
      shipping_address1: body.shippingInfo.address1,
      shipping_address2: body.shippingInfo.address2,
      shipping_city: body.shippingInfo.city,
      shipping_state: body.shippingInfo.state,
      shipping_zip: body.shippingInfo.zip,
      shipping_country: body.shippingInfo.country || "GR",
      shipping_method: body.shippingMethod.id,
      shipping_method_name: body.shippingMethod.name,
      shipping_price: shippingPrice,
      shipping_total: shippingPrice,
      subtotal,
      discount_total: discount,
      grand_total: total,
      coupon_code: body.coupon?.code,
      coupon_id: body.coupon?.id,
      payment_method: "stripe",
      payment_status: "pending",
      status: "payment_pending",
      items: body.items.map((i) => ({
        product_id: i.product_id,
        variant_id: i.variant_id,
        product_name: i.product.name,
        product_image_url: i.product.images?.[0]?.url || "",
        price: i.price,
        quantity: i.quantity,
        line_total: i.price_total,
      })),
    } as any)

    if (!order) {
      return NextResponse.json({ error: "Order creation failed" }, { status: 500 })
    }

    // Build line items
    const line_items = body.items.map((i) => ({
      price_data: {
        currency: i.product.currency.toLowerCase() || "eur",
        product_data: {
          name: i.product.name,
          images: i.product.images?.[0]?.url ? [i.product.images[0].url] : undefined,
        },
        unit_amount: Math.round(i.price * 100),
      },
      quantity: i.quantity,
    }))

    // Add shipping as a line item if not free
    if (shippingPrice > 0) {
      line_items.push({
        price_data: {
          currency: "eur",
          product_data: { name: `Αποστολή — ${body.shippingMethod.name}` },
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
        name: body.coupon?.code || "Discount",
        max_redemptions: 1,
      })
      discounts = [{ coupon: stripeCoupon.id }]
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      discounts,
      customer_email: body.customerInfo.email,
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

    // Store session_id on the order
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
