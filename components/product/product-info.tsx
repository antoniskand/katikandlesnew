"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { AddToCartButton } from "@/components/add-to-cart-button"

interface ProductInfoProps {
  product: {
    id?: string
    name?: string
    description?: string
    price?: number
    sale_price?: number
    currency?: string
    stock_status?: string
    stock_level?: number
    variants?: Array<{
      id: string
      name: string
      values: Array<{
        id: string
        name: string
      }>
    }>
    attributes?: Record<string, any>
  }
}

export function ProductInfo({ product }: ProductInfoProps) {
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({})
  const [quantity, setQuantity] = useState(1)

  // Safely handle product data
  const productId = product?.id || ""
  const productName = product?.name || "Product"
  const productDescription = product?.description || ""
  const productPrice = typeof product?.price === "number" ? product.price : 0
  const productSalePrice = typeof product?.sale_price === "number" ? product.sale_price : undefined
  const currency = product?.currency || "EUR"
  const variants = Array.isArray(product?.variants) ? product.variants : []

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price)
  }

  const isOnSale = productSalePrice !== undefined && productSalePrice < productPrice
  const displayPrice = isOnSale ? productSalePrice : productPrice
  const isInStock = product?.stock_status === "in_stock" || (product?.stock_level && product.stock_level > 0)

  return (
    <div className="space-y-6">
      {/* Product Title */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">{productName}</h1>
      </div>

      {/* Price */}
      <div className="flex items-center space-x-2">
        <span className="text-3xl font-bold text-gray-900">{formatPrice(displayPrice)}</span>
        {isOnSale && <span className="text-xl text-gray-500 line-through">{formatPrice(productPrice)}</span>}
        {isOnSale && <Badge variant="destructive">Sale</Badge>}
      </div>

      {/* Description */}
      {productDescription && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
          <div
            className="text-gray-700 prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: productDescription }}
          />
        </div>
      )}

      <Separator />

      {/* Variants */}
      {variants.length > 0 && (
        <div className="space-y-4">
          {variants.map((variant) => (
            <div key={variant.id}>
              <h4 className="text-sm font-medium text-gray-900 mb-2">{variant.name}</h4>
              <div className="flex flex-wrap gap-2" role="group" aria-labelledby={`variant-${variant.id}-label`}>
                <span id={`variant-${variant.id}-label`} className="sr-only">
                  {variant.name} options
                </span>
                {variant.values.map((value) => (
                  <Button
                    key={value.id}
                    variant={selectedVariants[variant.id] === value.id ? "default" : "outline"}
                    size="sm"
                    onClick={() =>
                      setSelectedVariants((prev) => ({
                        ...prev,
                        [variant.id]: value.id,
                      }))
                    }
                    aria-pressed={selectedVariants[variant.id] === value.id}
                  >
                    {value.name}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quantity */}
      <div>
        <label htmlFor="product-quantity" className="text-sm font-medium text-gray-900 block mb-2">
          Quantity
        </label>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
            aria-label="Decrease quantity"
          >
            -
          </Button>
          <input
            id="product-quantity"
            name="quantity"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Number.parseInt(e.target.value) || 1))}
            className="px-4 py-2 border rounded-md text-center min-w-[60px]"
            min="1"
            aria-label="Product quantity"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setQuantity(quantity + 1)}
            disabled={!isInStock}
            aria-label="Increase quantity"
          >
            +
          </Button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        {isInStock ? (
          <AddToCartButton
            productId={productId}
            quantity={quantity}
            variantId={selectedVariants ? Object.values(selectedVariants)[0] : undefined}
            className="w-full"
          />
        ) : (
          <Button disabled className="w-full bg-gray-300 hover:bg-gray-300 cursor-not-allowed">
            Out of Stock
          </Button>
        )}
      </div>
    </div>
  )
}
