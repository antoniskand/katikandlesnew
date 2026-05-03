"use client"

import { useState } from "react"
import { ProductInfo } from "./product-info"

export function ProductInfoWrapper({ product }: { product: any }) {
  // Add error boundary
  const [hasError, setHasError] = useState(false)

  if (hasError) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">{product?.name || "Product"}</h1>
        <p className="text-gray-500">Product information unavailable</p>
        <a
          href="/products"
          className="inline-block bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors"
        >
          Back to Products
        </a>
      </div>
    )
  }

  try {
    return <ProductInfo product={product} />
  } catch (error) {
    console.error("Error rendering product info:", error)
    setHasError(true)
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">{product?.name || "Product"}</h1>
        <p className="text-gray-500">Product information unavailable</p>
        <a
          href="/products"
          className="inline-block bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors"
        >
          Back to Products
        </a>
      </div>
    )
  }
}
