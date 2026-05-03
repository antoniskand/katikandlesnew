import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kati-kandles.com"

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/checkout/success",
        "/checkout/failure",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
