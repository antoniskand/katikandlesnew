"use client"

import * as React from "react"
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast"

type ToastType = {
  id: string
  title?: string
  description?: string
  action?: React.ReactNode
  variant?: "default" | "destructive" | "success"
}

type ToastContextType = {
  toasts: ToastType[]
  addToast: (toast: Omit<ToastType, "id">) => void
  removeToast: (id: string) => void
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

export function ToastContextProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastType[]>([])

  const addToast = React.useCallback(({ title, description, action, variant = "default" }: Omit<ToastType, "id">) => {
    setToasts((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 9),
        title,
        description,
        action,
        variant,
      },
    ])
  }, [])

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  // Auto-remove toasts after 5 seconds
  React.useEffect(() => {
    if (toasts.length === 0) return

    const timers = toasts.map((toast) =>
      setTimeout(() => {
        removeToast(toast.id)
      }, 5000),
    )

    return () => {
      timers.forEach((timer) => clearTimeout(timer))
    }
  }, [toasts, removeToast])

  const value = React.useMemo(
    () => ({
      toasts,
      addToast,
      removeToast,
    }),
    [toasts, addToast, removeToast],
  )

  return (
    <ToastContext.Provider value={value}>
      <ToastProvider>
        {children}
        {toasts.map(({ id, title, description, action, variant }) => (
          <Toast
            key={id}
            variant={variant}
            open={true}
            onOpenChange={(open) => {
              if (!open) removeToast(id)
            }}
          >
            {title && <ToastTitle>{title}</ToastTitle>}
            {description && <ToastDescription>{description}</ToastDescription>}
            {action}
            <ToastClose />
          </Toast>
        ))}
        <ToastViewport />
      </ToastProvider>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastContextProvider")
  }
  return context
}

// Create a safe version of the hook that doesn't throw
export function useSafeToast() {
  const context = React.useContext(ToastContext)
  const noop = React.useCallback(() => {}, [])

  if (context === undefined) {
    return {
      toasts: [],
      addToast: noop,
      removeToast: noop,
    }
  }

  return context
}
