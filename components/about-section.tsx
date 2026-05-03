"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { ChevronDown } from "lucide-react"

export function AboutSection() {
  const [isExpanded, setIsExpanded] = useState(false)
  const title = "Crafting Moods,\nNot Just Candles"

  // First two paragraphs shown by default (up to "αναβαθμίζουν το περιβάλλον σας.")
  const visibleParagraphs = [
    "Στην Kati Kandles, πιστεύουμε σε κάτι περισσότερο από την δημιουργία απλών κεριών. Δημιουργούμε εμπειρίες, στιγμές, ταξίδια στον χρόνο, που μεταμορφώνουν το χώρο σας.",
    "Κάθε μία από τις συλλογές περιορισμένης έκδοσης αφηγείται μια μοναδική ιστορία μέσω του αρώματος και του σχεδιασμού. Επιλέγουμε προσεκτικά συστατικά με βάση τη σόγια, vegan και φυτικά για να δημιουργήσουμε αρωματικά που αναβαθμίζουν το περιβάλλον σας.",
  ]

  // Hidden paragraphs shown after "view more"
  const hiddenParagraphs = [
    "Τα κεριά μας είναι χειροποίητα σε μικρές παρτίδες, εξασφαλίζοντας ποιότητα και μοναδικότητα σε κάθε κομμάτι. Είμαστε παθιασμένοι με τη δημιουργία προϊόντων που είναι τόσο όμορφα όσο και αρωματικά.",
    'Γι\' αυτό λέμε ότι τα κεριά μας "Smell Like WhatEverness" — επειδή είναι σχεδιασμένα να ταιριάζουν με όποια διάθεση έχετε ή θέλετε να έχετε.',
  ]

  const imageUrl = "/LIST_1.JPG"

  return (
    <section className="relative py-24 bg-[#f7e7ce] overflow-hidden">
      {/* MASSIVE Background Typography */}
      <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 z-0 pointer-events-none overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2 }}
          viewport={{ once: true }}
        >
          <h2 className="display-huge text-[#502e23] opacity-5 whitespace-nowrap">
            crafting moods
          </h2>
        </motion.div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1">
            
            
            <h3 className="headline-md text-[#502e23] mb-8 whitespace-pre-line">{title.toLowerCase()}</h3>
            
            {/* Always visible paragraphs */}
            {visibleParagraphs.map((paragraph, index) => (
              <motion.p
                key={index}
                className="body-md text-[#502e23]/80 mb-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                {paragraph}
              </motion.p>
            ))}

            {/* Expandable hidden paragraphs */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  {hiddenParagraphs.map((paragraph, index) => (
                    <motion.p
                      key={index}
                      className="body-md text-[#502e23]/80 mb-4"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      {paragraph}
                    </motion.p>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* View more / View less button */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="inline-flex items-center gap-2 text-[#502e23] font-medium hover:opacity-70 transition-opacity mt-2"
            >
              <span>{isExpanded ? "Λιγότερα" : "Περισσότερα"}</span>
              <ChevronDown 
                className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} 
              />
            </button>
          </div>
          <div className="order-1 lg:order-2 relative">
            <motion.div
              className="rounded-2xl overflow-hidden"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Image
                src={imageUrl || "/placeholder.svg"}
                alt="Kati Kandles Product Collection"
                width={600}
                height={600}
                className="w-full h-auto object-cover"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = "/placeholder.svg?height=600&width=600&text=Kati+Kandles"
                }}
              />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
