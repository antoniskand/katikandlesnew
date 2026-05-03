"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"

const FALLBACK_PARAGRAPHS = [
  "Το Kati Kandles γεννήθηκε μέσα από μια ανάγκη και όχι από μια επιχειρηματική στρατηγική. Ο δημιουργός του αναζητούσε έναν τρόπο να κάνει ένα δημιουργικό διάλειμμα — να μάθει κάτι καινούριο και να δημιουργήσει με τα χέρια του.",
  "Σήμερα, κάθε κερί αφηγείται μια ιστορία. Δεν είναι απλώς αντικείμενα: είναι γέφυρες που μεταφέρουν τον καθένα σε μια άλλη εποχή — στα παγωτά του χωριού, στα καλοκαιρινά φρούτα, στα φρεσκοπλυμένα σεντόνια.",
]

// Pull the first two <p> blocks out of the CMS HTML so the home teaser
// stays in sync with whatever editors save in /admin/pages → about-us.
function extractTeaser(html: string | null | undefined, fallback: string[]): string[] {
  if (!html) return fallback
  const paragraphs: string[] = []
  const re = /<p[^>]*>([\s\S]*?)<\/p>/gi
  let match: RegExpExecArray | null
  while ((match = re.exec(html)) !== null && paragraphs.length < 2) {
    const text = match[1]
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/\s+/g, " ")
      .trim()
    if (text) paragraphs.push(text)
  }
  return paragraphs.length > 0 ? paragraphs : fallback
}

export function AboutSection({ contentHtml }: { contentHtml?: string | null }) {
  const paragraphs = extractTeaser(contentHtml, FALLBACK_PARAGRAPHS)

  return (
    <section className="relative py-24 md:py-36 bg-[#fafaf7] overflow-hidden">
      {/* Massive background type — the brand line. */}
      <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 z-0 pointer-events-none overflow-hidden">
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.2 }}
          viewport={{ once: true }}
          className="-ml-[3vw]"
        >
          <span
            className="block whitespace-nowrap font-light tracking-tighter leading-none lowercase text-[#1a1a1a]"
            style={{ fontSize: "clamp(8rem, 22vw, 22rem)", opacity: 0.05 }}
          >
            kati diko mas
          </span>
        </motion.div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-12 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Text — teaser of the full /about story */}
          <div className="order-2 lg:order-1">
            <p className="text-[11px] tracking-[0.22em] uppercase text-[#1a1a1a]/50 mb-4">
              our story
            </p>
            <h3 className="headline-md text-[#1a1a1a] mb-10">
              ξεκίνησε από
              <br />
              μια εξεταστική
            </h3>

            <div className="space-y-5 text-[#1a1a1a]/75 leading-relaxed">
              {paragraphs.map((p, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  viewport={{ once: true }}
                >
                  {p}
                </motion.p>
              ))}
            </div>

            <Link
              href="/about"
              className="mt-10 inline-block text-xs tracking-[0.18em] uppercase text-[#1a1a1a] border-b border-[#1a1a1a] hover:opacity-70 pb-1 transition-opacity"
            >
              διάβασε όλη την ιστορία →
            </Link>
          </div>

          {/* Logo / brand mark */}
          <div className="order-1 lg:order-2 relative">
            <motion.div
              className="aspect-square bg-[#f4eee2] flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Image
                src="/logo.svg"
                alt="Kati Kandles"
                width={320}
                height={320}
                className="w-2/3 h-auto opacity-80"
                priority={false}
              />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
