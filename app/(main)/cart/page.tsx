"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Minus, Plus, Trash2 } from "lucide-react"
import { useCart } from "@/context/cart-context"
import { formatPrice } from "@/lib/utils"

export default function CartPage() {
  const router = useRouter()
  const { cart, isLoading, removeItem, updateItemQuantity } = useCart()

  const shippingCost = cart.sub_total >= 30 ? 0 : 2
  const finalTotal =
    Math.round((cart.sub_total - cart.discount_total + shippingCost) * 100) / 100

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f7e7ce]">
        <div className="container mx-auto px-4 pt-32 pb-12 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1a1a1a] mx-auto" />
          <p className="mt-4 text-[#502e23]/70">Φόρτωση καλαθιού...</p>
        </div>
      </div>
    )
  }

  if (!cart.items?.length) {
    return (
      <div className="min-h-screen bg-[#f7e7ce]">
        <div className="container mx-auto px-4 pt-32 pb-12 text-center">
          <h1 className="headline-md text-[#1a1a1a] mb-4">το καλάθι είναι άδειο</h1>
          <p className="text-[#502e23]/70 mb-8 max-w-md mx-auto">
            Πρόσθεσε μερικά κεριά για να ξεκινήσεις.
          </p>
          <Button asChild className="bg-[#1a1a1a] hover:bg-[#1a1a1a]/85 text-white">
            <Link href="/">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7e7ce]">
      <div className="container mx-auto px-4 pt-28 md:pt-32 pb-16">
        <div className="mb-8">
          <div className="caption text-[#502e23]/60 mb-3">καλάθι</div>
          <h1 className="headline-md text-[#1a1a1a]">your bag</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-10">
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => {
              const imageUrl = item.product?.images?.[0]?.url || "/placeholder.svg?height=80&width=80"
              const productName = item.product?.name || "Product"
              return (
                <div key={item.id} className="bg-white/60 border border-white/80 rounded-2xl p-4 md:p-5">
                  <div className="flex gap-4">
                    <Link
                      href={`/products/${item.product?.slug}`}
                      className="w-20 h-20 md:w-24 md:h-24 flex-shrink-0 rounded-lg overflow-hidden bg-white"
                    >
                      <img
                        src={imageUrl}
                        alt={productName}
                        className="w-full h-full object-contain p-2"
                      />
                    </Link>

                    <div className="flex-1 min-w-0 flex flex-col">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <Link
                            href={`/products/${item.product?.slug}`}
                            className="text-base md:text-lg font-medium text-[#1a1a1a] hover:opacity-70 transition-opacity line-clamp-2"
                          >
                            {productName}
                          </Link>
                          <p className="text-sm text-[#502e23]/65 mt-1">
                            {formatPrice(item.price)}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          className="text-[#502e23]/70 hover:text-red-600 p-2 h-8 w-8"
                          aria-label="Αφαίρεση"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="mt-auto pt-3 flex items-center justify-between">
                        <div className="inline-flex items-center border border-[#502e23]/20 rounded-full">
                          <button
                            onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="p-2 text-[#1a1a1a] hover:bg-[#502e23]/10 rounded-l-full disabled:opacity-30"
                            aria-label="Μείωση"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="px-3 text-sm font-medium min-w-[2rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                            className="p-2 text-[#1a1a1a] hover:bg-[#502e23]/10 rounded-r-full"
                            aria-label="Αύξηση"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <p className="font-semibold text-[#1a1a1a]">
                          {formatPrice(item.price_total)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-28 bg-white/70 border border-white/90 p-6 rounded-2xl">
              <h2 className="text-lg font-semibold mb-5 text-[#1a1a1a]">σύνοψη παραγγελίας</h2>

              <div className="space-y-2.5 mb-5 text-sm">
                <div className="flex justify-between text-[#502e23]">
                  <span>Προϊόντα ({cart.item_quantity})</span>
                  <span>{formatPrice(cart.sub_total)}</span>
                </div>
                {cart.discount_total > 0 && (
                  <div className="flex justify-between text-green-700">
                    <span>Έκπτωση {cart.coupon?.code ? `(${cart.coupon.code})` : ""}</span>
                    <span>-{formatPrice(cart.discount_total)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#502e23]">
                  <span>Μεταφορικά</span>
                  {shippingCost === 0 ? (
                    <span className="text-green-700 font-semibold">Δωρεάν</span>
                  ) : (
                    <span>{formatPrice(shippingCost)}</span>
                  )}
                </div>
                {cart.sub_total < 30 && cart.sub_total > 0 && (
                  <div className="text-xs text-[#502e23]/65 bg-white/60 rounded-md p-2">
                    Πρόσθεσε ακόμα {formatPrice(30 - cart.sub_total)} για δωρεάν αποστολή
                  </div>
                )}
              </div>

              <hr className="my-4 border-[#502e23]/15" />
              <div className="flex justify-between font-semibold text-base md:text-lg mb-6">
                <span>Σύνολο</span>
                <span>{formatPrice(finalTotal)}</span>
              </div>

              <Button
                className="w-full bg-[#1a1a1a] hover:bg-[#1a1a1a]/85 text-white tracking-wide"
                size="lg"
                onClick={() => router.push("/checkout")}
              >
                Ολοκλήρωση παραγγελίας
              </Button>

              <Link
                href="/"
                className="mt-3 block text-center text-sm text-[#502e23]/70 hover:text-[#502e23] underline-offset-4 hover:underline"
              >
                συνέχεια αγορών
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
