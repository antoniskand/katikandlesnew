"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"

// Mother's Day "Creation of Mom" drop. Mirrors the AnniversaryDropSection
// language: solid color panel, massive background word, rotating decorative
// SVGs, centered hero stamp, side text column. Visuals pulled from Kati
// Kandles' Mother's Day asset pack — see public/drops/creation-of-mom/.

const BG = "#F5DAD2" // cream/peach — matches the stamp's background

export function CreationOfMomSection() {
  return (
    <section
      className="relative py-24 md:py-36 overflow-hidden z-10"
      style={{ backgroundColor: BG }}
      id="creation-of-mom"
    >
      {/* Floating decorative botanicals */}
      <Image
        src="/drops/creation-of-mom/element-1.svg"
        alt=""
        width={227}
        height={510}
        aria-hidden
        className="absolute -top-10 -left-12 w-40 md:w-56 opacity-60 pointer-events-none animate-float-slow"
      />
      <Image
        src="/drops/creation-of-mom/element-3.svg"
        alt=""
        width={392}
        height={558}
        aria-hidden
        className="absolute top-12 -right-12 w-44 md:w-60 opacity-50 pointer-events-none rotate-12 animate-float-slower"
      />
      <Image
        src="/drops/creation-of-mom/group-3.svg"
        alt=""
        width={437}
        height={330}
        aria-hidden
        className="absolute -bottom-10 -left-8 w-48 md:w-72 opacity-45 pointer-events-none -rotate-6 animate-float"
      />
      <Image
        src="/drops/creation-of-mom/element-2.svg"
        alt=""
        width={631}
        height={530}
        aria-hidden
        className="absolute bottom-16 right-0 w-56 md:w-80 opacity-40 pointer-events-none animate-float-slow"
      />

      {/* Massive background word */}
      <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 z-0 pointer-events-none overflow-hidden">
        <motion.div
          initial={{ opacity: 0, x: -80 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.2 }}
          viewport={{ once: true }}
          className="-ml-4"
        >
          <h2
            className="text-[28vw] md:text-[22vw] font-light tracking-tighter whitespace-nowrap leading-none"
            style={{ color: "#C84A4A", opacity: 0.08 }}
          >
            for mom
          </h2>
        </motion.div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left: hero stamp */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative flex items-center justify-center order-2 lg:order-1"
          >
            <div className="relative w-72 h-72 md:w-96 md:h-96 lg:w-[28rem] lg:h-[28rem]">
              <Image
                src="/drops/creation-of-mom/hero.png"
                alt="Creation of Mom — Kati Kandles"
                fill
                className="object-contain drop-shadow-[0_30px_40px_rgba(0,0,0,0.18)]"
                sizes="(max-width: 768px) 288px, (max-width: 1024px) 384px, 448px"
                priority
              />
            </div>
          </motion.div>

          {/* Right: text */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            viewport={{ once: true }}
            className="order-1 lg:order-2 text-center lg:text-left"
          >
            <div className="mb-6">
              <span
                className="inline-flex items-center gap-2 px-4 py-2 backdrop-blur-sm caption"
                style={{
                  backgroundColor: "rgba(200, 74, 74, 0.12)",
                  color: "#8A2A2A",
                }}
              >
                ✿ mother&apos;s day drop ✿
              </span>
            </div>

            <h2 className="headline-lg mb-4" style={{ color: "#1a1a1a" }}>
              creation of mom
            </h2>
            <p className="headline-sm mb-3" style={{ color: "#8A2A2A" }}>
              για όλες τις μαμάδες
            </p>

            <p
              className="body-md mb-8 max-w-lg mx-auto lg:mx-0"
              style={{ color: "rgba(26, 26, 26, 0.72)" }}
            >
              Limited edition συλλογή για τη Γιορτή της Μητέρας — εμπνευσμένη
              από το άγγιγμα που μας έφερε στον κόσμο. Χειροποίητα κεριά
              σόγιας, φτιαγμένα με αγάπη για την πρώτη μας αγάπη.
            </p>

            <div className="flex items-center gap-6 mb-10 justify-center lg:justify-start">
              <div>
                <span className="caption" style={{ color: "#8A2A2A" }}>
                  edition
                </span>
                <p className="headline-sm" style={{ color: "#1a1a1a" }}>
                  limited
                </p>
              </div>
              <div className="w-px h-10" style={{ backgroundColor: "rgba(26,26,26,0.15)" }} />
              <div>
                <span className="caption" style={{ color: "#8A2A2A" }}>
                  drops
                </span>
                <p className="headline-sm" style={{ color: "#1a1a1a" }}>
                  μάιος
                </p>
              </div>
            </div>

            <div className="flex gap-3 flex-wrap justify-center lg:justify-start">
              <Link
                href="/products"
                className="caption inline-block px-8 py-3.5 hover:opacity-90 transition-opacity font-medium uppercase tracking-wide"
                style={{
                  backgroundColor: "#1a1a1a",
                  color: "#ffffff",
                }}
              >
                δες τη συλλογή
              </Link>
              <Link
                href="/products"
                className="caption inline-block px-8 py-3.5 transition-colors font-medium uppercase tracking-wide border"
                style={{
                  borderColor: "rgba(26, 26, 26, 0.25)",
                  color: "#1a1a1a",
                }}
              >
                όλα τα κεριά
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(to right, transparent, rgba(26,26,26,0.15), transparent)",
        }}
      />
    </section>
  )
}
