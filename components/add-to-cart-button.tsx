"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
  const router = useRouter()
  const [isAdding, setIsAdding] = useState(false)
  const [isAdded, setIsAdded] = useState(false)
  const { addToast } = useSafeToast()

  const handleAddToCart = async () => {
    if (isAdding || isAdded || disabled) return
    setIsAdding(true)

    try {
      let product = productData
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

      addItem({ product_id: productId, variant_id: variantId, product, quantity })
      setIsAdded(true)

      addToast({
        title: "Προστέθηκε στο καλάθι",
        variant: "success",
        action: (
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/cart")}
            className="ml-auto bg-transparent border-[#1a1a1a]/20 text-[#1a1a1a] hover:bg-[#1a1a1a]/5"
          >
            Προβολή Καλαθιού
          </Button>
        ),
      })

      onSuccess?.()
      setTimeout(() => setIsAdded(false), 2000)
    } catch (error) {
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
      className={`${className} ${variant === "default" ? "bg-[#1a1a1a] hover:bg-[#1a1a1a]/85 text-white border-[#1a1a1a]" : ""}`}
      variant={variant}
      size={size}
      disabled={disabled || isAdding}
      aria-label="Προσθήκη στο καλάθι"
    >
      {isAdding ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Προσθήκη...
        </>
      ) : isAdded ? (
        <>
          <Check className="mr-2 h-4 w-4" />
          Προστέθηκε
        </>
      ) : (
        <>
          {showIcon && <ShoppingCart className="mr-2 h-4 w-4" />}
          Προσθήκη στο καλάθι
        </>
      )}
    </Button>
  )
}
