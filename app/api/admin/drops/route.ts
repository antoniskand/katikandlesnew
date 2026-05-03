import { type NextRequest, NextResponse } from "next/server"
import { asc, desc } from "drizzle-orm"
import { db } from "@/lib/db"
import { drops } from "@/lib/db/schema"

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9Ͱ-Ͽ]+/g, "-")
    .replace(/^-|-$/g, "")
}

export async function GET() {
  const rows = await db
    .select()
    .from(drops)
    .orderBy(asc(drops.sortOrder), desc(drops.createdAt))
  return NextResponse.json({ results: rows })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const slug = body.slug || (body.name ? slugify(body.name) : "")
    if (!slug) return NextResponse.json({ error: "Name or slug required" }, { status: 400 })

    const [drop] = await db
      .insert(drops)
      .values({
        name: body.name,
        slug,
        tagline: body.tagline,
        description: body.description,
        badgeText: body.badge_text,
        startsAt: body.starts_at ? new Date(body.starts_at) : null,
        endsAt: body.ends_at ? new Date(body.ends_at) : null,
        heroImageUrl: body.hero_image_url,
        backgroundColor: body.background_color,
        active: body.active !== false,
        featured: !!body.featured,
        productIds: body.product_ids || [],
        sortOrder: body.sort_order ?? 0,
      })
      .returning()
    return NextResponse.json({ success: true, drop })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 500 },
    )
  }
}
