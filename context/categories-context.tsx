"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export interface AvailableCategory {
  id: string
  label: string
  hasProducts: boolean
}

interface CategoriesContextType {
  availableCategories: AvailableCategory[]
  setAvailableCategories: (categories: AvailableCategory[]) => void
}

const CategoriesContext = createContext<CategoriesContextType | undefined>(undefined)

const FALLBACK: AvailableCategory[] = [
  { id: "candles", label: "Κεριά", hasProducts: true },
  { id: "fragrances", label: "Αρωματικά", hasProducts: true },
  { id: "wax-melts", label: "Wax Melts", hasProducts: true },
  { id: "car-fragrances", label: "Αρωματικά Αυτοκινήτου", hasProducts: true },
]

export function CategoriesProvider({
  children,
  initial,
}: {
  children: ReactNode
  initial?: AvailableCategory[]
}) {
  const [availableCategories, setAvailableCategories] = useState<AvailableCategory[]>(
    initial && initial.length > 0 ? initial : FALLBACK,
  )

  useEffect(() => {
    if (initial && initial.length > 0) return
    let cancelled = false
    fetch("/api/products?limit=1")
      .then(() => {
        // categories live separately; this is just a probe
      })
      .catch(() => {})
    return () => {
      cancelled = true
      void cancelled
    }
  }, [initial])

  return (
    <CategoriesContext.Provider value={{ availableCategories, setAvailableCategories }}>
      {children}
    </CategoriesContext.Provider>
  )
}

export function useCategories() {
  const context = useContext(CategoriesContext)
  if (!context) {
    throw new Error("useCategories must be used within a CategoriesProvider")
  }
  return context
}
