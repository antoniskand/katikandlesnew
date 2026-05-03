import type { Product } from "@/types/product"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://katikandles.gr"

function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

export function OrganizationJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "Kati Kandles",
        url: SITE_URL,
        logo: `${SITE_URL}/logo.svg`,
        sameAs: [
          "https://www.instagram.com/katikandles",
          "https://www.tiktok.com/@katikandles",
        ],
        contactPoint: {
          "@type": "ContactPoint",
          email: "hello@katikandles.gr",
          contactType: "customer service",
          areaServed: "GR",
          availableLanguage: ["Greek", "English"],
        },
      }}
    />
  )
}

export function WebsiteJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "Kati Kandles",
        url: SITE_URL,
        potentialAction: {
          "@type": "SearchAction",
          target: `${SITE_URL}/products?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      }}
    />
  )
}

export function ProductJsonLd({ product }: { product: Product }) {
  const price = product.sale_price ?? product.price
  const availability =
    product.stock_status === "out_of_stock"
      ? "https://schema.org/OutOfStock"
      : "https://schema.org/InStock"

  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        description: product.description?.replace(/<[^>]+>/g, "").slice(0, 500),
        image: product.images?.map((i) => i.url) ?? [],
        sku: product.id,
        brand: { "@type": "Brand", name: "Kati Kandles" },
        offers: {
          "@type": "Offer",
          url: `${SITE_URL}/products/${product.slug}`,
          priceCurrency: product.currency || "EUR",
          price: price?.toFixed(2),
          availability,
          seller: { "@type": "Organization", name: "Kati Kandles" },
        },
      }}
    />
  )
}

export function BreadcrumbJsonLd({
  items,
}: {
  items: { name: string; url: string }[]
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: item.name,
          item: item.url.startsWith("http") ? item.url : `${SITE_URL}${item.url}`,
        })),
      }}
    />
  )
}
