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
    <section className="pt-28 md:pt-36 pb-20 bg-[#fafaf7]">
      <BreadcrumbJsonLd
        items={[
          { name: "Αρχική", url: "/" },
          { name: "Η ιστορία μας", url: "/about" },
        ]}
      />
      <div className="mx-auto max-w-3xl px-6 md:px-12 lg:px-16">
        <p className="text-[11px] tracking-[0.22em] uppercase text-[#1a1a1a]/50 mb-4">
          our story
        </p>
        <h1 className="headline-md text-[#1a1a1a] mb-12">{pageContent.name}</h1>
        <div
          className="prose prose-lg max-w-none text-[#1a1a1a]/80 prose-headings:text-[#1a1a1a] prose-strong:text-[#1a1a1a] prose-a:text-[#1a1a1a] prose-a:underline prose-a:underline-offset-4"
          dangerouslySetInnerHTML={{ __html: pageContent.content || "" }}
        />
      </div>
    </section>
  )
}
