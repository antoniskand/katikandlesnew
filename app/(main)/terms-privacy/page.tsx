import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getPage } from "@/lib/supabase-api"

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
      <div className="w-full pt-28 md:pt-32 pb-16 bg-[#f7e7ce]">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="caption text-[#502e23]/60 mb-3">legal</div>
          <h1 className="headline-md text-[#1a1a1a] mb-8">{page.name}</h1>
          <div
            className="prose prose-lg max-w-none text-[#502e23]/85 prose-headings:text-[#1a1a1a] prose-strong:text-[#1a1a1a] prose-a:text-[#ff6b35]"
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
