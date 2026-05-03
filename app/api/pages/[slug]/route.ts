// app/api/pages/[slug]/route.ts
import { NextResponse } from "next/server"
import { getPage } from "@/lib/db-queries"

export const dynamic = "force-dynamic"

interface Ctx { params: Promise<{ slug: string }> }

export async function GET(_req: Request, { params }: Ctx) {
  try {
    const { slug } = await params
    const page = await getPage(slug)

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 })
    }

    return NextResponse.json(page)
  } catch (error) {
    console.error("Error fetching page:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
