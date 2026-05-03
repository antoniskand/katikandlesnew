"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"

export function AboutSection() {
  const [isExpanded, setIsExpanded] = useState(false)

  const visibleParagraphs = [
    "Στην Kati Kandles, πιστεύουμε σε κάτι περισσότερο από την δημιουργία απλών κεριών. Δημιουργούμε εμπειρίες, στιγμές, ταξίδια στον χρόνο, που μεταμορφώνουν τον χώρο σου.",
    "Κάθε μία από τις συλλογές περιορισμένης έκδοσης αφηγείται μια μοναδική ιστορία μέσα από το άρωμα και τον σχεδιασμό. Επιλέγουμε προσεκτικά συστατικά με βάση τη σόγια — vegan και φυτικά — για να δημιουργήσουμε αρωματικά που αναβαθμίζουν το περιβάλλον σου.",
  ]

  const hiddenParagraphs = [
    "Τα κεριά μας είναι χειροποίητα σε μικρές παρτίδες, εξασφαλίζοντας ποιότητα και μοναδικότητα σε κάθε κομμάτι. Είμαστε παθιασμένοι με τη δημιουργία προϊόντων που είναι τόσο όμορφα όσο και αρωματικά.",
    'Γι\' αυτό λέμε ότι τα κεριά μας "smell like whateverness" — επειδή είναι σχεδιασμένα να ταιριάζουν με όποια διάθεση έχεις ή θέλεις να έχεις.',
  ]

  return (
    <section className="relative py-24 md:py-36 bg-[#fafaf7] overflow-hidden">
      {/* Massive background type */}
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
            crafting moods
          </span>
        </motion.div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-12 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="order-2 lg:order-1">
            <p className="text-[11px] tracking-[0.22em] uppercase text-[#1a1a1a]/50 mb-4">
              our story
            </p>
            <h3 className="headline-md text-[#1a1a1a] mb-10">
              crafting moods,
              <br />
              not just candles
            </h3>

            <div className="space-y-5 text-[#1a1a1a]/75 leading-relaxed">
              {visibleParagraphs.map((paragraph, index) => (
                <motion.p
                  key={index}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                  viewport={{ once: true }}
                >
                  {paragraph}
                </motion.p>
              ))}

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-5"
                  >
                    {hiddenParagraphs.map((paragraph, index) => (
                      <motion.p
                        key={index}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.08 }}
                      >
                        {paragraph}
                      </motion.p>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-8 inline-block text-xs tracking-[0.18em] uppercase text-[#1a1a1a] border-b border-[#1a1a1a] hover:opacity-70 pb-1 transition-opacity"
            >
              {isExpanded ? "λιγότερα ←" : "περισσότερα →"}
            </button>
          </div>

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
