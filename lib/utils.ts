import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function createClientUrl(path: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  return `${baseUrl}${path}`
}

export function formatPrice(price: number | string | undefined | null, currency = "EUR", locale = "el-GR"): string {
  if (price === undefined || price === null) return "€0,00"

  const numericPrice = typeof price === "string" ? Number.parseFloat(price) : price

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
  }).format(numericPrice)
}
