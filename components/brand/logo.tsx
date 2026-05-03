import Image from "next/image"
import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
  size?: "sm" | "md" | "lg" | "xl"
}

const HEIGHTS: Record<NonNullable<LogoProps["size"]>, number> = {
  sm: 32,
  md: 44,
  lg: 64,
  xl: 96,
}

// Native logo aspect ratio (412 × 143).
const ASPECT = 412 / 143

export function Logo({ className, size = "md" }: LogoProps) {
  const height = HEIGHTS[size]
  return (
    <Image
      src="/logo.svg"
      alt="Kati Kandles"
      width={Math.round(height * ASPECT)}
      height={height}
      className={cn("w-auto", className)}
      style={{ height }}
      priority={size === "lg" || size === "xl"}
    />
  )
}
