import { NextResponse } from "next/server"
import { desc } from "drizzle-orm"
import { db } from "@/lib/db"
import { newsletterSubscribers } from "@/lib/db/schema"

export async function GET() {
  const subs = await db
    .select()
    .from(newsletterSubscribers)
    .orderBy(desc(newsletterSubscribers.subscribedAt))

  const headers = ["Email", "Subscribed At", "Status", "Source"]
  const rows = subs.map((s) => [
    s.email,
    s.subscribedAt instanceof Date ? s.subscribedAt.toISOString() : String(s.subscribedAt),
    s.status || "active",
    s.source || "",
  ])

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="subscribers-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  })
}
