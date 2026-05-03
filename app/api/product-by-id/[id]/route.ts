import { type NextRequest, NextResponse } from "next/server"
import { getProductById } from "@/lib/db-queries"

interface Ctx {
  params: Promise<{ id: string }>
}

export async function GET(_req: NextRequest, { params }: Ctx) {
  try {
    const { id } = await params
    if (!id) {
      return NextResponse.json({ error: "Product ID required" }, { status: 400 })
    }
    const product = await getProductById(id)
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }
    return NextResponse.json(product)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed" },
      { status: 500 },
    )
  }
}
