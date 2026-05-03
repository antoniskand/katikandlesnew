"use client"

import { useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { useCategories } from "@/context/categories-context"

// Map product slugs to custom transparent background images
const customProductImages: Record<string, string> = {
  "cupca-krie-candle": "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/cupcakerieNB.PNG-NYoIRtxtUiF0fiykP61ZCAUR0u6k6v.png",
  "just-vanilla-candle-150gr": "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/just_vanillaNB.PNG-mb1N9RpmDHLGfYOwRwYIk6EctuKDhL.png",
  "apple-cinnamon-candle-150gr": "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/apple_cinnamonNB.PNG-C9yhIx96IVickJPHxExOJK60XKZe8q.png",
  "pistachio-cream-candle-150gr": "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/pistachio_creamNB.PNG-D5qWqCnrE1D0biVhPolixzVRRtHlCq.png",
  "be-my-brownie-valentines-day-candle-150g": "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/BeMyBrownieNB-RRXxGsUYWXx5Jp9COPpPDM7cXx3KFD.png",
  "ena-loyloydi-gia-to-loyloydi-valentines-day-candle-150g": "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnaLoyloydiNB-X1ZPTr3sI8xLw9A6AIo0PqnB4NzllP.png",
  "single-fudgy-valentines-day-candle-150g": "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/singlefudgyNB.PNG-Anqga2jRCRS2Qx5fAq3Y8LgmVQ1iRV.png",
  "i-can-buy-myself-flowers-valentines-day-candle-150g": "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ICanBuyNB-UH6IpJlG8UZHEbczDfR1IUx2f2q89E.png",
  "gluhwein-candle-150gr": "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_5866.PNG-I2AcGiVBlbrPPc714Rrg4Lcub1LChL.png",
}

// Images that need scaling up to match others
const smallerImages = new Set([
  "cupca-krie-candle",
  "just-vanilla-candle-150gr",
  "apple-cinnamon-candle-150gr",
  "pistachio-cream-candle-150gr",
  "single-fudgy-valentines-day-candle-150g",
])

// Images that need extra scaling (wider/landscape format)
const extraScaleImages = new Set([
  "gluhwein-candle-150gr",
])

interface CategoryProduct {
  id: string
  name: string
  slug: string
  price: number
  images?: Array<{
    file?: {
      url?: string
    }
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
  // Show all products in a grid
  const displayProducts = products

  // Helper function to get product image (custom or default)
  const getProductImage = (product: CategoryProduct) => {
    return customProductImages[product.slug] || product.images?.[0]?.url || "/placeholder.svg?height=400&width=400"
  }

  return (
    <div 
      id={id} 
      className={`relative py-12 md:py-32 overflow-hidden ${bgColor} scroll-mt-20 z-10`}
      style={{ position: 'relative', zIndex: 10 }}
    >
      {/* MASSIVE Background Text - Larger on mobile */}
      <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 z-0 pointer-events-none overflow-hidden">
        <motion.div
          initial={{ opacity: 0, x: reverse ? 100 : -100 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.2 }}
          viewport={{ once: true }}
          className={reverse ? "text-right -mr-4" : "-ml-4"}
        >
          <h2
            className={`text-[28vw] md:text-[22vw] font-light tracking-tighter whitespace-nowrap leading-none opacity-20 ${textColor}`}
          >
            {backgroundText}
          </h2>
        </motion.div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <h3 className="headline-md mb-4" style={{ color: bgColor.includes('white') ? '#1a1a1a' : '#ffffff' }}>{title}</h3>
          <p className="body-md max-w-2xl mx-auto" style={{ color: bgColor.includes('white') ? '#5a5a5a' : 'rgba(255,255,255,0.8)' }}>{description}</p>
        </motion.div>

        {/* Product List with Alternating Images */}
        <div className="space-y-2 md:space-y-4">
          {products.map((product, index) => {
            const isEven = index % 2 === 0
            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, x: isEven ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`flex flex-col md:flex-row items-center gap-3 md:gap-4 ${
                  isEven ? "md:ml-0" : "md:ml-12"
                }`}
              >
                {/* Product Info */}
                <Link
                  href={`/products/${product.slug}`}
                  className="flex-1 group"
                >
                  <div className={`border-l-4 pl-6 hover:bg-white/30 transition-colors py-4 rounded-r-lg`}
                    style={{ borderColor: accentColor }}
                  >
                    <h4 className="headline-sm mb-2 group-hover:opacity-70 transition-opacity" style={{ color: bgColor.includes('white') ? '#1a1a1a' : '#ffffff' }}>
                      {product.name}
                    </h4>
                    <div className="caption" style={{ color: accentColor }}>
                      €{product.price?.toFixed(2)}
                    </div>
                  </div>
                </Link>

                {/* Product Image */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
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
                      style={extraScaleImages.has(product.slug) ? { transform: 'scale(2.5)' } : smallerImages.has(product.slug) ? { transform: 'scale(1.6)' } : undefined}
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

  // Update available categories based on which have products
  useEffect(() => {
    const categories = [
      { id: "candles", label: "Κεριά", hasProducts: candleProducts.length > 0 },
      { id: "fragrances", label: "Αρωματικά Ντουλάπας", hasProducts: fragranceProducts.length > 0 },
      { id: "car-fragrances", label: "Αρωματικα Αυτοκινητου", hasProducts: carFragranceProducts.length > 0 },
      { id: "wax-melts", label: "Wax Melts", hasProducts: waxMeltProducts.length > 0 },
    ].filter(cat => cat.hasProducts)

    setAvailableCategories(categories)
  }, [candleProducts.length, fragranceProducts.length, carFragranceProducts.length, waxMeltProducts.length, setAvailableCategories])

  return (
    <section className="relative z-10 bg-background">
      {/* Candles Section */}
      {candleProducts.length > 0 && (
        <CategorySection
          id="candles"
          title="candles"
          backgroundText="candles"
          description="Χειροποίητα κεριά σόγιας με μοναδικά αρώματα. Κάθε κερί είναι φτιαγμένο με αγάπη και προσοχή στη λεπτομέρεια."
          products={candleProducts}
          bgColor="bg-[#ff6b35]"
          textColor="text-white"
          accentColor="#ffc107"
          reverse={false}
        />
      )}

      {/* Fragrances Section */}
      {fragranceProducts.length > 0 && (
        <CategorySection
          id="fragrances"
          title="fragrances"
          backgroundText="αρωματικά"
          description="Αρωματικά ντουλάπας για να γεμίσετε τους χώρους σας με υπέροχες ευωδιές που διαρκούν."
          products={fragranceProducts}
          bgColor="bg-white"
          textColor="text-[#6a1b9a]"
          accentColor="#6a1b9a"
          reverse={true}
        />
      )}

      {/* Car Fragrances Section */}
      {carFragranceProducts.length > 0 && (
        <CategorySection
          id="car-fragrances"
          title="car fragrances"
          backgroundText="αυτοκίνητο"
          description="Αρωματικά αυτοκινήτου για απολαυστικές διαδρομές. Μετατρέψτε κάθε ταξίδι σε εμπειρία."
          products={carFragranceProducts}
          bgColor="bg-[#ffc107]"
          textColor="text-[#1a1a1a]"
          accentColor="#ff6b35"
          reverse={false}
        />
      )}

      {/* Wax Melts Section */}
      {waxMeltProducts.length > 0 && (
        <CategorySection
          id="wax-melts"
          title="wax melts"
          backgroundText="wax melts"
          description="Wax melts για καυστήρες. Απλά τοποθετήστε, ανάψτε και απολαύστε το άρωμα να γεμίζει το χώρο."
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
