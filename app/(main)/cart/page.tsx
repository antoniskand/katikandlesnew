"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Minus, Plus, X, Loader2 } from "lucide-react"
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
      <div className="min-h-screen bg-[#fafaf7] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-6 w-6 mx-auto animate-spin text-[#1a1a1a]/60" />
          <p className="mt-4 text-[10px] tracking-[0.22em] uppercase text-[#1a1a1a]/50">
            φόρτωση
          </p>
        </div>
      </div>
    )
  }

  if (!cart.items?.length) {
    return (
      <div className="min-h-screen bg-[#fafaf7] flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <p className="text-[11px] tracking-[0.22em] uppercase text-[#1a1a1a]/50 mb-4">
            καλάθι
          </p>
          <h1 className="headline-md text-[#1a1a1a] mb-6">
            το καλάθι σου
            <br />
            είναι άδειο
          </h1>
          <p className="text-[#1a1a1a]/65 mb-10 leading-relaxed">
            Μερικά κεριά, μερικά αρώματα — διάλεξε ό,τι σου ταιριάζει.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center bg-[#1a1a1a] hover:bg-[#1a1a1a]/85 text-white text-sm tracking-[0.06em] uppercase px-8 h-12 transition-colors"
          >
            δες τα κεριά
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fafaf7]">
      <div className="mx-auto max-w-7xl px-6 md:px-12 lg:px-16 pt-28 md:pt-36 pb-20">
        {/* Header */}
        <div className="flex items-end justify-between gap-4 mb-12 md:mb-16">
          <div>
            <p className="text-[11px] tracking-[0.22em] uppercase text-[#1a1a1a]/50 mb-3">
              καλάθι
            </p>
            <h1 className="headline-md text-[#1a1a1a]">
              {cart.item_quantity} {cart.item_quantity === 1 ? "αντικείμενο" : "αντικείμενα"}
            </h1>
          </div>
          <Link
            href="/"
            className="hidden md:inline-block text-xs tracking-[0.12em] uppercase text-[#1a1a1a]/60 hover:text-[#1a1a1a] border-b border-[#1a1a1a]/20 hover:border-[#1a1a1a] pb-0.5 transition-colors"
          >
            συνέχεια αγορών
          </Link>
        </div>

        <div className="grid lg:grid-cols-[1fr_22rem] gap-12 lg:gap-16">
          {/* Items column */}
          <div className="border-t border-[#1a1a1a]">
            {cart.items.map((item) => {
              const imageUrl = item.product?.images?.[0]?.url
              const productName = item.product?.name || "Product"
              return (
                <div
                  key={item.id}
                  className="grid grid-cols-[5rem_1fr_auto] md:grid-cols-[7rem_1fr_auto] gap-4 md:gap-8 py-6 md:py-8 border-b border-[#1a1a1a]/12 items-center"
                >
                  <Link
                    href={`/products/${item.product?.slug}`}
                    className="relative aspect-square w-20 h-20 md:w-28 md:h-28 bg-[#f4eee2] overflow-hidden"
                  >
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={productName}
                        fill
                        className="object-contain p-2 md:p-3"
                        sizes="112px"
                      />
                    ) : null}
                  </Link>

                  <div className="min-w-0">
                    <Link
                      href={`/products/${item.product?.slug}`}
                      className="block text-[#1a1a1a] hover:opacity-70 transition-opacity"
                    >
                      <p className="text-lg md:text-xl tracking-tight leading-snug line-clamp-2">
                        {productName}
                      </p>
                    </Link>
                    <p className="text-xs tracking-[0.12em] uppercase text-[#1a1a1a]/50 mt-2 tabular-nums">
                      {formatPrice(item.price)} · ανά τεμάχιο
                    </p>

                    <div className="mt-4 inline-flex items-center border border-[#1a1a1a]/20">
                      <button
                        onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="px-3 h-9 text-[#1a1a1a] hover:bg-[#1a1a1a]/5 disabled:opacity-30 transition-colors"
                        aria-label="Μείωση"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="px-3 h-9 inline-flex items-center text-sm tabular-nums min-w-[2.25rem] justify-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                        className="px-3 h-9 text-[#1a1a1a] hover:bg-[#1a1a1a]/5 transition-colors"
                        aria-label="Αύξηση"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3 md:gap-4 self-start md:self-center">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-[#1a1a1a]/40 hover:text-[#1a1a1a] transition-colors"
                      aria-label="Αφαίρεση"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <p className="text-[#1a1a1a] text-lg md:text-xl tabular-nums tracking-tight">
                      {formatPrice(item.price_total)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Summary */}
          <aside className="lg:sticky lg:top-32 lg:self-start">
            <p className="text-[11px] tracking-[0.22em] uppercase text-[#1a1a1a]/50 mb-6">
              σύνοψη
            </p>

            <div className="space-y-3 text-sm border-t border-[#1a1a1a]/12 pt-5">
              <Row
                label={`προϊόντα (${cart.item_quantity})`}
                value={formatPrice(cart.sub_total)}
              />
              {cart.discount_total > 0 && (
                <Row
                  label={`έκπτωση${cart.coupon?.code ? ` · ${cart.coupon.code}` : ""}`}
                  value={`−${formatPrice(cart.discount_total)}`}
                  emphasis
                />
              )}
              <Row
                label="μεταφορικά"
                value={shippingCost === 0 ? "δωρεάν" : formatPrice(shippingCost)}
                emphasis={shippingCost === 0}
              />
            </div>

            {cart.sub_total < 30 && cart.sub_total > 0 && (
              <p className="mt-4 text-[11px] tracking-[0.14em] uppercase text-[#1a1a1a]/55 leading-relaxed">
                +{formatPrice(30 - cart.sub_total)} για δωρεάν αποστολή
              </p>
            )}

            <div className="mt-8 pt-6 border-t border-[#1a1a1a] flex items-baseline justify-between gap-4">
              <span className="text-[11px] tracking-[0.22em] uppercase text-[#1a1a1a]/50">
                σύνολο
              </span>
              <span className="font-light text-[#1a1a1a] text-4xl md:text-5xl tabular-nums tracking-tight leading-none">
                {formatPrice(finalTotal)}
              </span>
            </div>

            <button
              onClick={() => router.push("/checkout")}
              className="mt-8 w-full h-14 inline-flex items-center justify-center bg-[#1a1a1a] hover:bg-[#1a1a1a]/85 text-white text-sm tracking-[0.08em] uppercase transition-colors"
            >
              ολοκλήρωση παραγγελίας
            </button>

            <Link
              href="/"
              className="lg:hidden mt-5 block text-center text-xs tracking-[0.12em] uppercase text-[#1a1a1a]/60 hover:text-[#1a1a1a]"
            >
              συνέχεια αγορών
            </Link>
          </aside>
        </div>
      </div>
    </div>
  )
}

function Row({
  label,
  value,
  emphasis,
}: {
  label: string
  value: string
  emphasis?: boolean
}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="text-[#1a1a1a]/65">{label}</span>
      <span
        className={`tabular-nums ${
          emphasis ? "text-[#0f9b81]" : "text-[#1a1a1a]"
        }`}
      >
        {value}
      </span>
    </div>
  )
}
