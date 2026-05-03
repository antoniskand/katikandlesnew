import type { Product } from "@/types/product"

interface ProductStructuredDataProps {
  product: Product
  url: string
}

export function ProductStructuredData({ product, url }: ProductStructuredDataProps) {
  if (!product) return null

  const structuredData = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.name,
    description: product.description || "",
    image: product.images?.[0]?.url || "",
    sku: product.sku || product.id,
    mpn: product.id,
    brand: {
      "@type": "Brand",
      name: "Kati Kandles",
    },
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: product.currency || "EUR",
      price: product.price || 0,
      availability: product.stock_level > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "Kati Kandles",
      },
    },
  }

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
}
