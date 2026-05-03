import Image from "next/image"
import Link from "next/link"
import type { Product } from "@/types/product"

interface MinimalProductCardProps {
  product: Product
}

export function MinimalProductCard({ product }: MinimalProductCardProps) {
  // Handle missing data with fallbacks
  const name = product.name || "Unnamed Product"
  const price = product.price || 0
  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: product.currency || "USD",
  }).format(price)

  // Get the first image or use a placeholder
  const imageUrl =
    product.images && product.images[0]?.url
      ? product.images[0].url
      : `/placeholder.svg?height=400&width=400&query=candle%20product`

  return (
    <div className="group block">
      <Link href={`/products/${product.slug || product.id}`} className="block">
        <div className="aspect-square overflow-hidden bg-gray-100">
          <Image
            src={imageUrl || "/placeholder.svg"}
            alt={name}
            width={400}
            height={400}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div className="mt-4 text-center">
          <h3 className="text-lg uppercase tracking-wider">{name}</h3>
          <p className="text-sm text-gray-500 mt-1">by Kati Kandles</p>
          <p className="mt-2 font-light">{formattedPrice}</p>
        </div>
      </Link>
    </div>
  )
}
