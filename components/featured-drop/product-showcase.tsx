"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import type { Product } from "@/types/product"

interface ProductShowcaseProps {
  product: Product
  isActive: boolean
}

export function ProductShowcase({ product, isActive }: ProductShowcaseProps) {
  const imageUrl =
    product.images && product.images[0]?.url
      ? product.images[0].url
      : `/placeholder.svg?height=400&width=400&query=candle%20product`

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center"
      initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
      animate={{
        opacity: isActive ? 1 : 0,
        scale: isActive ? 1 : 0.8,
        rotate: isActive ? 0 : -5,
        zIndex: isActive ? 10 : 0,
      }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative">
        <div
          className="absolute inset-0 bg-white/30 backdrop-blur-md rounded-3xl transform -rotate-6 scale-110"
          style={{
            animation: isActive ? "pulse-rotate 1.5s infinite alternate ease-out" : "none",
          }}
        />
        <div className="relative bg-white p-6 rounded-3xl shadow-xl transform rotate-0 z-10">
          <div className="w-64 h-64 sm:w-80 sm:h-80 overflow-hidden rounded-2xl mb-4">
            <Image
              src={imageUrl || "/placeholder.svg"}
              alt={product.name || "Product"}
              width={400}
              height={400}
              className="w-full h-full object-cover"
              loading={isActive ? "eager" : "lazy"}
            />
          </div>
          <h3 className="text-xl font-bold">{product.name}</h3>
          <p className="text-gray-600 mt-1">
            {new Intl.NumberFormat("el-GR", {
              style: "currency",
              currency: product.currency || "EUR",
            }).format(product.price || 0)}
          </p>
          <Link
            href={`/products/${product.slug || product.id}`}
            className="mt-4 inline-flex items-center text-coral font-medium"
          >
            Δείτε λεπτομέρειες <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </div>
    </motion.div>
  )
}
