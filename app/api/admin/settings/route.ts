import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServiceClient } from "@/lib/supabase-server"

export async function GET() {
  const supabase = getSupabaseServiceClient()
  const { data, error } = await supabase.from("site_settings").select("*")
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const map: Record<string, any> = {}
  for (const row of data || []) {
    map[row.key] = row.value
  }
  return NextResponse.json(map)
}

export async function POST(request: NextRequest) {
  const supabase = getSupabaseServiceClient()
  const { key, value } = await request.json()
  if (!key) return NextResponse.json({ error: "key required" }, { status: 400 })

  const { error } = await supabase
    .from("site_settings")
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
