"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

const STATUSES = [
  { id: "payment_pending", label: "αναμονή πληρωμής" },
  { id: "paid", label: "πληρώθηκε" },
  { id: "shipped", label: "στάλθηκε" },
  { id: "delivered", label: "παραδόθηκε" },
  { id: "cancelled", label: "ακυρώθηκε" },
  { id: "refunded", label: "επιστράφηκε" },
]

interface Props {
  orderId: string
  currentStatus: string
}

export function OrderStatusForm({ orderId, currentStatus }: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [status, setStatus] = useState(currentStatus)

  const update = () => {
    if (status === currentStatus) return
    startTransition(async () => {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) {
        toast({ title: "Σφάλμα", variant: "destructive" })
        return
      }
      toast({ title: "Ενημερώθηκε ✿" })
      router.refresh()
    })
  }

  return (
    <div className="space-y-3">
      <select
        className="kk-input"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
      >
        {STATUSES.map((s) => (
          <option key={s.id} value={s.id}>
            {s.label}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={update}
        disabled={isPending || status === currentStatus}
        className="kk-btn kk-btn-primary w-full disabled:opacity-60"
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "ενημέρωση"}
      </button>
    </div>
  )
}
