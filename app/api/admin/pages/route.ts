import { type NextRequest, NextResponse } from "next/server"
import { asc } from "drizzle-orm"
import { db } from "@/lib/db"
import { pages } from "@/lib/db/schema"

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9Ͱ-Ͽ]+/g, "-")
    .replace(/^-|-$/g, "")
}

export async function GET() {
  const rows = await db.select().from(pages).orderBy(asc(pages.name))
  return NextResponse.json(rows)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const slug = body.slug || slugify(body.name)

  const [page] = await db
    .insert(pages)
    .values({
      name: body.name,
      slug,
      content: body.content,
      metaDescription: body.meta_description,
      active: body.active !== false,
    })
    .returning()
  return NextResponse.json({ success: true, page })
}
