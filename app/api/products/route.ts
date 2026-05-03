// app/api/products/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { getProducts } from "@/lib/db-queries"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const products = await getProducts({
      limit: parseInt(searchParams.get("limit") || "100"),
      page: parseInt(searchParams.get("page") || "1"),
      category: searchParams.get("category") || undefined,
      search: searchParams.get("search") || undefined,
      sort: searchParams.get("sort") || undefined,
      activeOnly: true,
    })

    // Transform to match existing frontend expectations
    const results = products.results.map((p) => ({
      ...p,
      // Map images to Swell-compatible format for backward compat
      images: p.images.map((img) => ({
        file: { url: img.url, width: 800, height: 800 },
      })),
    }))

    return NextResponse.json({ results, count: products.count })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}
