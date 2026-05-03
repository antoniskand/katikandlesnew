import type React from "react"
import { Suspense } from "react"
import { ScrollToTop } from "@/components/scroll-to-top"
import { Header } from "@/components/header"
import { MinimalFooter } from "@/components/minimal-footer"
import { CategoriesProvider } from "@/context/categories-context"

function PageLoadingFallback() {
  return (
    <div className="flex-1 min-h-[80vh] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
    </div>
  )
}

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <CategoriesProvider>
      <div className="flex min-h-screen flex-col">
        <ScrollToTop />
        <Header />
        <Suspense fallback={<PageLoadingFallback />}>
          <main className="relative flex-1 w-full">{children}</main>
          <MinimalFooter />
        </Suspense>
      </div>
    </CategoriesProvider>
  )
}
