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

  // Get available categories from context (only categories with products)
  const { availableCategories } = useCategories()

  // Get cart context with error handling and memoization
  const cartContext = useCart()
  const cartCount = useMemo(() => cartContext?.cartCount || 0, [cartContext?.cartCount])

  // Determine if the current page should have a light header (dark text)
  // Only the home page should have transparent header with light text
  const isHomePage = pathname === "/"

  // For all pages except home page, we'll start with a white background
  const shouldStartWithWhiteBackground = !isHomePage

  // Handle scroll effect with throttling
  // Header appears only after scrolling past hero section (approximately 100vh)
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

    // Initialize scroll state
    handleScroll()

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [isHomePage])

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  // Function to handle category link clicks - scroll to section on home page
  const handleCategoryClick = (e: React.MouseEvent, sectionId: string) => {
    e.preventDefault()
    
    if (isHomePage) {
      // Already on home page, just scroll to section
      const element = document.getElementById(sectionId)
      if (element) {
        element.scrollIntoView({ behavior: "smooth" })
      }
    } else {
      // Navigate to home page with hash
      router.push(`/#${sectionId}`)
    }
    
    setIsMobileMenuOpen(false)
  }

  // Handle hash navigation when arriving from another page
  useEffect(() => {
    if (isHomePage && window.location.hash) {
      const sectionId = window.location.hash.slice(1)
      setTimeout(() => {
        const element = document.getElementById(sectionId)
        if (element) {
          element.scrollIntoView({ behavior: "smooth" })
        }
      }, 100)
    }
  }, [isHomePage, pathname])

  // Memoize logo component to prevent unnecessary re-renders
  const logoComponent = useMemo(() => {
    // Always use black logo now
    const logoSrc = "/Kati-Kandles-Logo-Black.png"

    return (
      <Image
        src={logoSrc || "/placeholder.svg"}
        alt="Kati Kandles"
        width={200}
        height={55}
        className="h-12 w-auto"
        loading="eager"
        priority
      />
    )
  }, [])

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        // On home page, hide header until user scrolls past hero
        isHomePage && !isScrolled && "opacity-0 pointer-events-none -translate-y-full",
        // Show header with glass morphism when scrolled or on other pages
        (isScrolled || shouldStartWithWhiteBackground) && "opacity-100 translate-y-0",
        // Glass morphism effect
        isScrolled || shouldStartWithWhiteBackground
          ? "bg-white/70 backdrop-blur-xl backdrop-saturate-150 shadow-[0_8px_32px_rgba(0,0,0,0.08)] border-b border-white/20 py-2"
          : "bg-transparent py-3",
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            {logoComponent}
          </Link>

          {/* Desktop Navigation - Only show if more than 1 category with products */}
          {availableCategories.length > 1 && (
            <nav className="hidden md:flex items-center space-x-8">
              {availableCategories.map(({ id, label }) => (
                <a
                  key={id}
                  href={`/#${id}`}
                  onClick={(e) => handleCategoryClick(e, id)}
                  className={cn(
                    "text-sm font-medium transition-all hover:opacity-70 cursor-pointer",
                    "text-[#502e23]",
                  )}
                >
                  {label}
                </a>
              ))}
            </nav>
          )}

          {/* Cart and Mobile Menu Toggle */}
          <div className="flex items-center">
            <Link href="/cart">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "mr-2 rounded-full relative",
                  "text-[#502e23] hover:bg-[#502e23]/10",
                )}
                aria-label="Shopping cart"
              >
                <ShoppingBag className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#c02132] text-xs text-white">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* Only show mobile menu toggle if more than 1 category */}
            {availableCategories.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "md:hidden rounded-full",
                  "text-[#502e23] hover:bg-[#502e23]/10",
                )}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu - Glass morphism - Only show if more than 1 category */}
      {isMobileMenuOpen && availableCategories.length > 1 && (
        <div className="md:hidden bg-white/80 backdrop-blur-xl backdrop-saturate-150 shadow-lg rounded-b-2xl border-t border-white/30">
          <div className="px-6 py-8 space-y-4">
            <a
              href="/"
              onClick={() => {
                router.push("/")
                setIsMobileMenuOpen(false)
              }}
              className="block text-base font-medium text-[#502e23] hover:text-[#502e23]/70 transition-colors duration-200 py-2 px-4 rounded-lg hover:bg-white/50"
            >
              Home
            </a>
            {availableCategories.map(({ id, label }) => (
              <a
                key={id}
                href={`/#${id}`}
                onClick={(e) => handleCategoryClick(e, id)}
                className="block text-base font-medium text-[#502e23] hover:text-[#502e23]/70 transition-colors duration-200 py-2 px-4 rounded-lg hover:bg-white/50"
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
