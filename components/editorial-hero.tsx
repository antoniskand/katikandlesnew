"use client"

import Link from "next/link"
import Image from "next/image"

export function EditorialHero() {
  return (
    <section className="sticky top-0 h-screen w-full overflow-hidden bg-background z-0">
      {/* Logo - Top Center - Mobile Only */}
      <div className="md:hidden absolute top-8 left-0 right-0 z-10 flex justify-center pointer-events-none">
        <Image
          src="/Kati-Kandles-Logo-White.png"
          alt="Kati Kandles"
          width={200}
          height={55}
          className="w-auto h-12 opacity-90"
          priority
        />
      </div>

      {/* MASSIVE Vertical Background Typography - "ΚΕΡΙΑ" - Left Side */}
      <div className="absolute left-0 top-0 bottom-0 z-0 overflow-hidden pointer-events-none flex items-center">
        <div
          className="relative"
          style={{
            writingMode: "vertical-rl",
            transform: "rotate(180deg)"
          }}
        >
          <h1 className="text-[35vw] md:text-[25vw] font-light tracking-tighter text-[#f7e7ce] opacity-20 whitespace-nowrap leading-none">
            ΚΕΡΙΑ
          </h1>
        </div>
      </div>

      {/* MASSIVE Background Typography - "kati kandles" - Right Side - Larger and Higher on Mobile */}
      <div className="absolute top-0 right-0 bottom-0 z-0 overflow-hidden pointer-events-none flex flex-col justify-end">
        <div className="relative text-right -mr-8 md:-mr-4 -mb-20 md:-mb-12 -mt-2 md:-mt-4">
          <h2 className="text-[28vw] md:text-[clamp(8rem,15vw,20rem)] font-light text-[#f7e7ce] opacity-15 whitespace-nowrap leading-[0.75]">
            kati
            <br />
            <span className="inline-block translate-x-[1vw]">kandles</span>
          </h2>
        </div>
      </div>

      {/* Editorial Content - Center - Fixed Position */}
      <div className="relative z-10 h-full flex items-center justify-center px-6">
        <div className="text-center space-y-5">
          <div className="caption text-white uppercase tracking-wider">
            χειροποιητα αρωματικα σογιας
          </div>

          <h3 className="headline-lg text-white">
            smells like
            <br />
            whateverness
          </h3>

          {/* Hidden paragraph - kept for future use */}
          <p className="hidden body-md text-white/80 max-w-xl mx-auto">
            ανακαλυψε τη συλλογη περιορισμενης εκδοσης με κερια, αρωματικα και wax melts
            που μεταμορφωνουν καθε χωρο σε μια μοναδικη εμπειρια
          </p>

          {/* Hidden buttons - kept for future use */}
          <div className="hidden gap-3 pt-2 justify-center flex-wrap">
            <Link
              href="#candles"
              className="caption inline-block bg-white text-[#ff6b35] border-2 border-[#ff6b35] px-8 py-3 rounded-full hover:bg-[#ff6b35] hover:text-white transition-all hover:scale-105 font-medium uppercase tracking-wide"
            >
              κερια
            </Link>
            <Link
              href="#fragrances"
              className="caption inline-block bg-white text-[#6a1b9a] border-2 border-[#6a1b9a] px-8 py-3 rounded-full hover:bg-[#6a1b9a] hover:text-white transition-all hover:scale-105 font-medium uppercase tracking-wide"
            >
              αρωματικα
            </Link>
            <Link
              href="#wax-melts"
              className="caption inline-block bg-white text-[#ffc107] border-2 border-[#ffc107] px-8 py-3 rounded-full hover:bg-[#ffc107] hover:text-[#1a1a1a] transition-all hover:scale-105 font-medium uppercase tracking-wide"
            >
              wax melts
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll to Explore - Bottom */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
        <span className="caption text-white/70 uppercase tracking-wider text-xs">
          scroll to explore
        </span>
        <svg 
          className="w-5 h-5 text-white/70 animate-bounce" 
          fill="none" 
          strokeWidth="2" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
        </svg>
      </div>
    </section>
  )
}
