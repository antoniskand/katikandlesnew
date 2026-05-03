import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServiceClient } from "@/lib/supabase-server"

interface Ctx {
  params: Promise<{ id: string }>
}

export async function PUT(request: NextRequest, { params }: Ctx) {
  const { id } = await params
  const supabase = getSupabaseServiceClient()
  const body = await request.json()
  delete body.id
  delete body.times_used
  const { data, error } = await supabase
    .from("coupons")
    .update(body)
    .eq("id", id)
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, coupon: data })
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params
  const supabase = getSupabaseServiceClient()
  const { error } = await supabase.from("coupons").delete().eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
