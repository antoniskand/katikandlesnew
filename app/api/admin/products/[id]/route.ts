// app/api/admin/products/[id]/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { getServerClient } from "@/lib/supabase-api"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = getServerClient()

  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      product_categories(category_id, categories(id, name, slug)),
      product_variants(*)
    `)
    .eq("id", params.id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 })
  }

  return NextResponse.json(data)
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = getServerClient()

  try {
    const body = await request.json()
    const { categories: categoryIds, variants, ...productData } = body

    // Update product
    const { data: product, error } = await supabase
      .from("products")
      .update(productData)
      .eq("id", params.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Update categories: delete old, insert new
    if (categoryIds !== undefined) {
      await supabase.from("product_categories").delete().eq("product_id", params.id)
      if (categoryIds.length > 0) {
        const links = categoryIds.map((catId: string) => ({
          product_id: params.id,
          category_id: catId,
        }))
        await supabase.from("product_categories").insert(links)
      }
    }

    // Update variants: delete old, insert new
    if (variants !== undefined) {
      await supabase.from("product_variants").delete().eq("product_id", params.id)
      if (variants.length > 0) {
        const variantData = variants.map((v: any) => ({
          ...v,
          product_id: params.id,
          id: undefined, // let Supabase generate new IDs
        }))
        await supabase.from("product_variants").insert(variantData)
      }
    }

    return NextResponse.json({ success: true, product })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update product" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = getServerClient()

  const { error } = await supabase.from("products").delete().eq("id", params.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
