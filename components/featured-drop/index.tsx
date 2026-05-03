"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import type { Drop, Product } from "@/types/product"
import { ProductShowcase } from "./product-showcase"
import { DropInfo } from "./drop-info"

// Add animation styles
const styles = `
  @keyframes pulse-rotate {
    0% {
      transform: rotate(-6deg) scale(1.1);
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    }
    100% {
      transform: rotate(-9deg) scale(1.18);
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    }
  }
`

interface FeaturedDropProps {
  drop: Drop
  products: Product[]
}

export function FeaturedDrop({ drop, products }: FeaturedDropProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Auto-rotate products
  useEffect(() => {
    if (!products || products.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % products.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [products])

  // Add animation styles
  useEffect(() => {
    if (!isMounted) return

    const styleElement = document.createElement("style")
    styleElement.innerHTML = styles
    document.head.appendChild(styleElement)

    return () => {
      document.head.removeChild(styleElement)
    }
  }, [isMounted])

  // Safety check - if no products or drop, don't render
  if (!drop || !products || products.length === 0) {
    return null
  }

  return (
    <section className="py-24 overflow-hidden" style={{ backgroundColor: "#ff7b33" }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
        {/* Decorative elements */}
        <motion.div
          className="absolute top-20 right-20 w-64 h-64 rounded-full bg-white/10 -z-0"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 left-20 w-40 h-40 rounded-full bg-white/10 -z-0"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.15, 0.1],
          }}
          transition={{
            duration: 6,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 1,
          }}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
          <DropInfo drop={drop} />

          <div className="relative h-[500px] flex items-center justify-center">
            {products.map((product, index) => (
              <ProductShowcase key={product.id || index} product={product} isActive={index === currentIndex} />
            ))}

            {/* Product navigation dots */}
            {products.length > 1 && (
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {products.map((_, index) => (
                  <button
                    key={index}
                    className={`w-3 h-3 rounded-full ${
                      index === currentIndex ? "bg-white" : "bg-white/30"
                    } transition-colors duration-300`}
                    onClick={() => setCurrentIndex(index)}
                    aria-label={`Μετάβαση στο προϊόν ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
