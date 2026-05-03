import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServiceClient } from "@/lib/supabase-server"

interface Ctx {
  params: Promise<{ id: string }>
}

export async function PUT(request: NextRequest, { params }: Ctx) {
  const { id } = await params
  const supabase = getSupabaseServiceClient()
  const body = await request.json()
  const { data, error } = await supabase
    .from("pages")
    .update(body)
    .eq("id", id)
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, page: data })
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params
  const supabase = getSupabaseServiceClient()
  const { error } = await supabase.from("pages").delete().eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
