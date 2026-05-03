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

export function CategoriesProvider({ children }: { children: ReactNode }) {
  const [availableCategories, setAvailableCategories] = useState<AvailableCategory[]>([])

  return (
    <CategoriesContext.Provider value={{ availableCategories, setAvailableCategories }}>
      {children}
    </CategoriesContext.Provider>
  )
}

export function useCategories() {
  const context = useContext(CategoriesContext)
  if (context === undefined) {
    throw new Error("useCategories must be used within a CategoriesProvider")
  }
  return context
}
