import Link from "next/link"
import { getSupabaseServiceClient } from "@/lib/supabase-server"
import { AdminPageHeader } from "@/components/admin/page-header"
import { StatusBadge } from "@/app/admin/(authed)/page"
import { formatPrice } from "@/lib/utils"

export const dynamic = "force-dynamic"

interface Props {
  searchParams: Promise<{ status?: string; q?: string }>
}

export default async function OrdersAdmin({ searchParams }: Props) {
  const { status, q } = await searchParams
  const supabase = getSupabaseServiceClient()

  let query = supabase
    .from("orders")
    .select("id, order_number, customer_first_name, customer_last_name, customer_email, grand_total, status, payment_status, created_at")
    .order("created_at", { ascending: false })
    .limit(100)

  if (status) query = query.eq("status", status)
  if (q) query = query.or(`order_number.ilike.%${q}%,customer_email.ilike.%${q}%,customer_last_name.ilike.%${q}%`)

  const { data: orders } = await query

  const statuses = [
    { id: undefined, label: "όλες" },
    { id: "payment_pending", label: "αναμονή" },
    { id: "paid", label: "πληρωμένες" },
    { id: "shipped", label: "στάλθηκαν" },
    { id: "delivered", label: "παραδόθηκαν" },
    { id: "cancelled", label: "ακυρωμένες" },
  ]

  return (
    <div>
      <AdminPageHeader eyebrow="customer orders" title="Παραγγελίες" />

      <form className="mb-5 flex gap-2 flex-wrap">
        <input
          type="text"
          name="q"
          defaultValue={q || ""}
          placeholder="αναζήτηση: order #, email, επώνυμο"
          className="kk-input flex-1 min-w-[200px]"
        />
        {status && <input type="hidden" name="status" value={status} />}
        <button type="submit" className="kk-btn kk-btn-secondary">αναζήτηση</button>
      </form>

      <div className="mb-5 flex flex-wrap gap-2">
        {statuses.map((s) => (
          <Link
            key={s.id || "all"}
            href={s.id ? `/admin/orders?status=${s.id}` : "/admin/orders"}
            className={`kk-tag ${status === s.id ? "bg-[#1a1a1a] text-[#ffc107] border-[#1a1a1a]" : ""}`}
          >
            {s.label}
          </Link>
        ))}
      </div>

      <div
        className="bg-white border-2 border-[#1a1a1a] rounded-3xl overflow-hidden"
        style={{ boxShadow: "0 12px 28px -16px rgba(26, 18, 8, 0.25)" }}
      >
        <table className="w-full text-sm">
          <thead className="bg-[#f7e7ce] border-b-2 border-[#1a1a1a]/10">
            <tr className="text-left text-[#502e23]/70 uppercase text-[10px] tracking-wider">
              <th className="px-4 py-3">order</th>
              <th className="px-4 py-3">πελάτης</th>
              <th className="px-4 py-3">σύνολο</th>
              <th className="px-4 py-3">status</th>
              <th className="px-4 py-3">date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/5">
            {(orders || []).map((o: any) => (
              <tr
                key={o.id}
                className="hover:bg-[#f7e7ce]/50 cursor-pointer"
                onClick={() => {}}
              >
                <td className="px-4 py-3">
                  <Link href={`/admin/orders/${o.id}`} className="font-bold text-[#ff6b35] hover:underline">
                    {o.order_number}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium">{o.customer_first_name} {o.customer_last_name}</p>
                  <p className="text-xs text-[#502e23]/70">{o.customer_email}</p>
                </td>
                <td className="px-4 py-3 font-bold">{formatPrice(o.grand_total)}</td>
                <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                <td className="px-4 py-3 text-[#502e23]/70 text-xs">
                  {new Date(o.created_at).toLocaleDateString("el-GR", { day: "2-digit", month: "short" })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!orders || orders.length === 0) && (
          <p className="text-center text-[#502e23]/70 py-12">Καμία παραγγελία.</p>
        )}
      </div>
    </div>
  )
}
