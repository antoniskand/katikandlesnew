"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AddToCartButton } from "@/components/add-to-cart-button"
import { formatPrice } from "@/lib/utils"

interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  sale_price?: number | null
  currency: string
  images: Array<{
    file?: { url?: string }
    url?: string
    caption?: string
  }>
  categories: Array<{ id: string; name: string }>
  variants?: Array<{
    id: string
    name: string
    values?: Array<{ id: string; name: string }>
  }>
  stock_status?: string
  stock_level?: number
  attributes?: Record<string, unknown>
}

interface EditorialProductViewProps {
  product: Product
}

// Per-attribute panel color so each product gets a distinct editorial feel.
function panelColor(attrs: Record<string, unknown> = {}): string {
  if (attrs.car_diffuser === "TRUE") return "#FFC107"
  if (attrs.wax_melt === "TRUE") return "#F4D8C0"
  if (attrs.fragrance_wardrobe === "TRUE") return "#7D947C"
  if (attrs.candle === "TRUE") return "#FF7A00"
  return "#F7E7CE"
}

// Pick a reasonable text/bg pair given the panel color.
function isDarkPanel(hex: string): boolean {
  const c = hex.replace("#", "")
  if (c.length !== 6) return false
  const r = parseInt(c.slice(0, 2), 16)
  const g = parseInt(c.slice(2, 4), 16)
  const b = parseInt(c.slice(4, 6), 16)
  return 0.299 * r + 0.587 * g + 0.114 * b < 165
}

