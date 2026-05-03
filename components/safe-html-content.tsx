"use client"

import { useEffect, useRef } from "react"

interface SafeHtmlContentProps {
  html: string
  className?: string
}

export function SafeHtmlContent({ html, className = "" }: SafeHtmlContentProps) {
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!contentRef.current) return

    // Find all images and add max-width
    const images = contentRef.current.querySelectorAll("img")
    images.forEach((img) => {
      img.style.maxWidth = "100%"
      img.style.height = "auto"
    })

    // Find all tables and add overflow
    const tables = contentRef.current.querySelectorAll("table")
    tables.forEach((table) => {
      const wrapper = document.createElement("div")
      wrapper.style.overflowX = "auto"
      wrapper.style.width = "100%"
      table.parentNode?.insertBefore(wrapper, table)
      wrapper.appendChild(table)
    })

    // Find all iframes and constrain them
    const iframes = contentRef.current.querySelectorAll("iframe")
    iframes.forEach((iframe) => {
      iframe.style.maxWidth = "100%"
    })

    // Only fix divs with extremely large widths
    const divs = contentRef.current.querySelectorAll("div")
    divs.forEach((div) => {
      const width = div.style.width
      // Only modify if width is set and larger than viewport
      if (width && !width.includes("%") && Number.parseInt(width) > window.innerWidth) {
        div.style.maxWidth = "100%"
        div.style.width = "auto"
      }
    })
  }, [html])

  return (
    <div
      ref={contentRef}
      className={`prose prose-lg max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
