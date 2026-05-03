"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { XCircle, RefreshCw } from "lucide-react"

export default function CheckoutFailure() {
  const searchParams = useSearchParams()
  const [orderDetails, setOrderDetails] = useState<any>(null)

  // Viva redirect parameters
  const orderCode = searchParams.get("s") // Viva order code
  const eventId = searchParams.get("eventId") // Event ID
  const language = searchParams.get("lang") // Language

  // Get order ID from session storage
  const orderId = typeof window !== "undefined" ? sessionStorage.getItem("pendingOrderId") : null

  useEffect(() => {
    const checkOrderStatus = async () => {
      try {
        if (orderId) {
          // Fetch order details
          const response = await fetch(`/api/orders/${orderId}`)
          if (response.ok) {
            const order = await response.json()
            setOrderDetails(order)
          }
        }
      } catch (error) {
        console.error("Error fetching order details:", error)
      }
    }

    checkOrderStatus()
  }, [orderId])

  return (
    <div className="container mx-auto py-16 px-4 text-center">
      <div className="max-w-md mx-auto">
        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Πληρωμή Ακυρώθηκε</h1>
        <p className="text-gray-600 mb-6">
          Η πληρωμή σας δεν ολοκληρώθηκε. Μπορείτε να δοκιμάσετε ξανά ή να επιλέξετε διαφορετικό τρόπο πληρωμής.
        </p>

        {orderDetails && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <p className="text-sm text-gray-500 mb-2">Αριθμός παραγγελίας:</p>
            <p className="font-mono font-bold">{orderDetails.number || orderDetails.id}</p>
            {orderCode && (
              <>
                <p className="text-sm text-gray-500 mb-2 mt-4">Κωδικός πληρωμής Viva:</p>
                <p className="font-mono">{orderCode}</p>
              </>
            )}
          </div>
        )}

        <div className="space-y-3">
          <Button asChild className="w-full">
            <Link href="/checkout">
              <RefreshCw className="w-4 h-4 mr-2" />
              Δοκιμή Ξανά
            </Link>
          </Button>
          <Button variant="outline" asChild className="w-full">
            <Link href="/cart">Επιστροφή στο Καλάθι</Link>
          </Button>
          <Button variant="ghost" asChild className="w-full">
            <Link href="/">Αρχική Σελίδα</Link>
          </Button>
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Χρειάζεστε βοήθεια;</strong>
            <br />
            Επικοινωνήστε μαζί μας για υποστήριξη με την παραγγελία σας.
          </p>
        </div>
      </div>
    </div>
  )
}
