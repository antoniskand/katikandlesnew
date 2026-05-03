import type React from "react"
import type { Metadata, Viewport } from "next"
import "../styles/globals.css"
import { Toaster } from "@/components/ui/toaster"
import { CartProvider } from "@/context/cart-context"
import { ToastContextProvider } from "@/context/toast-context"
import { inter } from "./fonts"
import { OrganizationJsonLd } from "@/components/seo/json-ld"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://katikandles.gr"

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Kati Kandles — Χειροποίητα κεριά σόγιας",
    template: "%s · Kati Kandles",
  },
  description:
    "Χειροποίητα κεριά, αρωματικά χώρου, wax melts και αρωματικά αυτοκινήτου από φυσική σόγια. Φτιαγμένα με μεράκι στην Ελλάδα.",
  applicationName: "Kati Kandles",
  keywords: [
    "κεριά σόγιας",
    "χειροποίητα κεριά",
    "αρωματικά χώρου",
    "wax melts",
    "αρωματικό αυτοκινήτου",
    "kati kandles",
  ],
  authors: [{ name: "Kati Kandles" }],
  creator: "Kati Kandles",
  publisher: "Kati Kandles",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "el_GR",
    url: SITE_URL,
    siteName: "Kati Kandles",
    title: "Kati Kandles — Χειροποίητα κεριά σόγιας",
    description:
      "Χειροποίητα κεριά, αρωματικά χώρου, wax melts και αρωματικά αυτοκινήτου από φυσική σόγια.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Kati Kandles" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kati Kandles",
    description: "Χειροποίητα κεριά σόγιας.",
    images: ["/opengraph-image"],
  },
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
}

export const viewport: Viewport = {
  // Locked to the editorial bone surface so Android Chrome / Samsung Internet
  // dark mode does not paint the system chrome (URL bar, status bar) dark
  // while the page below stays light.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafaf7" },
    { media: "(prefers-color-scheme: dark)", color: "#fafaf7" },
  ],
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="el" className={inter.variable}>
      <head>
        <meta name="color-scheme" content="light only" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Google+Sans:wght@300;400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">
        <OrganizationJsonLd />
        <ToastContextProvider>
          <CartProvider>
            {children}
            <Toaster />
          </CartProvider>
        </ToastContextProvider>
      </body>
    </html>
  )
}
