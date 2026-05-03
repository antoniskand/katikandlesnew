// app/api/pages/[slug]/route.ts
import { NextResponse } from "next/server"
import { getPage } from "@/lib/supabase-api"

export const dynamic = "force-dynamic"

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  try {
    const { slug } = params

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
