// app/(main)/page.tsx
import { AnniversaryDropSection } from "@/components/anniversary-drop-section"
import { CreationOfMomSection } from "@/components/creation-of-mom-section"
import { CategorySections } from "@/components/category-sections"
import { FeaturesSection } from "@/components/features-section"
import { AboutSection } from "@/components/about-section"
import { NewsletterSection } from "@/components/newsletter-section"
import type { Product } from "@/types/product"
import { getProducts, getFeaturedDrop, getPage } from "@/lib/db-queries"

export const revalidate = 60

export default async function Home() {
  let candleProducts: Product[] = []
  let fragranceProducts: Product[] = []
  let carFragranceProducts: Product[] = []
  let waxMeltProducts: Product[] = []
  let drop = null
  let dropProducts: Product[] = []
  let aboutHtml: string | null = null

  try {
    const [candleData, fragranceData, carFragranceData, waxMeltData, featured, about] = await Promise.all([
      getProducts({ limit: 50, category: "candles" }).catch(() => ({ results: [], count: 0 })),
      getProducts({ limit: 50, category: "aromatics" }).catch(() => ({ results: [], count: 0 })),
      getProducts({ limit: 50, category: "car-diffuser" }).catch(() => ({ results: [], count: 0 })),
      getProducts({ limit: 50, category: "wax-melts" }).catch(() => ({ results: [], count: 0 })),
      getFeaturedDrop().catch(() => ({ drop: null, products: [] })),
      getPage("about-us").catch(() => null),
    ])

    candleProducts = candleData?.results || []
    fragranceProducts = fragranceData?.results || []
    carFragranceProducts = carFragranceData?.results || []
    waxMeltProducts = waxMeltData?.results || []
    drop = featured.drop
    dropProducts = featured.products
    aboutHtml = about?.content || null
  } catch (error) {
    console.error("Error in home page:", error)
  }

  return (
    <div className="flex flex-col overflow-x-hidden">
      <CreationOfMomSection />
      <AnniversaryDropSection drop={drop as any} products={dropProducts} />
      <CategorySections
        candleProducts={candleProducts}
        fragranceProducts={fragranceProducts}
        carFragranceProducts={carFragranceProducts}
        waxMeltProducts={waxMeltProducts}
      />
      <FeaturesSection />
      <AboutSection contentHtml={aboutHtml} />
      <NewsletterSection />
    </div>
  )
}
