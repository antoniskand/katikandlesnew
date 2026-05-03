"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import type { Drop } from "@/types/product"

interface DropInfoProps {
  drop: Drop
}

export function DropInfo({ drop }: DropInfoProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
      <div className="inline-block bg-white text-coral px-4 py-1 rounded-full text-sm font-bold mb-4">
        FEATURED DROP
      </div>
      <h2 className="text-6xl font-bold mb-6 text-white">{drop.name}</h2>
      <p className="text-xl mb-8 text-white/90">{drop.tagline}</p>

      <div className="flex flex-wrap gap-4 mb-8">
        <div className="bg-white/20 backdrop-blur-sm px-5 py-3 rounded-full text-white">Limited Edition</div>
        <div className="bg-white/20 backdrop-blur-sm px-5 py-3 rounded-full text-white">Soya Based</div>
        <div className="bg-white/20 backdrop-blur-sm px-5 py-3 rounded-full text-white">Vegan Friendly</div>
      </div>

      <p className="text-lg mb-10 text-white/80">
        Βούτυρο, λίγο αλεύρι, μια σταγόνα βανίλια και ξύσμα από φρέσκο μανταρίνι. Ένα αρωματικό ταξίδι πίσω στα πιο
        γλυκά απογεύματα, όταν ακόμα και ένα δεύτερο κομμάτι δεν ήταν αρκετό.
      </p>

      <Link href="/products">
        <Button className="bg-white hover:bg-black text-coral hover:text-white rounded-full px-8 py-6 text-base transition-colors duration-300">
          Shop This Drop
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </Link>
    </motion.div>
  )
}
