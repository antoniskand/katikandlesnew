import { Inter, DM_Sans } from "next/font/google"

export const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body",
})

export const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "700"],
  variable: "--font-display",
})
