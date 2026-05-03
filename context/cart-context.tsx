// context/cart-context.tsx
// Cart is now 100% client-side (localStorage + React state)
// No server-side cart — validation happens at checkout

"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import type { CartItem, Cart, Coupon } from "@/types/product"

const CART_STORAGE_KEY = "kk_cart"
const COUPON_STORAGE_KEY = "kk_coupon"

const FREE_SHIPPING_THRESHOLD = 30
const STANDARD_SHIPPING_PRICE = 2

interface CartContextType {
  cart: Cart
  cartCount: number
  isLoading: boolean
  addItem: (item: {
    product_id: string
    variant_id?: string
    product: CartItem["product"]
    quantity?: number
  }) => void
  removeItem: (itemId: string) => void
  updateItemQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  applyCoupon: (coupon: Coupon) => void
  removeCoupon: () => void
  getAppliedCoupon: () => Coupon | null
}

function createEmptyCart(): Cart {
  return {
    items: [],
    item_quantity: 0,
    sub_total: 0,
    discount_total: 0,
    shipping_total: 0,
    grand_total: 0,
    currency: "EUR",
    coupon: null,
  }
}

function generateItemId(): string {
  return `item_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

function calculateShipping(subtotal: number): number {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_PRICE
}

function calculateDiscount(coupon: Coupon | null, subtotal: number): number {
  if (!coupon) return 0
  if (coupon.min_order_amount && subtotal < coupon.min_order_amount) return 0

  switch (coupon.discount_type) {
    case "percent":
      return Math.round((subtotal * (coupon.discount_percent || 0)) / 100 * 100) / 100
    case "fixed":
      return Math.min(coupon.discount_amount || 0, subtotal)
    case "shipping":
      return 0
    default:
      return 0
  }
}

function recalculateCart(items: CartItem[], coupon: Coupon | null): Cart {
  const item_quantity = items.reduce((sum, item) => sum + item.quantity, 0)
  const sub_total = Math.round(items.reduce((sum, item) => sum + item.price_total, 0) * 100) / 100
  const discount_total = calculateDiscount(coupon, sub_total)
  const shipping_total = coupon?.discount_type === "shipping" ? 0 : calculateShipping(sub_total)
  const grand_total = Math.round((sub_total - discount_total + shipping_total) * 100) / 100

  return {
    items,
    item_quantity,
    sub_total,
    discount_total,
    shipping_total,
    grand_total,
    currency: "EUR",
    coupon: coupon
      ? {
          code: coupon.code,
          name: coupon.name,
          discount_type: coupon.discount_type,
          discount_amount: coupon.discount_amount,
          discount_percent: coupon.discount_percent,
        }
      : null,
  }
}

// ─── PERSISTENCE ───────────────────────────────────

function loadCartFromStorage(): { items: CartItem[]; coupon: Coupon | null } {
  if (typeof window === "undefined") return { items: [], coupon: null }

  try {
    const cartJson = localStorage.getItem(CART_STORAGE_KEY)
    const couponJson = localStorage.getItem(COUPON_STORAGE_KEY)

    const items = cartJson ? JSON.parse(cartJson) : []
    const coupon = couponJson ? JSON.parse(couponJson) : null

    return { items: Array.isArray(items) ? items : [], coupon }
  } catch {
    return { items: [], coupon: null }
  }
}

function saveCartToStorage(items: CartItem[], coupon: Coupon | null) {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
    if (coupon) {
      localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(coupon))
    } else {
      localStorage.removeItem(COUPON_STORAGE_KEY)
    }
  } catch (e) {
    console.error("Error saving cart:", e)
  }
}

function clearCartStorage() {
  if (typeof window === "undefined") return
  localStorage.removeItem(CART_STORAGE_KEY)
  localStorage.removeItem(COUPON_STORAGE_KEY)
}

// ─── CONTEXT ───────────────────────────────────────

const CartContext = createContext<CartContextType>({
  cart: createEmptyCart(),
  cartCount: 0,
  isLoading: true,
  addItem: () => {},
  removeItem: () => {},
  updateItemQuantity: () => {},
  clearCart: () => {},
  applyCoupon: () => {},
  removeCoupon: () => {},
  getAppliedCoupon: () => null,
})

export const useCart = () => useContext(CartContext)

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([])
  const [coupon, setCoupon] = useState<Coupon | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load from localStorage on mount
  useEffect(() => {
    const stored = loadCartFromStorage()
    setItems(stored.items)
    setCoupon(stored.coupon)
    setIsLoading(false)
  }, [])

  // Persist on change
  useEffect(() => {
    if (!isLoading) {
      saveCartToStorage(items, coupon)
    }
  }, [items, coupon, isLoading])

  const cart = recalculateCart(items, coupon)

  const addItem = useCallback(
    (newItem: {
      product_id: string
      variant_id?: string
      product: CartItem["product"]
      quantity?: number
    }) => {
      setItems((prev) => {
        // Check if same product+variant already in cart
        const existingIndex = prev.findIndex(
          (item) =>
            item.product_id === newItem.product_id &&
            item.variant_id === (newItem.variant_id || undefined)
        )

        const qty = newItem.quantity || 1
        const price = newItem.product.sale_price && newItem.product.sale_price > 0 && newItem.product.sale_price < newItem.product.price
          ? newItem.product.sale_price
          : newItem.product.price

        if (existingIndex >= 0) {
          // Update existing
          const updated = [...prev]
          const existing = updated[existingIndex]
          const newQty = existing.quantity + qty
          updated[existingIndex] = {
            ...existing,
            quantity: newQty,
            price_total: Math.round(price * newQty * 100) / 100,
          }
          return updated
        }

        // Add new item
        const cartItem: CartItem = {
          id: generateItemId(),
          product_id: newItem.product_id,
          variant_id: newItem.variant_id,
          product: newItem.product,
          quantity: qty,
          price,
          price_total: Math.round(price * qty * 100) / 100,
        }

        return [...prev, cartItem]
      })
    },
    []
  )

  const removeItem = useCallback((itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId))
  }, [])

  const updateItemQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity < 1) return
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              quantity,
              price_total: Math.round(item.price * quantity * 100) / 100,
            }
          : item
      )
    )
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
    setCoupon(null)
    clearCartStorage()
  }, [])

  const applyCoupon = useCallback((newCoupon: Coupon) => {
    setCoupon(newCoupon)
  }, [])

  const removeCoupon = useCallback(() => {
    setCoupon(null)
  }, [])

  const getAppliedCoupon = useCallback(() => coupon, [coupon])

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount: cart.item_quantity,
        isLoading,
        addItem,
        removeItem,
        updateItemQuantity,
        clearCart,
        applyCoupon,
        removeCoupon,
        getAppliedCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}
