// app/api/admin/products/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { getServerClient } from "@/lib/supabase-api"

export async function GET(request: NextRequest) {
  const supabase = getServerClient()

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "50")
  const offset = (page - 1) * limit

  const { data, error, count } = await supabase
    .from("products")
    .select(`
      *,
      product_categories(category_id, categories(id, name, slug)),
      product_variants(*)
    `, { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ results: data || [], count: count || 0 })
}

export async function POST(request: NextRequest) {
  const supabase = getServerClient()

  try {
    const body = await request.json()
    const { categories: categoryIds, variants, ...productData } = body

    // Generate slug if not provided
    if (!productData.slug) {
      productData.slug = productData.name
        .toLowerCase()
        .replace(/[^a-z0-9\u0370-\u03FF]+/g, "-")
        .replace(/^-|-$/g, "")
    }

    // Insert product
    const { data: product, error } = await supabase
      .from("products")
      .insert(productData)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Link categories
    if (categoryIds && categoryIds.length > 0) {
      const links = categoryIds.map((catId: string) => ({
        product_id: product.id,
        category_id: catId,
      }))
      await supabase.from("product_categories").insert(links)
    }

    // Create variants
    if (variants && variants.length > 0) {
      const variantData = variants.map((v: any) => ({
        ...v,
        product_id: product.id,
      }))
      await supabase.from("product_variants").insert(variantData)
    }

    return NextResponse.json({ success: true, product })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create product" },
      { status: 500 }
    )
  }
}
