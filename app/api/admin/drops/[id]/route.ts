import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServiceClient } from "@/lib/supabase-server"

interface Ctx {
  params: Promise<{ id: string }>
}

export async function PUT(request: NextRequest, { params }: Ctx) {
  const { id } = await params
  const supabase = getSupabaseServiceClient()
  try {
    const body = await request.json()
    const { data, error } = await supabase
      .from("drops")
      .update(body)
      .eq("id", id)
      .select()
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, drop: data })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 500 },
    )
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params
  const supabase = getSupabaseServiceClient()
  const { error } = await supabase.from("drops").delete().eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
