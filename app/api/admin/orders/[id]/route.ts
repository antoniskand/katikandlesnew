import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServiceClient } from "@/lib/supabase-server"

interface Ctx {
  params: Promise<{ id: string }>
}

export async function PUT(request: NextRequest, { params }: Ctx) {
  const { id } = await params
  const supabase = getSupabaseServiceClient()
  const body = await request.json()

  const allowed = ["status", "payment_status", "notes"] as const
  const update: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) update[key] = body[key]
  }

  const { data, error } = await supabase
    .from("orders")
    .update(update)
    .eq("id", id)
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, order: data })
}
