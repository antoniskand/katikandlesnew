// app/(main)/products/[slug]/page.tsx
import { notFound } from "next/navigation"
import { unstable_cache } from "next/cache"
import { getProduct } from "@/lib/supabase-api"
import { EditorialProductView } from "@/components/product/editorial-product-view"

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
  return {
    title: product?.name ? `${product.name} - Kati Kandles` : "Product - Kati Kandles",
    description:
      typeof product?.description === "string"
        ? product.description.replace(/<[^>]*>/g, "").slice(0, 160)
        : "Handcrafted candle product by Kati Kandles",
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

  return <EditorialProductView product={safeProduct} />
}
