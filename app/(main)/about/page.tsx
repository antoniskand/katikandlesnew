import type { Metadata } from "next"
import { getPage } from "@/lib/db-queries"
import { BreadcrumbJsonLd } from "@/components/seo/json-ld"

export const revalidate = 60

export const metadata: Metadata = {
  title: "Η ιστορία μας",
  description:
    "Πώς ξεκίνησε το Kati Kandles — από μια εξεταστική και τη ζάλη του φοιτητή, μέχρι σήμερα. Χειροποίητα κεριά σόγιας, φτιαγμένα στην Ελλάδα.",
  alternates: { canonical: "/about" },
}

export default async function AboutPage() {
  const page = await getPage("about-us").catch(() => null)

  return (
    <main className="bg-[#fafaf7] pt-28 md:pt-36 pb-24">
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
        <h1 className="headline-md text-[#1a1a1a] mb-14">
          {page?.name || "kati diko mas"}
        </h1>

        <article
          className="prose prose-lg max-w-none text-[#1a1a1a]/80
            prose-headings:text-[#1a1a1a] prose-headings:font-normal
            prose-h2:tracking-tight prose-h2:lowercase prose-h2:text-3xl prose-h2:mt-12
            prose-h3:tracking-tight prose-h3:text-xl prose-h3:mt-10 prose-h3:mb-4
            prose-strong:text-[#1a1a1a]
            prose-a:text-[#1a1a1a] prose-a:underline prose-a:underline-offset-4
            prose-li:my-1
            prose-p:leading-relaxed"
          dangerouslySetInnerHTML={{ __html: page?.content || FALLBACK }}
        />

        <div className="mt-20 pt-10 border-t border-[#1a1a1a]/12">
          <p className="text-[11px] tracking-[0.22em] uppercase text-[#1a1a1a]/50 mb-2">
            kati diko mas
          </p>
          <p className="text-2xl md:text-3xl tracking-tight text-[#1a1a1a] mb-10">
            από εμάς, για εσάς.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="/products"
              className="inline-flex items-center justify-center bg-[#1a1a1a] hover:bg-[#1a1a1a]/85 text-white text-sm tracking-[0.06em] uppercase px-8 h-12 transition-colors"
            >
              δες τα κεριά
            </a>
            <a
              href="/contact"
              className="inline-flex items-center text-xs tracking-[0.12em] uppercase text-[#1a1a1a]/60 hover:text-[#1a1a1a] border-b border-[#1a1a1a]/20 hover:border-[#1a1a1a] pb-1 transition-colors"
            >
              μίλα μας →
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}

// Used only if the DB row is missing (won't normally happen — see admin Pages).
const FALLBACK = `
<p>Το Kati Kandles γεννήθηκε μέσα από μια ανάγκη και όχι από μια επιχειρηματική στρατηγική. Κατά τη διάρκεια μιας απαιτητικής εξεταστικής περιόδου, ο δημιουργός του αναζητούσε έναν τρόπο να κάνει ένα δημιουργικό διάλειμμα — να μάθει κάτι καινούριο και να δημιουργήσει με τα χέρια του. Έτσι ξεκίνησε να φτιάχνει κεριά: αρχικά για φίλους που είχε καιρό να δει, και για τον ίδιο.</p>
<p>Με υπόβαθρο στα μαθηματικά, ανακάλυψε μέσα από το κερί μια νέα εξίσωση: δημιουργικότητα, επιχειρηματικότητα, αναμνήσεις. Πολύ σύντομα, το Kati Kandles εξελίχθηκε σε κάτι περισσότερο από ένα χόμπι.</p>
<p>Φωτογραφίσεις, διαχείριση social media, εξυπηρέτηση πελατών, συσκευασία και επαγγελματική συνέπεια έγιναν καθημερινά στοιχήματα. Ένα project που ξεκίνησε από έναν φοιτητή χωρίς εμπειρία στις επιχειρήσεις, αλλά με ξεκάθαρο όραμα.</p>
<p>Σήμερα, κάθε κερί του Kati Kandles αφηγείται μια ιστορία. Δεν είναι απλώς αντικείμενα: είναι γέφυρες που μεταφέρουν τον καθένα σε μια άλλη εποχή.</p>
<p>Το Kati Kandles συνδέει ανθρώπους μέσα από κοινές αναμνήσεις και γνώριμες μυρωδιές. Είναι μια εμπειρία που ξυπνά κάτι αληθινό, κάτι δικό μας.</p>
`
