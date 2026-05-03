import type { ReactNode } from "react"

export const metadata = {
  title: "Admin — Kati Kandles",
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
