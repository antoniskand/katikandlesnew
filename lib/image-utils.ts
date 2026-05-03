// lib/image-utils.ts
// Universal image URL extraction — works with both formats:
// Supabase: { url: "...", alt: "..." }
// Legacy (Swell-compatible): { file: { url: "..." } }

export function getImageUrl(image: any, fallback = "/placeholder.svg?height=400&width=400"): string {
  if (!image) return fallback
  // New format: { url: "..." }
  if (typeof image.url === "string" && image.url) return image.url
  // Legacy format: { file: { url: "..." } }
  if (image.file?.url) return image.file.url
  return fallback
}

export function getProductImageUrl(
  product: { images?: any[] } | null | undefined,
  index = 0,
  fallback = "/placeholder.svg?height=400&width=400"
): string {
  if (!product?.images?.length) return fallback
  const image = product.images[index]
  return getImageUrl(image, fallback)
}
