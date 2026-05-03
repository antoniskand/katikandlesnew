import { NextResponse } from "next/server"
import { getSupabaseServiceClient } from "@/lib/supabase-server"

export async function GET() {
  const supabase = getSupabaseServiceClient()
  const { data: subscribers, error } = await supabase
    .from("newsletter_subscribers")
    .select("*")
    .order("subscribed_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: "Failed to fetch subscribers" }, { status: 500 })
  }

  const headers = ["Email", "Subscribed At", "Status", "Source"]
  const rows = (subscribers || []).map((sub) => [
    sub.email,
    new Date(sub.subscribed_at).toISOString(),
    sub.status || "active",
    sub.source || "",
  ])

  const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="subscribers-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  })
}
