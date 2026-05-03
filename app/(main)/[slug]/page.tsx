// app/(main)/[slug]/page.tsx
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getPage } from "@/lib/supabase-api"

export const revalidate = 300

export async function generateStaticParams() {
  return []
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params

  if (slug === "sitemap.xml" || slug === "robots.txt" || slug.startsWith("api/")) {
    return { title: "Not Found" }
  }

  try {
    const page = await getPage(slug)
    if (!page) return { title: "Page Not Found" }

    return {
      title: `${page.name} | Kati Kandles`,
      description: page.meta_description || "Kati Kandles - Handmade, limited edition, soya-based vegan candles",
    }
  } catch {
    return { title: "Kati Kandles" }
  }
}

export default async function DynamicPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  if (slug === "sitemap.xml" || slug === "robots.txt" || slug.startsWith("api/")) {
    notFound()
  }

  try {
    const page = await getPage(slug)
    if (!page) notFound()

    return (
      <div className="w-full pt-32 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-3xl font-bold mb-8">{page.name}</h1>
          <div className="prose prose-lg max-w-none mb-16" dangerouslySetInnerHTML={{ __html: page.content || "" }} />
        </div>
      </div>
    )
  } catch {
    notFound()
  }
}
