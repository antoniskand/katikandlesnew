// app/(main)/about/page.tsx
import { notFound } from "next/navigation"
import { getPage } from "@/lib/supabase-api"

export const revalidate = 3600

export default async function AboutPage() {
  let pageContent = null

  try {
    pageContent = await getPage("about-us")
  } catch {
    // fall through
  }

  if (!pageContent) {
    return notFound()
  }

  return (
    <section className="pt-24 pb-12 bg-white">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="prose prose-lg max-w-none">
          <h1 className="mt-8">{pageContent.name}</h1>
          <div dangerouslySetInnerHTML={{ __html: pageContent.content || "" }} />
        </div>
      </div>
    </section>
  )
}
