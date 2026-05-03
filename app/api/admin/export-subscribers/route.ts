import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  // Create a Supabase client
  const supabase = createRouteHandlerClient({ cookies })

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Fetch all subscribers
  const { data: subscribers, error } = await supabase
    .from("newsletter_subscribers")
    .select("*")
    .order("subscribed_at", { ascending: false })

  if (error) {
    console.error("Error fetching subscribers:", error)
    return NextResponse.json({ error: "Failed to fetch subscribers" }, { status: 500 })
  }

  // Convert to CSV
  const headers = ["Email", "Subscribed At", "Status", "Source"]
  const rows = subscribers.map((sub) => [
    sub.email,
    new Date(sub.subscribed_at).toISOString(),
    sub.is_active ? "Active" : "Inactive",
    sub.source,
  ])

  const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")

  // Return as downloadable CSV
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="newsletter-subscribers-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  })
}
