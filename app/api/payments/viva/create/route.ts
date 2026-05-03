// app/api/payments/viva/create/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { createOrder } from "@/lib/supabase-api"

async function getVivaAccessToken() {
  const VIVA_AUTH_URL =
    process.env.VIVA_ENVIRONMENT === "production"
      ? "https://accounts.vivapayments.com/connect/token"
      : "https://demo-accounts.vivapayments.com/connect/token"

  const credentials = Buffer.from(`${process.env.VIVA_CLIENT_ID}:${process.env.VIVA_CLIENT_SECRET}`).toString("base64")

  const response = await fetch(VIVA_AUTH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${credentials}`,
    },
    body: "grant_type=client_credentials",
  })

  if (!response.ok) {
    throw new Error("Failed to authenticate with Viva Wallet")
  }

  const data = await response.json()
  return data.access_token
}

export async function POST(request: NextRequest) {
  try {
    const { amount, customerInfo, shippingInfo, items, coupon, shippingMethod } = await request.json()

    if (!amount || !customerInfo || !items || items.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // 1. Create a pending order in Supabase
    const order = await createOrder({
      customer_email: customerInfo.email,
      customer_first_name: customerInfo.firstName,
      customer_last_name: customerInfo.lastName,
      customer_phone: customerInfo.phone,
      shipping_address1: shippingInfo?.address1 || "",
      shipping_address2: shippingInfo?.address2 || "",
      shipping_city: shippingInfo?.city || "",
      shipping_state: shippingInfo?.state || "",
      shipping_zip: shippingInfo?.zip || "",
      shipping_country: shippingInfo?.country || "GR",
      shipping_method: shippingMethod?.id || "courier",
      shipping_method_name: shippingMethod?.name || "Courier",
      shipping_price: shippingMethod?.price || 0,
      subtotal: items.reduce((sum: number, item: any) => sum + item.price_total, 0),
      discount_total: coupon?.discount || 0,
      grand_total: amount,
      coupon_code: coupon?.code || null,
      coupon_id: coupon?.id || null,
      status: "payment_pending",
      payment_status: "pending",
      items: items.map((item: any) => ({
        product_id: item.product_id,
        variant_id: item.variant_id || null,
        product_name: item.product?.name || item.product_name || "Product",
        product_image_url: item.product?.images?.[0]?.url || item.product_image_url || null,
        price: item.price,
        quantity: item.quantity,
        line_total: item.price_total,
      })),
      metadata: {
        payment_method: "vivawallet",
      },
    })

    if (!order) {
      return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
    }

    // 2. Create Viva payment order
    const accessToken = await getVivaAccessToken()

    const VIVA_API_URL =
      process.env.VIVA_ENVIRONMENT === "production"
        ? "https://api.vivapayments.com/checkout/v2/orders"
        : "https://demo-api.vivapayments.com/checkout/v2/orders"

    const paymentOrderPayload = {
      amount: Math.round(amount * 100),
      customerTrns: `Order from Kati Kandles`,
      customer: {
        email: customerInfo.email,
        fullName: `${customerInfo.firstName} ${customerInfo.lastName}`,
        phone: customerInfo.phone,
        countryCode: "GR",
      },
      sourceCode: process.env.VIVA_SOURCE_CODE,
      merchantTrns: `Order: ${order.order_number}`,
    }

    const vivaResponse = await fetch(VIVA_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(paymentOrderPayload),
    })

    if (!vivaResponse.ok) {
      const errorBody = await vivaResponse.json()
      return NextResponse.json({ error: "Failed to create Viva payment order", details: errorBody }, { status: 500 })
    }

    const vivaData = await vivaResponse.json()
    const { orderCode } = vivaData

    // 3. Update order with Viva order code
    const { getServerClient } = await import("@/lib/supabase-api")
    const supabase = getServerClient()
    await supabase
      .from("orders")
      .update({ viva_order_code: orderCode.toString() })
      .eq("id", order.id)

    const paymentUrl = `${
      process.env.VIVA_ENVIRONMENT === "production" ? "https://www.vivapayments.com" : "https://demo.vivapayments.com"
    }/web/checkout?ref=${orderCode}`

    return NextResponse.json({
      success: true,
      paymentUrl,
      orderCode,
      orderId: order.id,
      orderNumber: order.order_number,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error"
    console.error("Payment creation error:", error)
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
