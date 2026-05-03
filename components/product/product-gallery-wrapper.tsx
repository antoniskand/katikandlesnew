"use client"

import { useState } from "react"
import { ProductGallery } from "./product-gallery"

export function ProductGalleryWrapper({ product }: { product: any }) {
  // Add error boundary
  const [hasError, setHasError] = useState(false)

  if (hasError) {
    return (
      <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
        <span className="text-gray-500">Unable to load product images</span>
      </div>
    )
  }

  try {
    return <ProductGallery product={product} />
  } catch (error) {
    console.error("Error rendering product gallery:", error)
    setHasError(true)
    return (
      <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
        <span className="text-gray-500">Unable to load product images</span>
      </div>
    )
  }
}
