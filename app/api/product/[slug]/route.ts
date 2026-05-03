// app/api/product/[slug]/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { getProduct } from "@/lib/supabase-api"

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    if (!params.slug) {
      return NextResponse.json({ error: "Product slug is required" }, { status: 400 })
    }

    const product = await getProduct(params.slug)

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Transform images to backward-compatible format
    const result = {
      ...product,
      images: product.images.map((img) => ({
        file: { url: img.url, width: 800, height: 800 },
      })),
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in product API route:", error)
    return NextResponse.json(
      { error: "Failed to fetch product", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
