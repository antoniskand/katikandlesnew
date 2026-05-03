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
      <div className="w-full pt-32 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-3xl font-bold mb-8">{page.name}</h1>
          <div className="prose prose-lg max-w-none mb-16" dangerouslySetInnerHTML={{ __html: page.content || "" }} />
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error fetching terms and privacy page:", error)
    notFound()
  }
}
