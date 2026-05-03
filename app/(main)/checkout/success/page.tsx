"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useCart } from "@/context/cart-context"
import { Button } from "@/components/ui/button"
import { CheckCircle, Loader2 } from "lucide-react"
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
  const router = useRouter()
  const { clearCart } = useCart()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!sessionId) {
      setError("Could not verify payment. Missing session data.")
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
    <div className="container mx-auto pt-32 pb-16 px-4 text-center">
      {loading && (
        <div>
          <Loader2 className="h-12 w-12 text-[#ff6b35] mx-auto animate-spin mb-4" />
          <h1 className="headline-sm text-[#1a1a1a] mb-2">Επιβεβαίωση πληρωμής...</h1>
          <p className="text-[#502e23]/70">Επεξεργαζόμαστε την παραγγελία σου. Μην κλείσεις τη σελίδα.</p>
        </div>
      )}

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive p-6 rounded-lg max-w-md mx-auto">
          <h1 className="text-2xl font-semibold mb-2">Σφάλμα</h1>
          <p>{error}</p>
          <Button onClick={() => router.push("/")} className="mt-6">
            Επιστροφή στην αρχική
          </Button>
        </div>
      )}

      {order && (
        <div className="max-w-2xl mx-auto">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h1 className="headline-md text-[#1a1a1a] mb-2">η παραγγελία σου ολοκληρώθηκε!</h1>
          <p className="text-[#502e23]/70 mb-6">
            Λάβαμε την πληρωμή σου. Ένα email επιβεβαίωσης έχει σταλεί στη διεύθυνση {order.customer_email || "σου"}.
          </p>
          <div className="bg-white/60 p-6 rounded-2xl border border-white/90 text-left">
            <h2 className="text-lg font-semibold mb-4 text-[#1a1a1a]">Σύνοψη παραγγελίας</h2>
            <div className="flex justify-between mb-2">
              <span className="text-[#502e23]/70">Αριθμός παραγγελίας:</span>
              <span className="font-medium">{order.order_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#502e23]/70">Σύνολο:</span>
              <span className="font-semibold">{formatPrice(order.grand_total)}</span>
            </div>
          </div>
          <Button
            onClick={() => router.push("/")}
            className="mt-8 bg-[#1a1a1a] hover:bg-[#1a1a1a]/85 text-white"
          >
            Συνέχεια στις αγορές
          </Button>
        </div>
      )}
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto pt-32 pb-16 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#ff6b35] mx-auto" />
        </div>
      }
    >
      <SuccessPageContent />
    </Suspense>
  )
}
