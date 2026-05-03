// app/(main)/page.tsx
import { AnniversaryDropSection } from "@/components/anniversary-drop-section"
import { CreationOfMomSection } from "@/components/creation-of-mom-section"
import { CategorySections } from "@/components/category-sections"
import { FeaturesSection } from "@/components/features-section"
import { AboutSection } from "@/components/about-section"
import { NewsletterSection } from "@/components/newsletter-section"
import type { Drop, Product } from "@/types/product"
import { getProducts, getFeaturedDrops, getPage } from "@/lib/db-queries"

export const revalidate = 60

export default async function Home() {
  let candleProducts: Product[] = []
  let fragranceProducts: Product[] = []
  let carFragranceProducts: Product[] = []
  let waxMeltProducts: Product[] = []
  let featuredDrops: Array<{ drop: Drop; products: Product[] }> = []
  let aboutHtml: string | null = null
  let aboutTitle: string | null = null

  try {
    const [candleData, fragranceData, carFragranceData, waxMeltData, featured, aboutPage] = await Promise.all([
      getProducts({ limit: 50, category: "candles" }).catch(() => ({ results: [], count: 0 })),
      getProducts({ limit: 50, category: "aromatics" }).catch(() => ({ results: [], count: 0 })),
      getProducts({ limit: 50, category: "car-diffuser" }).catch(() => ({ results: [], count: 0 })),
      getProducts({ limit: 50, category: "wax-melts" }).catch(() => ({ results: [], count: 0 })),
      getFeaturedDrops().catch(() => []),
      getPage("about-us").catch(() => null),
    ])

    candleProducts = candleData?.results || []
    fragranceProducts = fragranceData?.results || []
    carFragranceProducts = carFragranceData?.results || []
    waxMeltProducts = waxMeltData?.results || []
    featuredDrops = featured
    aboutHtml = aboutPage?.content || null
    aboutTitle = aboutPage?.name || null
  } catch (error) {
    console.error("Error in home page:", error)
  }

  // Each featured drop renders with the section component matching its slug.
  // Slugs the site knows about are mapped here; new ones fall back silently
  // until a section component is wired up for them.
  const dropSections = featuredDrops.map(({ drop, products }) => {
    if (drop.slug === "creation-of-mom") {
      return <CreationOfMomSection key={drop.id} drop={drop} products={products} />
    }
    if (drop.slug === "zoyme-raw") {
      return <AnniversaryDropSection key={drop.id} drop={drop} products={products} />
    }
    // Default to the anniversary visual language for any new drop.
    return <AnniversaryDropSection key={drop.id} drop={drop} products={products} />
  })

  return (
    <div className="flex flex-col overflow-x-hidden">
      {dropSections}
      <CategorySections
        candleProducts={candleProducts}
        fragranceProducts={fragranceProducts}
        carFragranceProducts={carFragranceProducts}
        waxMeltProducts={waxMeltProducts}
      />
      <FeaturesSection />
      <AboutSection title={aboutTitle} contentHtml={aboutHtml} />
      <NewsletterSection />
    </div>
  )
}
