// app/api/cart/sync/route.ts
// Called by the client to persist cart state to Supabase for admin visibility
import { type NextRequest, NextResponse } from "next/server"
import { getServerClient } from "@/lib/supabase-api"

export async function POST(request: NextRequest) {
  try {
    const { sessionId, items, itemQuantity, subtotal, customerEmail, customerName } = await request.json()

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID required" }, { status: 400 })
    }

    const supabase = getServerClient()

    // Upsert cart by session_id
    const cartData = {
      session_id: sessionId,
      items: items || [],
      item_quantity: itemQuantity || 0,
      subtotal: subtotal || 0,
      customer_email: customerEmail || null,
      customer_name: customerName || null,
      status: (items && items.length > 0) ? "active" : "abandoned",
      last_activity: new Date().toISOString(),
    }

    // Check if cart exists for this session
    const { data: existing } = await supabase
      .from("carts")
      .select("id")
      .eq("session_id", sessionId)
      .single()

    if (existing) {
      await supabase
        .from("carts")
        .update(cartData)
        .eq("id", existing.id)
    } else {
      await supabase
        .from("carts")
        .insert(cartData)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Cart sync error:", error)
    return NextResponse.json({ error: "Failed to sync cart" }, { status: 500 })
  }
}
