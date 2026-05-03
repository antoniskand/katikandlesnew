import type { Metadata } from "next"
import { SHIPPING_HTML } from "@/lib/legal-content"

export const metadata: Metadata = {
  title: "Αποστολές & Επιστροφές | Kati Kandles",
  description: "Πολιτική ακύρωσης παραγγελίας και επιστροφής προϊόντος της Kati Kandles.",
  alternates: { canonical: "/shipping-returns" },
}

export default function ShippingReturnsPage() {
  return (
    <main className="bg-[#fafaf7] pt-28 md:pt-36 pb-20">
      <div className="mx-auto max-w-3xl px-6 md:px-12 lg:px-16">
        <p className="text-[11px] tracking-[0.22em] uppercase text-[#1a1a1a]/50 mb-4">policy</p>
        <h1 className="headline-md text-[#1a1a1a] mb-12">Αποστολές & Επιστροφές</h1>
        <div
          className="prose prose-lg max-w-none text-[#1a1a1a]/80
            prose-headings:text-[#1a1a1a] prose-headings:font-normal
            prose-h2:tracking-tight prose-h2:lowercase prose-h2:text-3xl prose-h2:mt-12
            prose-h3:tracking-tight prose-h3:text-xl prose-h3:mt-10 prose-h3:mb-4
            prose-strong:text-[#1a1a1a]
            prose-a:text-[#1a1a1a] prose-a:underline prose-a:underline-offset-4
            prose-li:my-1
            prose-p:leading-relaxed"
          dangerouslySetInnerHTML={{ __html: SHIPPING_HTML }}
        />
      </div>
    </main>
  )
}
