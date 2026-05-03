import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getPage } from "@/lib/db-queries"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Όροι Χρήσης | Kati Kandles",
  description: "Όροι Χρήσης και Πολιτική Απορρήτου για το Kati Kandles",
}

export default async function TermsPrivacyPage() {
  try {
    const page = await getPage("terms-privacy")

    if (!page) {
      notFound()
    }

    return (
      <div className="w-full pt-28 md:pt-36 pb-20 bg-[#fafaf7]">
        <div className="mx-auto max-w-3xl px-6 md:px-12 lg:px-16">
          <p className="text-[11px] tracking-[0.22em] uppercase text-[#1a1a1a]/50 mb-4">legal</p>
          <h1 className="headline-md text-[#1a1a1a] mb-12">{page.name}</h1>
          <div
            className="prose prose-lg max-w-none text-[#1a1a1a]/80 prose-headings:text-[#1a1a1a] prose-strong:text-[#1a1a1a] prose-a:text-[#1a1a1a] prose-a:underline prose-a:underline-offset-4"
            dangerouslySetInnerHTML={{ __html: page.content || "" }}
          />
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error fetching terms and privacy page:", error)
    notFound()
  }
}
