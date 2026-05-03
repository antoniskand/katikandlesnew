"use client"

import Image from "next/image"
import Link from "next/link"
import type { Product } from "@/types/product"
import { formatPrice } from "@/lib/utils"

interface MinimalProductCardProps {
  product: Product
}

export function MinimalProductCard({ product }: MinimalProductCardProps) {
  const name = product.name || "Unnamed Product"
  const price = product.sale_price ?? product.price ?? 0
  const onSale = product.sale_price != null && product.sale_price < (product.price ?? 0)
  const isSoldOut = product.stock_status === "out_of_stock"

  const imageUrl =
    product.images && product.images[0]?.url
      ? product.images[0].url
      : `/placeholder.svg?height=400&width=400&query=candle`

  return (
    <Link href={`/products/${product.slug || product.id}`} className="group block product-card-hover">
      <div className="relative aspect-square overflow-hidden bg-[#f7e7ce] rounded-md">
        <Image
          src={imageUrl}
          alt={name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-contain p-6 transition-transform duration-700 group-hover:scale-105"
        />
        {onSale && (
          <span className="absolute top-3 left-3 text-[10px] uppercase tracking-widest font-medium bg-[#1a1a1a] text-white px-2 py-1 rounded-full">
            sale
          </span>
        )}
        {isSoldOut && (
          <span className="absolute top-3 right-3 text-[10px] uppercase tracking-widest font-medium bg-white text-[#1a1a1a] px-2 py-1 rounded-full">
            sold out
          </span>
        )}
      </div>
      <div className="mt-4 text-center">
        <h3 className="text-base uppercase tracking-wider text-[#1a1a1a] group-hover:opacity-70 transition-opacity">
          {name}
        </h3>
        <p className="mt-2 text-sm font-light text-[#502e23]">
          {formatPrice(price)}
          {onSale && (
            <span className="ml-2 line-through opacity-50 text-xs">
              {formatPrice(product.price)}
            </span>
          )}
        </p>
      </div>
    </Link>
  )
}
