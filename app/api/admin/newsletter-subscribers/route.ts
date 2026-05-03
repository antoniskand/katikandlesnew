import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") || "active"
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    // Fetch subscribers with pagination
    const {
      data: subscribers,
      error,
      count,
    } = await supabase
      .from("newsletter_subscribers")
      .select("*", { count: "exact" })
      .eq("status", status)
      .order("subscribed_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error("Error fetching subscribers:", error)
      return NextResponse.json({ error: "Failed to fetch subscribers" }, { status: 500 })
    }

    return NextResponse.json({
      subscribers,
      total: count,
      limit,
      offset,
    })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
