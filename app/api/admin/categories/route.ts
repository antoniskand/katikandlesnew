// app/api/admin/categories/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { getServerClient } from "@/lib/supabase-api"

export async function GET() {
  const supabase = getServerClient()
  const { data, error } = await supabase.from("categories").select("*").order("sort_order")
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data || [])
}

export async function POST(request: NextRequest) {
  const supabase = getServerClient()
  const body = await request.json()

  if (!body.slug) {
    body.slug = body.name
      .toLowerCase()
      .replace(/[^a-z0-9\u0370-\u03FF]+/g, "-")
      .replace(/^-|-$/g, "")
  }

  const { data, error } = await supabase.from("categories").insert(body).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, category: data })
}

export async function PUT(request: NextRequest) {
  const supabase = getServerClient()
  const body = await request.json()
  const { id, ...updateData } = body

  const { data, error } = await supabase.from("categories").update(updateData).eq("id", id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, category: data })
}

export async function DELETE(request: NextRequest) {
  const supabase = getServerClient()
  const { id } = await request.json()

  const { error } = await supabase.from("categories").delete().eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
