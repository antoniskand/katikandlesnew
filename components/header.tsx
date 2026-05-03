"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { ShoppingBag, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useCart } from "@/context/cart-context"
import { useCategories } from "@/context/categories-context"

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const { availableCategories } = useCategories()

  const cartContext = useCart()
  const cartCount = useMemo(() => cartContext?.cartCount || 0, [cartContext?.cartCount])

  const isHomePage = pathname === "/"
  const shouldStartWithWhiteBackground = !isHomePage

  useEffect(() => {
    let ticking = false
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          // On home page, show header only after hero section (80vh threshold)
          // On other pages, show immediately when scrolled
          const threshold = isHomePage ? window.innerHeight * 0.8 : 10
          setIsScrolled(window.scrollY > threshold)
          ticking = false
        })
        ticking = true
      }
    }
    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [isHomePage])

  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  const handleCategoryClick = (e: React.MouseEvent, sectionId: string) => {
    e.preventDefault()
    if (isHomePage) {
      const element = document.getElementById(sectionId)
      if (element) element.scrollIntoView({ behavior: "smooth" })
    } else {
      router.push(`/#${sectionId}`)
    }
    setIsMobileMenuOpen(false)
  }

  useEffect(() => {
    if (isHomePage && window.location.hash) {
      const sectionId = window.location.hash.slice(1)
      setTimeout(() => {
        const element = document.getElementById(sectionId)
        if (element) element.scrollIntoView({ behavior: "smooth" })
      }, 100)
    }
  }, [isHomePage, pathname])

  const showHeader = isScrolled || shouldStartWithWhiteBackground

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        // On home page, hide header until user scrolls past hero
        isHomePage && !isScrolled && "opacity-0 pointer-events-none -translate-y-full",
        showHeader && "opacity-100 translate-y-0",
        // Glass morphism effect
        showHeader
          ? "bg-white/75 backdrop-blur-xl backdrop-saturate-150 shadow-[0_8px_32px_rgba(0,0,0,0.06)] border-b border-white/30 py-2"
          : "bg-transparent py-3",
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center" aria-label="Kati Kandles">
            <Image
              src="/logo.svg"
              alt="Kati Kandles"
              width={200}
              height={55}
              className="h-10 md:h-12 w-auto"
              loading="eager"
              priority
            />
          </Link>

          {availableCategories.length > 1 && (
            <nav className="hidden md:flex items-center space-x-8">
              {availableCategories.map(({ id, label }) => (
                <a
                  key={id}
                  href={`/#${id}`}
                  onClick={(e) => handleCategoryClick(e, id)}
                  className="text-sm font-medium tracking-wide text-[#502e23] hover:text-[#ff6b35] transition-colors cursor-pointer"
                >
                  {label}
                </a>
              ))}
            </nav>
          )}

          <div className="flex items-center">
            <Link href="/cart">
              <Button
                variant="ghost"
                size="icon"
                className="mr-2 rounded-full relative text-[#502e23] hover:bg-[#502e23]/10"
                aria-label="Καλάθι"
              >
                <ShoppingBag className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-[#ff6b35] text-[10px] text-white font-bold">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>

            {availableCategories.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden rounded-full text-[#502e23] hover:bg-[#502e23]/10"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && availableCategories.length > 1 && (
        <div className="md:hidden bg-white/85 backdrop-blur-xl backdrop-saturate-150 shadow-lg rounded-b-2xl border-t border-white/40">
          <div className="px-6 py-6 space-y-2">
            <a
              href="/"
              onClick={() => {
                router.push("/")
                setIsMobileMenuOpen(false)
              }}
              className="block text-base font-medium text-[#502e23] hover:text-[#ff6b35] transition-colors duration-200 py-2 px-4 rounded-lg hover:bg-white/60"
            >
              αρχική
            </a>
            {availableCategories.map(({ id, label }) => (
              <a
                key={id}
                href={`/#${id}`}
                onClick={(e) => handleCategoryClick(e, id)}
                className="block text-base font-medium text-[#502e23] hover:text-[#ff6b35] transition-colors duration-200 py-2 px-4 rounded-lg hover:bg-white/60"
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}
