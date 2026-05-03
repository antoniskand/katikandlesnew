import { type NextRequest, NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { productCategories, productVariants, products } from "@/lib/db/schema"

interface Ctx {
  params: Promise<{ id: string }>
}

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params
  const product = await db.query.products.findFirst({ where: eq(products.id, id) })
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 })
  }
  const [cats, vars] = await Promise.all([
    db.select().from(productCategories).where(eq(productCategories.productId, id)),
    db.select().from(productVariants).where(eq(productVariants.productId, id)),
  ])
  return NextResponse.json({ ...product, categories: cats, variants: vars })
}

export async function PUT(request: NextRequest, { params }: Ctx) {
  const { id } = await params
  try {
    const body = await request.json()
    const {
      categories: categoryIds,
      variants,
      price,
      sale_price,
      stock_level,
      sort_order,
      ...rest
    } = body as any

    const update: Record<string, unknown> = { updatedAt: new Date() }
    if (rest.name !== undefined) update.name = rest.name
    if (rest.slug !== undefined) update.slug = rest.slug
    if (rest.description !== undefined) update.description = rest.description
    if (price !== undefined) update.price = String(price)
    if (sale_price !== undefined) update.salePrice = sale_price == null ? null : String(sale_price)
    if (rest.currency !== undefined) update.currency = rest.currency
    if (rest.images !== undefined) update.images = rest.images
    if (rest.stock_status !== undefined) update.stockStatus = rest.stock_status
    if (stock_level !== undefined) update.stockLevel = stock_level
    if (rest.stock_tracking !== undefined) update.stockTracking = !!rest.stock_tracking
    if (rest.active !== undefined) update.active = rest.active
    if (rest.attributes !== undefined) update.attributes = rest.attributes
    if (sort_order !== undefined) update.sortOrder = sort_order

    const [product] = await db
      .update(products)
      .set(update)
      .where(eq(products.id, id))
      .returning()

    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 })

    if (categoryIds !== undefined) {
      await db.delete(productCategories).where(eq(productCategories.productId, id))
      if (categoryIds.length > 0) {
        await db.insert(productCategories).values(
          categoryIds.map((catId: string) => ({ productId: id, categoryId: catId })),
        )
      }
    }

    if (variants !== undefined) {
      await db.delete(productVariants).where(eq(productVariants.productId, id))
      if (variants.length > 0) {
        await db.insert(productVariants).values(
          variants.map((v: any) => ({
            productId: id,
            name: v.name,
            price: v.price != null ? String(v.price) : null,
            stockLevel: v.stock_level ?? 0,
            optionValues: v.option_values || {},
            active: v.active !== false,
            sortOrder: v.sort_order ?? 0,
          })),
        )
      }
    }

    return NextResponse.json({ success: true, product })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed" },
      { status: 500 },
    )
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params
  await db.delete(products).where(eq(products.id, id))
  return NextResponse.json({ success: true })
}
