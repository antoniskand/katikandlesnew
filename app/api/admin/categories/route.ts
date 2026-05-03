import { type NextRequest, NextResponse } from "next/server"
import { asc } from "drizzle-orm"
import { db } from "@/lib/db"
import { categories } from "@/lib/db/schema"


export const dynamic = "force-dynamic"

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9Ͱ-Ͽ]+/g, "-")
    .replace(/^-|-$/g, "")
}

export async function GET() {
  const rows = await db.select().from(categories).orderBy(asc(categories.sortOrder))
  return NextResponse.json(rows)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const slug = body.slug || slugify(body.name)
  const [category] = await db
    .insert(categories)
    .values({
      name: body.name,
      slug,
      description: body.description,
      imageUrl: body.image_url,
      sortOrder: body.sort_order ?? 0,
    })
    .returning()
  return NextResponse.json({ success: true, category })
}
