import { type NextRequest, NextResponse } from "next/server"
import { getSettings, setSetting } from "@/lib/db-queries"


export const dynamic = "force-dynamic"

export async function GET() {
  const map = await getSettings()
  return NextResponse.json(map)
}

export async function POST(request: NextRequest) {
  const { key, value } = await request.json()
  if (!key) return NextResponse.json({ error: "key required" }, { status: 400 })
  await setSetting(key, value)
  return NextResponse.json({ success: true })
}
