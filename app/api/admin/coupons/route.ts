// app/api/admin/coupons/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { getServerClient } from "@/lib/supabase-api"

export async function GET() {
  const supabase = getServerClient()
  const { data, error } = await supabase.from("coupons").select("*").order("created_at", { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data || [])
}

export async function POST(request: NextRequest) {
  const supabase = getServerClient()
  const body = await request.json()
  body.code = body.code?.toUpperCase().trim()

  const { data, error } = await supabase.from("coupons").insert(body).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, coupon: data })
}

export async function PUT(request: NextRequest) {
  const supabase = getServerClient()
  const body = await request.json()
  const { id, ...updateData } = body

  const { data, error } = await supabase.from("coupons").update(updateData).eq("id", id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, coupon: data })
}

export async function DELETE(request: NextRequest) {
  const supabase = getServerClient()
  const { id } = await request.json()
  const { error } = await supabase.from("coupons").delete().eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
