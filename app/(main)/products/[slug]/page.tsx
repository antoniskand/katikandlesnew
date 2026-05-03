// app/(main)/products/[slug]/page.tsx
import { notFound } from "next/navigation"
import { unstable_cache } from "next/cache"
import { getProduct } from "@/lib/db-queries"
import { EditorialProductView } from "@/components/product/editorial-product-view"
import { ProductJsonLd, BreadcrumbJsonLd } from "@/components/seo/json-ld"

export const revalidate = 120

const getCachedProduct = unstable_cache(
  async (slug: string) => {
    return await getProduct(slug)
  },
  ["product-by-slug"],
  { revalidate: 120 }
)

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  let product = null
  try {
    product = await getCachedProduct(slug)
  } catch {
    return { title: "Product - Kati Kandles" }
  }
  if (!product) return { title: "Δεν βρέθηκε" }

  const desc =
    typeof product?.description === "string"
      ? product.description.replace(/<[^>]*>/g, "").slice(0, 160)
      : `${product.name} — χειροποίητο κερί σόγιας από Kati Kandles.`

  const image = product.images?.[0]?.url

  return {
    title: product.name,
    description: desc,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      title: product.name,
      description: desc,
      url: `/products/${product.slug}`,
      type: "website",
      images: image ? [{ url: image, width: 1200, height: 1200, alt: product.name }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: desc,
      images: image ? [image] : undefined,
    },
  }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  if (!slug) notFound()

  let product = null
  try {
    product = await getCachedProduct(slug)
  } catch {
    notFound()
  }
  if (!product || product.active === false) notFound()

  // Transform images from {url, alt} to {file: {url}} for backward compat
  const safeProduct = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description || "",
    price: product.price,
    sale_price: product.sale_price,
    currency: product.currency || "EUR",
    images: product.images.map((img) => ({
      file: { url: img.url },
      caption: img.alt || "",
    })),
    categories: product.categories || [],
    variants: product.variants || [],
    stock_status: product.stock_status || "in_stock",
    stock_level: product.stock_level,
    attributes: product.attributes || {},
  }

  return (
    <>
      <ProductJsonLd product={product} />
      <BreadcrumbJsonLd
        items={[
          { name: "Αρχική", url: "/" },
          { name: "Προϊόντα", url: "/products" },
          { name: product.name, url: `/products/${product.slug}` },
        ]}
      />
      <EditorialProductView product={safeProduct} />
    </>
  )
}
