"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export function SkipToContent() {
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const handleSkip = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    const content = document.getElementById("main-content")
    if (content) {
      content.tabIndex = -1
      content.focus()
      // Reset tabIndex after blur
      content.addEventListener(
        "blur",
        () => {
          content.tabIndex = -1
        },
        { once: true },
      )
    }
  }

  return (
    <a
      href="#main-content"
      onClick={handleSkip}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-black focus:shadow-lg focus:outline-none"
    >
      Skip to content
    </a>
  )
}
