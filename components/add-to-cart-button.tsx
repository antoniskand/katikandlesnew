"use client"

import { useState } from "react"
import { useCart } from "@/context/cart-context"
import { useSafeToast } from "@/context/toast-context"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Check, Loader2 } from "lucide-react"

interface AddToCartButtonProps {
  productId: string
  variantId?: string
  className?: string
  showIcon?: boolean
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
  size?: "default" | "sm" | "lg" | "icon"
  disabled?: boolean
  quantity?: number
  productData?: {
    name: string
    slug: string
    price: number
    sale_price?: number | null
    currency: string
    images: Array<{ url: string; alt?: string }>
  }
  onSuccess?: () => void
}

export function AddToCartButton({
  productId,
  variantId,
  className,
  showIcon = true,
  variant = "default",
  size = "default",
  disabled = false,
  quantity = 1,
  productData,
  onSuccess,
}: AddToCartButtonProps) {
  const { addItem } = useCart()
  const [isAdding, setIsAdding] = useState(false)
  const [isAdded, setIsAdded] = useState(false)
  const { addToast } = useSafeToast()

  const handleAddToCart = async () => {
    if (isAdding || isAdded || disabled) return
    setIsAdding(true)

    try {
      let product = productData

      // If no product data passed, fetch it by ID
      if (!product) {
        const res = await fetch(`/api/product-by-id/${productId}`)
        if (!res.ok) throw new Error("Failed to fetch product")
        const data = await res.json()
        product = {
          name: data.name,
          slug: data.slug,
          price: data.price,
          sale_price: data.sale_price,
          currency: data.currency || "EUR",
          images: (data.images || []).map((img: any) => ({
            url: img.url || img.file?.url || "",
            alt: img.alt || "",
          })),
        }
      }

      addItem({
        product_id: productId,
        variant_id: variantId,
        product,
        quantity,
      })

      setIsAdded(true)

      addToast({
        title: "Προστέθηκε στο καλάθι",
        variant: "success",
        action: (
          <Button
            variant="outline"
            size="sm"
            onClick={() => (window.location.href = "/cart")}
            className="ml-auto bg-white text-green-700 hover:bg-green-50 border-green-200"
          >
            Προβολή Καλαθιού
          </Button>
        ),
      })

      if (onSuccess) onSuccess()

      setTimeout(() => setIsAdded(false), 2000)
    } catch (error) {
      console.error("Error adding to cart:", error)
      addToast({
        title: "Σφάλμα προσθήκης στο καλάθι",
        description: error instanceof Error ? error.message : "Παρακαλώ δοκιμάστε ξανά.",
        variant: "destructive",
      })
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <Button
      onClick={handleAddToCart}
      className={`${className} ${variant === "default" ? "bg-black hover:bg-gray-800 text-white border-black" : ""}`}
      variant={variant}
      size={size}
      disabled={disabled || isAdding}
      aria-label="Προσθήκη στο καλάθι"
    >
      {isAdding ? (
        <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Προσθήκη...</>
      ) : isAdded ? (
        <><Check className="mr-2 h-4 w-4" />Προστέθηκε</>
      ) : (
        <>{showIcon && <ShoppingCart className="mr-2 h-4 w-4" />}Προσθήκη στο καλάθι</>
      )}
    </Button>
  )
}
