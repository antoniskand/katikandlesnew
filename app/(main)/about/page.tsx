import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getPage } from "@/lib/db-queries"
import { BreadcrumbJsonLd } from "@/components/seo/json-ld"

export const revalidate = 3600

export const metadata: Metadata = {
  title: "Η ιστορία μας",
  description:
    "Η ιστορία πίσω από τα Kati Kandles — χειροποίητα κεριά σόγιας, φτιαγμένα με μεράκι στην Ελλάδα.",
  alternates: { canonical: "/about" },
}

export default async function AboutPage() {
  const pageContent = await getPage("about-us").catch(() => null)

  if (!pageContent) notFound()

  return (
    <section className="pt-28 md:pt-32 pb-16 bg-[#f7e7ce]">
      <BreadcrumbJsonLd
        items={[
          { name: "Αρχική", url: "/" },
          { name: "Η ιστορία μας", url: "/about" },
        ]}
      />
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="caption text-[#502e23]/60 mb-3">our story</div>
        <h1 className="headline-md text-[#1a1a1a] mb-8">{pageContent.name}</h1>
        <div
          className="prose prose-lg max-w-none text-[#502e23]/85 prose-headings:text-[#1a1a1a] prose-strong:text-[#1a1a1a] prose-a:text-[#ff6b35]"
          dangerouslySetInnerHTML={{ __html: pageContent.content || "" }}
        />
      </div>
    </section>
  )
}
