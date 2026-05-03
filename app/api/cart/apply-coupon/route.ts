// app/api/cart/apply-coupon/route.ts
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { validateCoupon, calculateDiscount } from "@/lib/db-queries"

export async function POST(request: NextRequest) {
  try {
    const { couponCode, subtotal } = await request.json()

    if (!couponCode) {
      return NextResponse.json({ error: "Coupon code is required" }, { status: 400 })
    }

    const coupon = await validateCoupon(couponCode)

    if (!coupon) {
      return NextResponse.json({ error: "Μη έγκυρο κουπόνι" }, { status: 400 })
    }

    // Check minimum order amount
    if (coupon.min_order_amount && subtotal && subtotal < coupon.min_order_amount) {
      return NextResponse.json(
        { error: `Ελάχιστη παραγγελία €${coupon.min_order_amount} για αυτό το κουπόνι` },
        { status: 400 }
      )
    }

    const discount = subtotal ? calculateDiscount(coupon, subtotal) : 0

    return NextResponse.json({
      success: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        name: coupon.name,
        discount_type: coupon.discount_type,
        discount_amount: coupon.discount_amount,
        discount_percent: coupon.discount_percent,
      },
      calculated_discount: discount,
    })
  } catch (error) {
    console.error("Error validating coupon:", error)
    return NextResponse.json({ error: "Failed to validate coupon" }, { status: 500 })
  }
}
