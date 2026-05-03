import { NextResponse } from "next/server"
import { getOrder } from "@/lib/db-queries"

export const dynamic = "force-dynamic"

interface Ctx {
  params: Promise<{ id: string }>
}

export async function GET(_request: Request, { params }: Ctx) {
  try {
    const { id } = await params
    if (!id) {
      return NextResponse.json({ error: "Order ID required" }, { status: 400 })
    }
    const order = await getOrder(id)
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }
    return NextResponse.json(order)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed" },
      { status: 500 },
    )
  }
}
