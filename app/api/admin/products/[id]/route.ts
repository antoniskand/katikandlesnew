import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServiceClient } from "@/lib/supabase-server"

interface Ctx {
  params: Promise<{ id: string }>
}

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params
  const supabase = getSupabaseServiceClient()

  const { data, error } = await supabase
    .from("products")
    .select("*, product_categories(category_id, categories(id, name, slug)), product_variants(*)")
    .eq("id", id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 })
  }

  return NextResponse.json(data)
}

export async function PUT(request: NextRequest, { params }: Ctx) {
  const { id } = await params
  const supabase = getSupabaseServiceClient()

  try {
    const body = await request.json()
    const { categories: categoryIds, variants, ...productData } = body

    const { data: product, error } = await supabase
      .from("products")
      .update(productData)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (categoryIds !== undefined) {
      await supabase.from("product_categories").delete().eq("product_id", id)
      if (categoryIds.length > 0) {
        const links = categoryIds.map((catId: string) => ({
          product_id: id,
          category_id: catId,
        }))
        await supabase.from("product_categories").insert(links)
      }
    }

    if (variants !== undefined) {
      await supabase.from("product_variants").delete().eq("product_id", id)
      if (variants.length > 0) {
        const variantData = variants.map((v: any) => ({
          ...v,
          product_id: id,
          id: undefined,
        }))
        await supabase.from("product_variants").insert(variantData)
      }
    }

    return NextResponse.json({ success: true, product })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update product" },
      { status: 500 },
    )
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params
  const supabase = getSupabaseServiceClient()
  const { error } = await supabase.from("products").delete().eq("id", id)
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ success: true })
}
