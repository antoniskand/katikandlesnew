// app/api/admin/carts/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { getServerClient } from "@/lib/supabase-api"

export async function GET(request: NextRequest) {
  const supabase = getServerClient()
  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status") // active, abandoned, converted

  let query = supabase
    .from("carts")
    .select("*", { count: "exact" })
    .order("last_activity", { ascending: false })
    .limit(100)

  if (status) {
    query = query.eq("status", status)
  }

  const { data, error, count } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ results: data || [], count: count || 0 })
}

// Mark cart as abandoned or delete
export async function PUT(request: NextRequest) {
  const supabase = getServerClient()
  const { id, status } = await request.json()

  const { data, error } = await supabase
    .from("carts")
    .update({ status })
    .eq("id", id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, cart: data })
}

export async function DELETE(request: NextRequest) {
  const supabase = getServerClient()
  const { id } = await request.json()
  const { error } = await supabase.from("carts").delete().eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
