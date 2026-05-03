import { type NextRequest, NextResponse } from "next/server"
import { desc, sql } from "drizzle-orm"
import { db } from "@/lib/db"
import { productCategories, productVariants, products } from "@/lib/db/schema"


export const dynamic = "force-dynamic"

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9Ͱ-Ͽ]+/g, "-")
    .replace(/^-|-$/g, "")
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "50")
  const offset = (page - 1) * limit

  const rows = await db
    .select()
    .from(products)
    .orderBy(desc(products.createdAt))
    .limit(limit)
    .offset(offset)

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(products)

  return NextResponse.json({ results: rows, count: Number(count) || 0 })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      categories: categoryIds,
      variants,
      slug: rawSlug,
      name,
      price,
      sale_price,
      stock_level,
      sort_order,
      ...rest
    } = body as any

    const slug = rawSlug || slugify(name)

    const [product] = await db
      .insert(products)
      .values({
        name,
        slug,
        description: rest.description,
        price: String(price ?? 0),
        salePrice: sale_price != null ? String(sale_price) : null,
        currency: rest.currency || "EUR",
        images: rest.images || [],
        stockStatus: rest.stock_status || "in_stock",
        stockLevel: stock_level ?? 0,
        stockTracking: !!rest.stock_tracking,
        active: rest.active !== false,
        attributes: rest.attributes || {},
        sortOrder: sort_order ?? 0,
      })
      .returning()

    if (categoryIds?.length) {
      await db.insert(productCategories).values(
        categoryIds.map((catId: string) => ({
          productId: product.id,
          categoryId: catId,
        })),
      )
    }

    if (variants?.length) {
      await db.insert(productVariants).values(
        variants.map((v: any) => ({
          productId: product.id,
          name: v.name,
          price: v.price != null ? String(v.price) : null,
          stockLevel: v.stock_level ?? 0,
          optionValues: v.option_values || {},
          active: v.active !== false,
          sortOrder: v.sort_order ?? 0,
        })),
      )
    }

    return NextResponse.json({ success: true, product })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create product" },
      { status: 500 },
    )
  }
}
