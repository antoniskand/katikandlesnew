"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

interface ProductGalleryProps {
  product: {
    name?: string
    slug?: string
    images?: Array<{
      file?: {
        url?: string
        width?: number
        height?: number
      }
      caption?: string
    }>
  }
}

export function ProductGallery({ product }: ProductGalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Safely handle product data
  const productName = product?.name || "Product"
  const productSlug = product?.slug || ""
  const images = Array.isArray(product?.images) ? product.images : []
  const hasMultipleImages = images.length > 1

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  if (images.length === 0) {
    return (
      <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
        <span className="text-gray-400">No image available</span>
      </div>
    )
  }

  // Special layout for v-day-for-singles product with two overlapping images
  if (productSlug === "v-day-for-singles" && images.length >= 2) {
    return (
      <div className="relative aspect-square flex items-center justify-center">
        <div className="relative w-full h-full">
          {/* First Image - Back */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="absolute top-0 left-0 w-[65%] h-[65%]"
          >
            <Image
              src={images[0]?.file?.url || "/placeholder.svg?height=600&width=600"}
              alt={images[0]?.caption || productName || "Product image 1"}
              fill
              className="object-contain"
              priority
            />
          </motion.div>

          {/* Second Image - Front (overlapping) */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="absolute bottom-0 right-0 w-[65%] h-[65%]"
          >
            <Image
              src={images[1]?.file?.url || "/placeholder.svg?height=600&width=600"}
              alt={images[1]?.caption || productName || "Product image 2"}
              fill
              className="object-contain"
            />
          </motion.div>
        </div>
      </div>
    )
  }

  const currentImage = images[currentImageIndex] || {}
  const imageUrl = currentImage?.file?.url || "/placeholder.svg?height=600&width=600"
  const imageAlt = currentImage?.caption || productName || "Product image"

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
        <Image
          src={imageUrl || "/placeholder.svg"}
          alt={imageAlt}
          fill
          className="object-cover object-center"
          priority
        />

        {/* Navigation Arrows */}
        {hasMultipleImages && (
          <>
            <Button
              variant="outline"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
              onClick={prevImage}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
              onClick={nextImage}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}

        {/* Image Counter */}
        {hasMultipleImages && (
          <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
            {currentImageIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnail Navigation */}
      {hasMultipleImages && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`relative aspect-square overflow-hidden rounded-md border-2 transition-colors ${
                index === currentImageIndex ? "border-black" : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <Image
                src={image?.file?.url || "/placeholder.svg?height=150&width=150"}
                alt={image?.caption || `Product image ${index + 1}`}
                fill
                className="object-cover object-center"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
