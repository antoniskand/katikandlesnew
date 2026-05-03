"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { AddToCartButton } from "@/components/add-to-cart-button"

interface RelatedProductsProps {
  currentProductId?: string
  categoryId?: string
  upSells?: Array<{
    id?: string
    product_id?: string
    product?: {
      id?: string
      name?: string
      slug?: string
      price?: number
      sale_price?: number
      currency?: string
      images?: Array<{
        file?: {
          url?: string
        }
      }>
      attributes?: Record<string, any>
    }
  }>
  title?: string
}

export function RelatedProducts({
  currentProductId,
  categoryId,
  upSells = [],
  title = "You may also like",
}: RelatedProductsProps) {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchRelatedProducts() {
      try {
        setLoading(true)
        setError(null)

        // First, check if we have valid up-sells
        if (upSells && upSells.length > 0) {
          const validUpSells = upSells
            .filter((item) => item?.product && item.product.id && item.product.id !== currentProductId)
            .map((item) => item.product)
            .filter(Boolean)

          // If we have enough up-sells, use them
          if (validUpSells.length >= 2) {
            setProducts(validUpSells)
            setLoading(false)
            return
          }
        }

        // Use a try-catch for each fetch attempt to handle failures gracefully
        let fetchedProducts: any[] = []

        // Try to fetch by category first if we have a categoryId
        if (categoryId) {
          try {
            // Use absolute URL with origin to avoid path resolution issues
            const origin = window.location.origin
            const response = await fetch(`${origin}/api/products?category=${categoryId}&limit=8`, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                // Add a cache control header to prevent caching issues
                "Cache-Control": "no-cache",
              },
            })

            if (response.ok) {
              const data = await response.json()
              if (data.results && Array.isArray(data.results)) {
                fetchedProducts = data.results
                  .filter((product: any) => product && product.id !== currentProductId)
                  .slice(0, 4)

                if (fetchedProducts.length >= 2) {
                  setProducts(fetchedProducts)
                  setLoading(false)
                  return
                }
              }
            }
          } catch (categoryError) {
            console.error("Error fetching category products:", categoryError)
            // Continue to fallback - don't exit the function
          }
        }

        // Fallback: fetch random products if we don't have enough products yet
        try {
          const origin = window.location.origin
          const response = await fetch(`${origin}/api/products?limit=8`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-cache",
            },
          })

          if (response.ok) {
            const data = await response.json()
            if (data.results && Array.isArray(data.results)) {
              fetchedProducts = data.results
                .filter((product: any) => product && product.id !== currentProductId)
                .slice(0, 4)

              setProducts(fetchedProducts)
            } else {
              throw new Error("Invalid data format received from API")
            }
          } else {
            throw new Error(`API responded with status: ${response.status}`)
          }
        } catch (fallbackError: any) {
          console.error("Error fetching fallback products:", fallbackError)
          // If we have at least some products from previous attempts, use those
          // Otherwise, set an error
          if (fetchedProducts.length === 0) {
            setError("Could not load related products")
          }
        }
      } catch (err: any) {
        console.error("Error in related products component:", err)
        setError(err.message || "Failed to load related products")
        // Set empty products array to avoid undefined errors
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    // Only run the effect if we have a currentProductId
    if (currentProductId) {
      fetchRelatedProducts()
    } else {
      setLoading(false)
    }
  }, [currentProductId, categoryId, upSells])

  if (loading) {
    return (
      <div className="mt-16 pt-16 border-t border-gray-200">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-8">{title}</h2>
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="aspect-square w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Don't show the section if there are no related products or there's an error
  if (error || !products || products.length === 0) {
    return null
  }

  return (
    <div className="mt-16 pt-16 border-t border-gray-200">
      <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-8">{title}</h2>
      <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => {
          // Skip if product is missing critical data
          if (!product || !product.id || !product.slug) {
            return null
          }

          // Handle missing data with fallbacks
          const name = product.name || "Unnamed Product"
          const price = product.price || 0
          const formattedPrice = new Intl.NumberFormat("el-GR", {
            style: "currency",
            currency: product.currency || "EUR",
          }).format(price)

          // Get the first image or use a placeholder
          const imageUrl =
            product.images && product.images[0]?.file?.url
              ? product.images[0].url
              : `/placeholder.svg?height=400&width=400&query=candle%20product`

          // Check for latest drop attribute
          const isLatestDrop =
            product.attributes?.["latest drop"] ||
            product.attributes?.["latest_drop"] ||
            product.attributes?.collection === "latest drop"

          return (
            <div
              key={product.id}
              className="group relative overflow-hidden rounded-lg transition-all duration-300 hover:shadow-lg bg-gray-100"
            >
              {/* Product Image and Details */}
              <div className="product-info">
                <Link href={`/products/${product.slug}`} className="block">
                  <div className="aspect-square overflow-hidden bg-gray-50">
                    <Image
                      src={imageUrl || "/placeholder.svg"}
                      alt={name}
                      width={400}
                      height={400}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        // Fallback if image fails to load
                        const target = e.target as HTMLImageElement
                        target.src = "/placeholder.svg?height=400&width=400"
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  </div>
                  <div className="p-4">
                    <Badge
                      className={`mb-2 ${
                        isLatestDrop
                          ? "bg-[#c02132] text-white hover:bg-[#c02132]/90 font-semibold"
                          : "bg-black/10 text-black hover:bg-black/20"
                      }`}
                    >
                      {isLatestDrop ? "VDay Drop" : "All Time Classic"}
                    </Badge>
                    <h3 className="line-clamp-1 text-lg font-medium">{name}</h3>
                    <p className="mt-2 font-semibold text-black">{formattedPrice}</p>
                  </div>
                </Link>
              </div>

              {/* Add to Cart Button */}
              <div className="px-4 pb-4 pt-1 space-y-2 relative z-10">
                <AddToCartButton productId={product.id} className="w-full text-sm py-1 h-auto" />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
