"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, Minus, Plus, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AddToCartButton } from "@/components/add-to-cart-button"

interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  sale_price?: number | null
  currency: string
  images: Array<{
    file?: {
      url?: string
    }
    url?: string
    caption?: string
  }>
  categories: Array<{
    id: string
    name: string
  }>
  variants?: Array<{
    id: string
    name: string
    values: Array<{
      id: string
      name: string
    }>
  }>
  stock_status?: string
  stock_level?: number
  attributes?: Record<string, unknown>
}

interface EditorialProductViewProps {
  product: Product
}

export function EditorialProductView({ product }: EditorialProductViewProps) {
  const [quantity, setQuantity] = useState(1)
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({})
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(["description"]))

  const isOnSale = product.sale_price !== null &&
    product.sale_price !== undefined &&
    product.sale_price > 0 &&
    product.sale_price < product.price
  const displayPrice = isOnSale ? product.sale_price! : product.price
  const isInStock = product.stock_status === "in_stock" || (product.stock_level && product.stock_level > 0)

  const toggleSection = (section: string) => {
    setOpenSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(section)) {
        newSet.delete(section)
      } else {
        newSet.add(section)
      }
      return newSet
    })
  }

  const bgLetter = product.name.charAt(0).toUpperCase()
  const selectedImage = product.images[selectedImageIndex]?.file?.url || product.images[selectedImageIndex]?.url || "/placeholder.svg?height=600&width=600"

  return (
    <div className="min-h-screen bg-background overflow-hidden w-full">
      {/* Background Letter */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.03 }}
          transition={{ duration: 1 }}
          className="absolute -right-[5vw] top-[10vh] text-[50vw] font-black leading-none text-foreground select-none"
          style={{ fontFamily: "system-ui" }}
        >
          {bgLetter}
        </motion.span>
      </div>

      {/* Content */}
      <div className="relative z-10 pt-24 md:pt-32 pb-16">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="px-4 md:px-12 mb-8"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-foreground/60 hover:text-foreground transition-colors caption"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to shop
          </Link>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 md:gap-16 px-4 md:px-12 max-w-7xl mx-auto">
          {/* Left: Product Image */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="sticky top-32">
              <div className="relative aspect-square rounded-2xl overflow-hidden">
                <Image
                  src={selectedImage}
                  alt={product.name}
                  fill
                  className="object-contain"
                  priority
                />
              </div>

              {/* Thumbnail Gallery */}
              {product.images.length > 1 && (
                <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${selectedImageIndex === index
                          ? "border-primary"
                          : "border-transparent hover:border-primary/20"
                        }`}
                    >
                      <Image
                        src={image.file?.url || image.url || "/placeholder.svg?height=80&width=80"}
                        alt={image.caption || `${product.name} ${index + 1}`}
                        fill
                        className="object-contain"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Right: Product Info */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col min-w-0"
          >
            {/* Category */}
            {product.categories.length > 0 && (
              <span className="caption text-accent mb-4">
                {product.categories[0].name}
              </span>
            )}

            {/* Product Name */}
            <h1 className="headline-lg text-foreground mb-6 break-words">{product.name}</h1>

            {/* Price */}
            <div className="flex items-baseline gap-4 mb-6">
              <span className="text-4xl font-bold text-foreground">
                {"€"}{displayPrice.toFixed(2)}
              </span>
              {isOnSale && (
                <span className="text-xl text-foreground/40 line-through">
                  {"€"}{product.price.toFixed(2)}
                </span>
              )}
            </div>

            {/* Quantity & Add to Cart */}
            <div className="flex flex-col gap-4 mb-8">
              <div className="inline-flex items-center border-2 border-foreground/20 rounded-full self-start">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="p-3 text-foreground hover:bg-foreground/5 transition-colors disabled:opacity-30 rounded-l-full"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-6 py-2 text-foreground font-medium min-w-[3rem] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-3 text-foreground hover:bg-foreground/5 transition-colors rounded-r-full"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
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
                    images: product.images.map(img => ({
                      url: img.file?.url || img.url || "",
                      alt: img.caption || "",
                    })),
                  }}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-4 rounded-full text-lg font-medium transition-colors"
                />
              ) : (
                <Button
                  disabled
                  className="w-full bg-foreground/30 text-white py-4 rounded-full text-lg font-medium cursor-not-allowed"
                >
                  Out of Stock
                </Button>
              )}
            </div>

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-4 mb-8">
                {product.variants.map((variant) => (
                  <div key={variant.id}>
                    <label className="caption text-foreground mb-2 block">
                      {variant.name}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {variant.values.map((value) => (
                        <button
                          key={value.id}
                          onClick={() =>
                            setSelectedVariants((prev) => ({
                              ...prev,
                              [variant.id]: value.id,
                            }))
                          }
                          className={`px-4 py-2 rounded-full border-2 transition-all ${selectedVariants[variant.id] === value.id
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-foreground/20 text-foreground hover:border-foreground/40"
                            }`}
                        >
                          {value.name}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Collapsible Sections */}
            <div className="border-t border-foreground/10 mt-8">
              {/* Description Section */}
              {product.description && (
                <div className="border-b border-foreground/10">
                  <button
                    onClick={() => toggleSection("description")}
                    className="w-full flex items-center justify-between py-4 text-left"
                  >
                    <span className="font-medium text-foreground">{"Περιγραφή"}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-foreground/60 transition-transform ${openSections.has("description") ? "rotate-180" : ""
                        }`}
                    />
                  </button>
                  {openSections.has("description") && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="pb-4"
                    >
                      <div
                        className="body-md text-foreground/70 prose prose-sm max-w-none prose-p:text-foreground/70"
                        dangerouslySetInnerHTML={{ __html: product.description }}
                      />
                    </motion.div>
                  )}
                </div>
              )}

              {/* Burning Instructions Section */}
              {(product.name.toLowerCase().includes('candle') ||
                product.name.toLowerCase().includes('κερ') ||
                product.categories.some(cat =>
                  cat.name?.toLowerCase().includes('candle') ||
                  cat.name?.toLowerCase().includes('κερ')
                )
              ) && (
                  <div className="border-b border-foreground/10">
                    <button
                      onClick={() => toggleSection("burning")}
                      className="w-full flex items-center justify-between py-4 text-left"
                    >
                      <span className="font-medium text-foreground">{"Οδηγίες Καύσης"}</span>
                      <ChevronDown
                        className={`w-5 h-5 text-foreground/60 transition-transform ${openSections.has("burning") ? "rotate-180" : ""
                          }`}
                      />
                    </button>
                    {openSections.has("burning") && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="pb-4"
                      >
                        <div className="text-foreground/70 body-sm space-y-4">
                          <p className="font-medium text-foreground">
                            {"Για να κρατήσει το κερί σου όσο περισσότερο γίνεται (και να το απολαύσεις σωστά)"}
                          </p>
                          <ul className="space-y-3">
                            <li>
                              <strong>{"Πρώτη φορά;"}</strong>{" "}
                              {"Άναψε το και άφησε το να λιώσει ομοιόμορφα μέχρι την άκρη – ιδανικά τουλάχιστον 1 ώρα."}
                            </li>
                            <li>
                              <strong>{"Μετά;"}</strong>{" "}
                              {"Κάθε καύση μπορεί να διαρκεί μέχρι 3 ώρες max. Έτσι κρατάς το άρωμα έντονο και το κερί σου σε φόρμα."}
                            </li>
                            <li>
                              <strong>{"Το φυτίλι θέλει αγάπη!"}</strong>{" "}
                              {"Πριν από κάθε χρήση, κόψ' το στα 5mm. Θα καίει καλύτερα, χωρίς μεγάλη φλόγα ή καπνό."}
                            </li>
                            <li>
                              <strong>{"Και το καλύτερο;"}</strong>{" "}
                              {"Όσο καίει, πάρε λίγη λιωμένο κερί με το δάχτυλό σου και άπλωσέ το στα χέρια σου. Είναι skin-safe και λειτουργεί σαν βελούδινη κρέμα χεριών ή για μασάζ. (Όχι, δεν καίει – είναι απλά τέλεια!)"}
                            </li>
                          </ul>
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
