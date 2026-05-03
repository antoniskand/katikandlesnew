"use client"

import { useEffect, useState, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useCart } from "@/context/cart-context"
import { Loader2 } from "lucide-react"
import { formatPrice } from "@/lib/utils"

interface Order {
  id: string
  order_number: string
  grand_total: number
  customer_email?: string
}

function SuccessPageContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")
  const { clearCart } = useCart()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!sessionId) {
      setError("Δεν μπόρεσε να επιβεβαιωθεί η πληρωμή. Λείπουν δεδομένα του session.")
      setLoading(false)
      return
    }

    let attempts = 0
    const maxAttempts = 10
    const intervalTime = 2000

    const findOrder = async () => {
      attempts++
      try {
        const response = await fetch(`/api/payments/stripe/order?session_id=${sessionId}`)
        const data = await response.json()

        if (response.ok && data.order) {
          setOrder(data.order)
          setLoading(false)
          clearCart()
        } else if (attempts >= maxAttempts) {
          setError("Δεν βρέθηκε η παραγγελία. Επικοινώνησε μαζί μας με το session ID.")
          setLoading(false)
        } else {
          setTimeout(findOrder, intervalTime)
        }
      } catch {
        if (attempts >= maxAttempts) {
          setError("Σφάλμα σύνδεσης. Δοκίμασε ξανά.")
          setLoading(false)
        } else {
          setTimeout(findOrder, intervalTime)
        }
      }
    }
    findOrder()
  }, [sessionId, clearCart])

  return (
    <div className="min-h-screen bg-[#fafaf7] flex items-center justify-center px-6 py-32">
      {loading && (
        <div className="text-center max-w-md">
          <Loader2 className="h-6 w-6 mx-auto animate-spin text-[#1a1a1a]/60 mb-6" />
          <p className="text-[11px] tracking-[0.22em] uppercase text-[#1a1a1a]/50 mb-3">
            επιβεβαίωση πληρωμής
          </p>
          <h1 className="headline-md text-[#1a1a1a] mb-4">επεξεργαζόμαστε</h1>
          <p className="text-[#1a1a1a]/65 text-sm leading-relaxed">
            Μην κλείσεις τη σελίδα. Θα ολοκληρωθεί σε λίγα δευτερόλεπτα.
          </p>
        </div>
      )}

      {error && (
        <div className="text-center max-w-md">
          <p className="text-[11px] tracking-[0.22em] uppercase text-destructive mb-3">σφάλμα</p>
          <h1 className="headline-md text-[#1a1a1a] mb-4">κάτι πήγε στραβά</h1>
          <p className="text-[#1a1a1a]/65 text-sm leading-relaxed mb-8">{error}</p>
          <Link
            href="/"
            className="inline-flex items-center justify-center bg-[#1a1a1a] hover:bg-[#1a1a1a]/85 text-white text-sm tracking-[0.06em] uppercase px-8 h-12 transition-colors"
          >
            επιστροφή στην αρχική
          </Link>
        </div>
      )}

      {order && (
        <div className="max-w-xl w-full">
          <p className="text-[11px] tracking-[0.22em] uppercase text-[#0f9b81] mb-4 inline-flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#0f9b81]" />
            ολοκληρώθηκε
          </p>
          <h1 className="headline-md text-[#1a1a1a] mb-6">
            σ&apos; ευχαριστούμε
          </h1>
          <p className="text-[#1a1a1a]/65 leading-relaxed mb-12 max-w-md">
            Λάβαμε την πληρωμή σου. Email επιβεβαίωσης πάει
            {order.customer_email ? (
              <> στο <span className="text-[#1a1a1a]">{order.customer_email}</span></>
            ) : (
              <> στο email σου</>
            )}.
          </p>

          <div className="border-t border-[#1a1a1a]/12 pt-6 space-y-4 text-sm">
            <div className="flex items-baseline justify-between">
              <span className="text-[11px] tracking-[0.22em] uppercase text-[#1a1a1a]/50">
                αριθμός παραγγελίας
              </span>
              <span className="text-[#1a1a1a] tabular-nums">{order.order_number}</span>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-[#1a1a1a] flex items-baseline justify-between gap-4">
            <span className="text-[11px] tracking-[0.22em] uppercase text-[#1a1a1a]/50">
              σύνολο
            </span>
            <span className="font-light text-[#1a1a1a] text-4xl md:text-5xl tabular-nums tracking-tight leading-none">
              {formatPrice(order.grand_total)}
            </span>
          </div>

          <div className="mt-12 flex flex-wrap gap-4">
            <Link
              href="/"
              className="inline-flex items-center justify-center bg-[#1a1a1a] hover:bg-[#1a1a1a]/85 text-white text-sm tracking-[0.06em] uppercase px-8 h-12 transition-colors"
            >
              συνέχεια στις αγορές
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center text-xs tracking-[0.12em] uppercase text-[#1a1a1a]/60 hover:text-[#1a1a1a] border-b border-[#1a1a1a]/20 hover:border-[#1a1a1a] pb-1 transition-colors"
            >
              έχω απορία →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#fafaf7] flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-[#1a1a1a]/60" />
        </div>
      }
    >
      <SuccessPageContent />
    </Suspense>
  )
}
