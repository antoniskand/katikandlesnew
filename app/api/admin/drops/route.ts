import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServiceClient } from "@/lib/supabase-server"

export async function GET() {
  const supabase = getSupabaseServiceClient()
  const { data, error } = await supabase
    .from("drops")
    .select("*")
    .order("sort_order")
    .order("created_at", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ results: data || [] })
}

export async function POST(request: NextRequest) {
  const supabase = getSupabaseServiceClient()
  try {
    const body = await request.json()
    if (!body.slug && body.name) {
      body.slug = body.name
        .toLowerCase()
        .replace(/[^a-z0-9\u0370-\u03FF]+/g, "-")
        .replace(/^-|-$/g, "")
    }
    const { data, error } = await supabase.from("drops").insert(body).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, drop: data })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 500 },
    )
  }
}
