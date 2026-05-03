// app/(main)/page.tsx
import { EditorialHero } from "@/components/editorial-hero"
import { AnniversaryDropSection } from "@/components/anniversary-drop-section"
import { CategorySections } from "@/components/category-sections"
import { FeaturesSection } from "@/components/features-section"
import { AboutSection } from "@/components/about-section"
import { NewsletterSection } from "@/components/newsletter-section"
import type { Product } from "@/types/product"
import { getProducts, getFeaturedDrop } from "@/lib/supabase-api"

export const revalidate = 60

export default async function Home() {
  let candleProducts: Product[] = []
  let fragranceProducts: Product[] = []
  let carFragranceProducts: Product[] = []
  let waxMeltProducts: Product[] = []
  let drop = null
  let dropProducts: Product[] = []

  try {
    const [candleData, fragranceData, carFragranceData, waxMeltData, featured] = await Promise.all([
      getProducts({ limit: 50, category: "candles" }).catch(() => ({ results: [], count: 0 })),
      getProducts({ limit: 50, category: "aromatics" }).catch(() => ({ results: [], count: 0 })),
      getProducts({ limit: 50, category: "car-diffuser" }).catch(() => ({ results: [], count: 0 })),
      getProducts({ limit: 50, category: "wax-melts" }).catch(() => ({ results: [], count: 0 })),
      getFeaturedDrop().catch(() => ({ drop: null, products: [] })),
    ])

    candleProducts = candleData?.results || []
    fragranceProducts = fragranceData?.results || []
    carFragranceProducts = carFragranceData?.results || []
    waxMeltProducts = waxMeltData?.results || []
    drop = featured.drop
    dropProducts = featured.products
  } catch (error) {
    console.error("Error in home page:", error)
  }

  return (
    <div className="flex flex-col overflow-x-hidden">
      <EditorialHero />
      <AnniversaryDropSection drop={drop as any} products={dropProducts} />
      <CategorySections
        candleProducts={candleProducts}
        fragranceProducts={fragranceProducts}
        carFragranceProducts={carFragranceProducts}
        waxMeltProducts={waxMeltProducts}
      />
      <FeaturesSection />
      <AboutSection />
      <NewsletterSection />
    </div>
  )
}
