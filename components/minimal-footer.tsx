"use client"

import Link from "next/link"
import Image from "next/image"
import { Instagram } from "lucide-react"
import { motion } from "framer-motion"
import { useCategories } from "@/context/categories-context"

const categoryMap: Record<string, { href: string; label: string }> = {
  candles: { href: "/candles", label: "Κεριά" },
  fragrances: { href: "/fragrances", label: "Αρωματικά" },
  "car-fragrances": { href: "/car-fragrances", label: "Αρωματικά Αυτοκινήτου" },
  "wax-melts": { href: "/wax-melts", label: "Wax Melts" },
}

export function MinimalFooter() {
  const { availableCategories } = useCategories()

  return (
    <footer className="bg-[#1a1a1a] border-t border-[#1a1a1a] w-full mt-auto py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-1">
            <div className="mb-5">
              <Image
                src="/logo.svg"
                alt="Kati Kandles"
                width={180}
                height={50}
                className="h-10 w-auto invert"
              />
            </div>
            <p className="text-white/75 mb-6 leading-relaxed">
              Handmade, limited edition, soya-based vegan candles with vibrant aesthetics.
            </p>
            <div className="flex space-x-3">
              <motion.a
                href="https://www.instagram.com/kati.kandles/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 text-white rounded-full flex items-center justify-center hover:bg-[#ff6b35] transition-colors"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </motion.a>
              <motion.a
                href="https://www.tiktok.com/@kati.kandles"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 text-white rounded-full flex items-center justify-center hover:bg-[#ff6b35] transition-colors"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                aria-label="TikTok"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-.04-.1z" />
                </svg>
              </motion.a>
            </div>
          </div>

          <div>
            <h3 className="text-base font-bold mb-4 text-white tracking-wide">Shop</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/products" className="text-white/70 hover:text-white transition-colors">
                  Όλα τα προϊόντα
                </Link>
              </li>
              {availableCategories.map(({ id }) => {
                const c = categoryMap[id]
                if (!c) return null
                return (
                  <li key={id}>
                    <Link href={c.href} className="text-white/70 hover:text-white transition-colors">
                      {c.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>

          <div>
            <h3 className="text-base font-bold mb-4 text-white tracking-wide">About</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-white/70 hover:text-white transition-colors">
                  Our Story
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-white/70 hover:text-white transition-colors">
                  Επικοινωνία
                </Link>
              </li>
              <li>
                <a
                  href="mailto:hello@katikandles.gr"
                  className="text-white/70 hover:text-white transition-colors"
                >
                  hello@katikandles.gr
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-base font-bold mb-4 text-white tracking-wide">Help</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/shipping-returns" className="text-white/70 hover:text-white transition-colors">
                  Αποστολές και Επιστροφές
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="text-white/70 hover:text-white transition-colors">
                  Πολιτική Απορρήτου
                </Link>
              </li>
              <li>
                <Link href="/terms-privacy" className="text-white/70 hover:text-white transition-colors">
                  Όροι Χρήσης
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/15 text-center text-sm text-white/60">
          <p>© {new Date().getFullYear()} Kati Kandles. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
