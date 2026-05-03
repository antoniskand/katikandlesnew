import type React from "react"
import type { Metadata } from "next"
import "../styles/globals.css"
import { Toaster } from "@/components/ui/toaster"
import { CartProvider } from "@/context/cart-context"
import { ToastContextProvider } from "@/context/toast-context"

export const metadata: Metadata = {
  title: "Kati Kandles - Handcrafted Candles & Fragrances",
  description:
    "Discover our collection of handcrafted candles, home fragrances, car air fresheners, and wax melts. Premium quality scents for every space.",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="color-scheme" content="light only" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Google+Sans:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans">
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