export function EditorialProductView({ product }: EditorialProductViewProps) {
  const [quantity, setQuantity] = useState(1)
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({})
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(["description"]))

  const isOnSale =
    product.sale_price !== null &&
    product.sale_price !== undefined &&
    product.sale_price > 0 &&
    product.sale_price < product.price
  const displayPrice = isOnSale ? product.sale_price! : product.price
  const isInStock =
    product.stock_status === "in_stock" || (product.stock_level && product.stock_level > 0)

  const isCandle =
    product.attributes?.candle === "TRUE" ||
    product.name.toLowerCase().includes("candle") ||
    product.name.toLowerCase().includes("κερ")

  const toggleSection = (section: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev)
      if (next.has(section)) next.delete(section)
      else next.add(section)
      return next
    })
  }

  const heroBg = panelColor(product.attributes)
  const heroDark = isDarkPanel(heroBg)
  const onPanel = heroDark ? "text-white" : "text-[#1a1a1a]"
  const onPanelMuted = heroDark ? "text-white/70" : "text-[#1a1a1a]/65"

  const selectedImage =
    product.images[selectedImageIndex]?.file?.url ||
    product.images[selectedImageIndex]?.url ||
    "/placeholder.svg?height=800&width=800"

  // Use just the slug's first word as the massive bg type — keeps it readable.
  const bgWord = (product.slug.split("-")[0] || product.slug).slice(0, 14)

  return (
    <div className="min-h-screen bg-[#fafaf7] overflow-x-hidden">
      {/* === HERO: split panel === */}
      <section className="relative">
        <div className="grid lg:grid-cols-[1.05fr_1fr] min-h-[80vh]">
          {/* LEFT: colored panel + image + massive bg type */}
          <div
            className="relative overflow-hidden flex items-center justify-center py-20 md:py-28 lg:py-0"
            style={{ backgroundColor: heroBg }}
          >
            {/* Top breadcrumb */}
            <Link
              href="/"
              className={`absolute top-6 left-6 md:top-8 md:left-10 z-20 inline-flex items-center gap-2 text-xs tracking-[0.18em] uppercase ${onPanelMuted} hover:${onPanel.replace("text-", "text-")} transition-colors`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              πίσω
            </Link>

            {/* Massive bg word */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 pointer-events-none overflow-hidden">
              <motion.div
                initial={{ opacity: 0, x: -60 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1 }}
                className="-ml-[2vw]"
              >
                <span
                  className={`block whitespace-nowrap font-light tracking-tighter leading-none lowercase ${
                    heroDark ? "text-white" : "text-[#1a1a1a]"
                  }`}
                  style={{
                    fontSize: "clamp(8rem, 22vw, 22rem)",
                    opacity: 0.08,
                  }}
                >
                  {bgWord}
                </span>
              </motion.div>
            </div>

            {/* Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7 }}
              className="relative z-10 w-full max-w-md md:max-w-lg lg:max-w-xl px-8"
            >
              <div className="relative aspect-square">
                <Image
                  src={selectedImage}
                  alt={product.name}
                  fill
                  className="object-contain drop-shadow-[0_30px_40px_rgba(0,0,0,0.25)]"
                  priority
                  sizes="(max-width: 1024px) 90vw, 45vw"
                />
              </div>
            </motion.div>

            {/* Sale badge */}
            {isOnSale && (
              <span className="absolute top-6 right-6 md:top-8 md:right-10 z-20 text-[10px] tracking-[0.2em] uppercase bg-[#1a1a1a] text-white px-3 py-1.5">
                sale
              </span>
            )}
          </div>

          {/* RIGHT: info column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-[#fafaf7] flex flex-col justify-center px-6 md:px-12 lg:px-16 py-12 lg:py-20 min-w-0"
          >
            <div className="max-w-md w-full">
              {/* Category eyebrow */}
              {product.categories.length > 0 && (
                <p className="text-[11px] tracking-[0.22em] uppercase text-[#1a1a1a]/50 mb-5">
                  {product.categories[0].name}
                </p>
              )}

              {/* Name */}
              <h1 className="font-light text-[#1a1a1a] mb-8 break-words tracking-tight leading-[1.05] text-3xl md:text-4xl lg:text-5xl lowercase">
                {product.name}
              </h1>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-2">
                <span className="font-light text-[#1a1a1a] text-5xl md:text-6xl tabular-nums tracking-tight leading-none">
                  {formatPrice(displayPrice)}
                </span>
                {isOnSale && (
                  <span className="text-lg text-[#1a1a1a]/40 line-through tabular-nums">
                    {formatPrice(product.price)}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#1a1a1a]/50 mb-10">
                {isInStock ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#0f9b81]" />
                    διαθέσιμο · αποστολή 1–3 εργάσιμες
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#1a1a1a]/30" />
                    εξαντλημένο
                  </span>
                )}
              </p>

              {/* Variants */}
              {product.variants && product.variants.length > 0 && (
                <div className="space-y-5 mb-8">
                  {product.variants.map((variant) => (
                    <div key={variant.id}>
                      <p className="text-[11px] tracking-[0.2em] uppercase text-[#1a1a1a]/50 mb-3">
                        {variant.name}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {(variant.values || []).map((value) => {
                          const active = selectedVariants[variant.id] === value.id
                          return (
                            <button
                              key={value.id}
                              onClick={() =>
                                setSelectedVariants((prev) => ({
                                  ...prev,
                                  [variant.id]: value.id,
                                }))
                              }
                              className={`px-4 py-2 text-sm border transition-colors ${
                                active
                                  ? "border-[#1a1a1a] bg-[#1a1a1a] text-white"
                                  : "border-[#1a1a1a]/20 text-[#1a1a1a] hover:border-[#1a1a1a]"
                              }`}
                            >
                              {value.name}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Quantity + add to cart row */}
              <div className="flex items-stretch gap-3 mb-10">
                <div className="inline-flex items-center border border-[#1a1a1a]/20">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="px-3 h-12 text-[#1a1a1a] hover:bg-[#1a1a1a]/5 disabled:opacity-30 transition-colors"
                    aria-label="Μείωση"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-4 h-12 inline-flex items-center text-[#1a1a1a] tabular-nums min-w-[2.5rem] justify-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 h-12 text-[#1a1a1a] hover:bg-[#1a1a1a]/5 transition-colors"
                    aria-label="Αύξηση"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {isInStock ? (
                  <AddToCartButton
                    productId={product.id}
                    quantity={quantity}
                    variantId={Object.values(selectedVariants)[0]}
                    productData={{
                      name: product.name,
                      slug: product.slug,
                      price: product.price,
                      sale_price: product.sale_price,
                      currency: product.currency,
                      images: product.images.map((img) => ({
                        url: img.file?.url || img.url || "",
                        alt: img.caption || "",
                      })),
                    }}
                    className="flex-1 h-12 bg-[#1a1a1a] hover:bg-[#1a1a1a]/85 text-white text-sm tracking-[0.06em] uppercase transition-colors"
                  />
                ) : (
                  <Button
                    disabled
                    className="flex-1 h-12 bg-[#1a1a1a]/30 text-white text-sm tracking-[0.06em] uppercase cursor-not-allowed"
                  >
                    εξαντλημένο
                  </Button>
                )}
              </div>

              {/* Thumbnails — desktop sits in info column to keep hero clean */}
              {product.images.length > 1 && (
                <div className="flex gap-2 pb-1">
                  {product.images.map((image, index) => {
                    const url = image.file?.url || image.url
                    if (!url) return null
                    const active = selectedImageIndex === index
                    return (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`relative w-16 h-16 flex-shrink-0 overflow-hidden border transition-colors ${
                          active
                            ? "border-[#1a1a1a]"
                            : "border-[#1a1a1a]/15 hover:border-[#1a1a1a]/40"
                        }`}
                        style={{ backgroundColor: heroBg }}
                        aria-label={`Image ${index + 1}`}
                      >
                        <Image
                          src={url}
                          alt={image.caption || `${product.name} ${index + 1}`}
                          fill
                          className="object-contain"
                          sizes="64px"
                        />
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* === DETAILS: numbered editorial accordion === */}
      <section className="bg-[#fafaf7] px-6 md:px-12 lg:px-16 py-20 md:py-28">
        <div className="max-w-4xl mx-auto">
          <h2 className="headline-md text-[#1a1a1a] mb-14 md:mb-20">
            όλα όσα θες
            <br className="hidden md:block" />
            να ξέρεις
          </h2>

          {(() => {
            const items: Array<{
              key: string
              title: string
              content: React.ReactNode
            }> = []
            if (product.description) {
              items.push({
                key: "description",
                title: "περιγραφή",
                content: (
                  <div
                    className="text-[#1a1a1a]/75 leading-relaxed prose prose-sm max-w-none prose-p:text-[#1a1a1a]/75 prose-strong:text-[#1a1a1a] prose-a:text-[#ff6b35]"
                    dangerouslySetInnerHTML={{ __html: product.description }}
                  />
                ),
              })
            }
            if (isCandle) {
              items.push({
                key: "burning",
                title: "οδηγίες καύσης",
                content: (
                  <div className="text-[#1a1a1a]/75 space-y-4 leading-relaxed">
                    <p className="text-[#1a1a1a]">
                      Για να κρατήσει το κερί σου όσο περισσότερο γίνεται:
                    </p>
                    <ul className="space-y-3 list-disc pl-5 text-sm">
                      <li>
                        <strong className="text-[#1a1a1a]">Πρώτη φορά;</strong> Άναψέ το και
                        άφησέ το να λιώσει ομοιόμορφα μέχρι την άκρη — ιδανικά τουλάχιστον 1 ώρα.
                      </li>
                      <li>
                        <strong className="text-[#1a1a1a]">Μετά;</strong> Κάθε καύση μπορεί
                        να διαρκεί έως 3 ώρες. Έτσι κρατάς το άρωμα έντονο και το κερί σε φόρμα.
                      </li>
                      <li>
                        <strong className="text-[#1a1a1a]">Το φυτίλι θέλει αγάπη.</strong> Πριν
                        από κάθε χρήση, κόψε το στα 5mm — καίει καλύτερα, χωρίς μεγάλη φλόγα ή καπνό.
                      </li>
                      <li>
                        <strong className="text-[#1a1a1a]">Το καλύτερο;</strong> Όσο καίει,
                        πάρε λίγο λιωμένο κερί στο δάχτυλο και άπλωσέ το στα χέρια. Skin-safe — λειτουργεί σαν βελούδινη κρέμα.
                      </li>
                    </ul>
                  </div>
                ),
              })
            }
            items.push({
              key: "shipping",
              title: "αποστολές & επιστροφές",
              content: (
                <div className="text-[#1a1a1a]/75 space-y-2 text-sm leading-relaxed">
                  <p>Δωρεάν αποστολή για παραγγελίες άνω των 30€ εντός Ελλάδας.</p>
                  <p>Αποστολή σε 1-3 εργάσιμες με Courier ή BoxNow.</p>
                  <p>
                    <Link
                      href="/shipping-returns"
                      className="text-[#1a1a1a] border-b border-[#1a1a1a]/30 hover:border-[#1a1a1a] pb-0.5"
                    >
                      Αναλυτικοί όροι →
                    </Link>
                  </p>
                </div>
              ),
            })

            return (
              <div className="border-t border-[#1a1a1a]">
                {items.map((item, idx) => (
                  <Section
                    key={item.key}
                    index={idx + 1}
                    title={item.title}
                    open={openSections.has(item.key)}
                    onToggle={() => toggleSection(item.key)}
                  >
                    {item.content}
                  </Section>
                ))}
              </div>
            )
          })()}
        </div>
      </section>
    </div>
  )
}

function Section({
  index,
  title,
  open,
  onToggle,
  children,
}: {
  index: number
  title: string
  open: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  const num = String(index).padStart(2, "0")
  return (
    <div className="border-b border-[#1a1a1a]">
      <button
        onClick={onToggle}
        className="w-full grid grid-cols-[auto_1fr_auto] items-center gap-6 md:gap-10 py-7 md:py-9 text-left group"
      >
        <span
          className={`tabular-nums text-sm tracking-[0.1em] transition-colors ${
            open ? "text-[#1a1a1a]" : "text-[#1a1a1a]/40 group-hover:text-[#1a1a1a]/70"
          }`}
        >
          {num}
        </span>
        <span
          className={`text-xl md:text-2xl tracking-tight lowercase transition-colors ${
            open ? "text-[#1a1a1a]" : "text-[#1a1a1a]/75 group-hover:text-[#1a1a1a]"
          }`}
        >
          {title}
        </span>
        <span
          className="relative w-5 h-5 shrink-0"
          aria-hidden
        >
          <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-[#1a1a1a]" />
          <span
            className={`absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-[#1a1a1a] transition-transform duration-300 ${
              open ? "rotate-90 scale-y-0" : ""
            }`}
          />
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="pl-0 md:pl-[3.5rem] pb-9 pr-8 md:pr-12">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
