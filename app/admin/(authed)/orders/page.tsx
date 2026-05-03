import Link from "next/link"
import { and, desc, eq, ilike, or, type SQL } from "drizzle-orm"
import { db } from "@/lib/db"
import { orders } from "@/lib/db/schema"
import { AdminPageHeader } from "@/components/admin/page-header"
import { StatusBadge } from "@/app/admin/(authed)/page"
import { formatPrice } from "@/lib/utils"

export const dynamic = "force-dynamic"

interface Props {
  searchParams: Promise<{ status?: string; q?: string }>
}

export default async function OrdersAdmin({ searchParams }: Props) {
  const { status, q } = await searchParams

  const filters: SQL[] = []
  if (status) filters.push(eq(orders.status, status))
  if (q) {
    const search = `%${q}%`
    const searchCondition = or(
      ilike(orders.orderNumber, search),
      ilike(orders.customerEmail, search),
      ilike(orders.customerLastName, search),
    )
    if (searchCondition) filters.push(searchCondition)
  }
  const where = filters.length > 0 ? and(...filters) : undefined

  const rows = await db
    .select()
    .from(orders)
    .where(where)
    .orderBy(desc(orders.createdAt))
    .limit(100)

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
          <tbody className="divide-y divide-[#1a1a1a]/5">
            {rows.map((o) => (
              <tr key={o.id} className="hover:bg-[#f7e7ce]/50 cursor-pointer">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/orders/${o.id}`}
                    className="font-bold text-[#ff6b35] hover:underline"
                  >
                    {o.orderNumber}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium">
                    {o.customerFirstName} {o.customerLastName}
                  </p>
                  <p className="text-xs text-[#502e23]/70">{o.customerEmail}</p>
                </td>
                <td className="px-4 py-3 font-bold">{formatPrice(Number(o.grandTotal))}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={o.status} />
                </td>
                <td className="px-4 py-3 text-[#502e23]/70 text-xs">
                  {o.createdAt instanceof Date
                    ? o.createdAt.toLocaleDateString("el-GR", {
                        day: "2-digit",
                        month: "short",
                      })
                    : ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <p className="text-center text-[#502e23]/70 py-12">Καμία παραγγελία.</p>
        )}
      </div>
    </div>
  )
}
