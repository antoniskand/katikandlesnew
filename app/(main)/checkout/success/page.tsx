"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useCart } from "@/context/cart-context"
import { Button } from "@/components/ui/button"
import { CheckCircle, Loader } from "lucide-react"

interface Order {
  id: string
  number: string
  grand_total: number
  account?: {
    email?: string
  }
}

function SuccessPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { clearCartContext } = useCart()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const vivaOrderCode = sessionStorage.getItem("vivaOrderCode")
    const transactionId = searchParams.get("t")

    if (!vivaOrderCode || !transactionId) {
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
        const response = await fetch(`/api/cart/find-by-viva-code`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ vivaOrderCode }),
        })
        const data = await response.json()

        if (response.ok && (data.order || data.cart)) {
          const orderData = data.order || data.cart
          setOrder(orderData)
          setLoading(false)
          clearCartContext()
          sessionStorage.removeItem("vivaOrderCode")
          sessionStorage.removeItem("pendingCartId")
        } else {
          if (attempts >= maxAttempts) {
            setError("Could not find your order. Please contact support with your transaction ID.")
            setLoading(false)
          } else {
            setTimeout(findOrder, intervalTime)
          }
        }
      } catch {
        if (attempts >= maxAttempts) {
          setError("An error occurred while fetching your order details.")
          setLoading(false)
        } else {
          setTimeout(findOrder, intervalTime)
        }
      }
    }

    findOrder()
  }, [searchParams, clearCartContext])

  return (
    <div className="container mx-auto py-10 px-4 text-center">
      {loading && (
        <div>
          <Loader className="h-12 w-12 text-primary mx-auto animate-spin mb-4" />
          <h1 className="text-2xl font-bold mb-2">Επιβεβαίωση Πληρωμής...</h1>
          <p className="text-muted-foreground">Επεξεργαζόμαστε την παραγγελία σας. Μην κλείσετε αυτή τη σελίδα.</p>
        </div>
      )}

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive p-6 rounded-lg">
          <h1 className="text-2xl font-bold mb-2">Σφάλμα</h1>
          <p>{error}</p>
          <Button onClick={() => router.push("/")} className="mt-6">
            Επιστροφή στην Αρχική
          </Button>
        </div>
      )}

      {order && (
        <div className="max-w-2xl mx-auto">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Η παραγγελία σας ολοκληρώθηκε!</h1>
          <p className="text-muted-foreground mb-6">
            Λάβαμε την πληρωμή σας. Ένα email επιβεβαίωσης έχει σταλεί στη διεύθυνση {order.account?.email || "σας"}.
          </p>
          <div className="bg-muted p-6 rounded-lg border text-left">
            <h2 className="text-lg font-semibold mb-4">Σύνοψη Παραγγελίας</h2>
            <div className="flex justify-between mb-2">
              <span className="text-muted-foreground">Αριθμός Παραγγελίας:</span>
              <span className="font-medium">#{order.number || order.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Σύνολο:</span>
              <span className="font-medium">
                {new Intl.NumberFormat("el-GR", { style: "currency", currency: "EUR" }).format(order.grand_total)}
              </span>
            </div>
          </div>
          <Button onClick={() => router.push("/products")} className="mt-8">
            Συνέχεια στις αγορές
          </Button>
        </div>
      )}
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SuccessPageContent />
    </Suspense>
  )
}
