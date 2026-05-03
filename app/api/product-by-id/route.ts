// app/api/product-by-id/[id]/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { getProductById } from "@/lib/supabase-api"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!params.id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 })
    }

    const product = await getProductById(params.id)

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error("Error fetching product by ID:", error)
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    )
  }
}
