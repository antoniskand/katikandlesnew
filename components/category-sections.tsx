"use client"

import { useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { useCategories } from "@/context/categories-context"
import { formatPrice } from "@/lib/utils"

interface CategoryProduct {
  id: string
  name: string
  slug: string
  price: number
  sale_price?: number | null
  images?: Array<{
    url?: string
    file?: { url?: string }
  }>
}

interface CategorySectionProps {
  id: string
  title: string
  backgroundText: string
  description: string
  products: CategoryProduct[]
  bgColor: string
  textColor: string
  accentColor: string
  reverse?: boolean
}

function CategorySection({
  id,
  title,
  backgroundText,
  description,
  products,
  bgColor,
  textColor,
  accentColor,
  reverse = false,
}: CategorySectionProps) {
  const getProductImage = (product: CategoryProduct) => {
    return (
      product.images?.[0]?.url ||
      product.images?.[0]?.file?.url ||
      "/placeholder.svg?height=400&width=400"
    )
  }

  const isLightBg = bgColor.includes("white") || bgColor.includes("[#fff")
  const headingColor = isLightBg ? "#1a1a1a" : "#ffffff"
  const bodyColor = isLightBg ? "#5a5a5a" : "rgba(255,255,255,0.85)"

  return (
    <div
      id={id}
      className={`relative py-16 md:py-32 overflow-hidden ${bgColor} scroll-mt-24 z-10`}
      style={{ position: "relative", zIndex: 10 }}
    >
      {/* Massive background type */}
      <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 z-0 pointer-events-none overflow-hidden">
        <motion.div
          initial={{ opacity: 0, x: reverse ? 100 : -100 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.2 }}
          viewport={{ once: true }}
          className={reverse ? "text-right -mr-4" : "-ml-4"}
        >
          <h2
            className={`text-[28vw] md:text-[22vw] font-light tracking-tighter whitespace-nowrap leading-none opacity-15 ${textColor}`}
          >
            {backgroundText}
          </h2>
        </motion.div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-14 text-center"
        >
          <h3 className="headline-md mb-4" style={{ color: headingColor }}>
            {title}
          </h3>
          <p className="body-md max-w-2xl mx-auto" style={{ color: bodyColor }}>
            {description}
          </p>
        </motion.div>

        <div className="space-y-3 md:space-y-5">
          {products.map((product, index) => {
            const isEven = index % 2 === 0
            const isOnSale =
              product.sale_price != null && product.sale_price < (product.price ?? 0)
            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, x: isEven ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: Math.min(index * 0.06, 0.4) }}
                viewport={{ once: true }}
                className={`flex flex-col md:flex-row items-center gap-4 md:gap-6 ${
                  isEven ? "md:ml-0" : "md:ml-12"
                }`}
              >
                <Link href={`/products/${product.slug}`} className="flex-1 group w-full">
                  <div
                    className="border-l-4 pl-6 hover:bg-white/30 transition-colors py-4 rounded-r-lg"
                    style={{ borderColor: accentColor }}
                  >
                    <h4
                      className="headline-sm mb-2 group-hover:opacity-70 transition-opacity"
                      style={{ color: headingColor }}
                    >
                      {product.name}
                    </h4>
                    <div className="caption flex items-center gap-2" style={{ color: accentColor }}>
                      <span>{formatPrice(product.sale_price ?? product.price)}</span>
                      {isOnSale && (
                        <span className="line-through opacity-60 text-xs">
                          {formatPrice(product.price)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>

                <motion.div
                  whileHover={{ scale: 1.06, rotate: -2 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="w-40 h-40 md:w-48 md:h-48 relative flex-shrink-0"
                >
                  <Link href={`/products/${product.slug}`}>
                    <Image
                      src={getProductImage(product)}
                      alt={product.name}
                      fill
                      loading="lazy"
                      className="object-contain drop-shadow-lg"
                      sizes="(max-width: 768px) 160px, 192px"
                    />
                  </Link>
                </motion.div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

interface CategorySectionsProps {
  candleProducts: CategoryProduct[]
  fragranceProducts: CategoryProduct[]
  carFragranceProducts: CategoryProduct[]
  waxMeltProducts: CategoryProduct[]
}

export function CategorySections({
  candleProducts,
  fragranceProducts,
  carFragranceProducts,
  waxMeltProducts,
}: CategorySectionsProps) {
  const { setAvailableCategories } = useCategories()

  useEffect(() => {
    const categories = [
      { id: "candles", label: "Κεριά", hasProducts: candleProducts.length > 0 },
      { id: "fragrances", label: "Αρωματικά Ντουλάπας", hasProducts: fragranceProducts.length > 0 },
      { id: "car-fragrances", label: "Αρωματικα Αυτοκινητου", hasProducts: carFragranceProducts.length > 0 },
      { id: "wax-melts", label: "Wax Melts", hasProducts: waxMeltProducts.length > 0 },
    ].filter((cat) => cat.hasProducts)
    setAvailableCategories(categories)
  }, [
    candleProducts.length,
    fragranceProducts.length,
    carFragranceProducts.length,
    waxMeltProducts.length,
    setAvailableCategories,
  ])

  return (
    <section className="relative z-10 bg-background">
      {candleProducts.length > 0 && (
        <CategorySection
          id="candles"
          title="candles"
          backgroundText="candles"
          description="Χειροποίητα κεριά σόγιας με μοναδικά αρώματα. Κάθε κερί φτιάχνεται με μεράκι και προσοχή στη λεπτομέρεια."
          products={candleProducts}
          bgColor="bg-[#ff6b35]"
          textColor="text-white"
          accentColor="#ffc107"
          reverse={false}
        />
      )}

      {fragranceProducts.length > 0 && (
        <CategorySection
          id="fragrances"
          title="fragrances"
          backgroundText="αρωματικά"
          description="Αρωματικά ντουλάπας για να γεμίσεις τους χώρους σου με υπέροχες ευωδιές που διαρκούν."
          products={fragranceProducts}
          bgColor="bg-white"
          textColor="text-[#6a1b9a]"
          accentColor="#6a1b9a"
          reverse={true}
        />
      )}

      {carFragranceProducts.length > 0 && (
        <CategorySection
          id="car-fragrances"
          title="car fragrances"
          backgroundText="αυτοκίνητο"
          description="Αρωματικά αυτοκινήτου για απολαυστικές διαδρομές. Μετάτρεψε κάθε ταξίδι σε εμπειρία."
          products={carFragranceProducts}
          bgColor="bg-[#ffc107]"
          textColor="text-[#1a1a1a]"
          accentColor="#ff6b35"
          reverse={false}
        />
      )}

      {waxMeltProducts.length > 0 && (
        <CategorySection
          id="wax-melts"
          title="wax melts"
          backgroundText="wax melts"
          description="Wax melts για καυστήρες. Τοποθέτησε, άναψε και απόλαυσε το άρωμα να γεμίζει τον χώρο."
          products={waxMeltProducts}
          bgColor="bg-[#6a1b9a]"
          textColor="text-white"
          accentColor="#ffc107"
          reverse={true}
        />
      )}
    </section>
  )
}
