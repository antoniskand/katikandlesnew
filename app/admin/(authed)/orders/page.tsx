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
            className={`kk-tag ${
              status === s.id ? "bg-[#1a1a1a] text-white border-[#1a1a1a]" : ""
            }`}
          >
            {s.label}
          </Link>
        ))}
      </div>

      <div className="border-t border-[#1a1a1a]/12 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[10px] tracking-[0.18em] uppercase text-[#1a1a1a]/45 border-b border-[#1a1a1a]/12">
              <th className="px-3 py-3 font-normal">order</th>
              <th className="px-3 py-3 font-normal">πελάτης</th>
              <th className="px-3 py-3 font-normal">σύνολο</th>
              <th className="px-3 py-3 font-normal">status</th>
              <th className="px-3 py-3 font-normal">date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1a1a1a]/8">
            {rows.map((o) => (
              <tr key={o.id} className="hover:bg-[#1a1a1a]/[0.02] cursor-pointer">
                <td className="px-3 py-3">
                  <Link
                    href={`/admin/orders/${o.id}`}
                    className="text-[#1a1a1a] tabular-nums border-b border-[#1a1a1a]/30 hover:border-[#1a1a1a] pb-0.5"
                  >
                    {o.orderNumber}
                  </Link>
                </td>
                <td className="px-3 py-3">
                  <p className="text-[#1a1a1a]">
                    {o.customerFirstName} {o.customerLastName}
                  </p>
                  <p className="text-xs text-[#1a1a1a]/55 mt-0.5">{o.customerEmail}</p>
                </td>
                <td className="px-3 py-3 tabular-nums text-[#1a1a1a]">
                  {formatPrice(Number(o.grandTotal))}
                </td>
                <td className="px-3 py-3">
                  <StatusBadge status={o.status} />
                </td>
                <td className="px-3 py-3 text-[#1a1a1a]/55 text-xs tabular-nums">
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
          <p className="text-center text-[#1a1a1a]/55 py-12">Καμία παραγγελία.</p>
        )}
      </div>
    </div>
  )
}
