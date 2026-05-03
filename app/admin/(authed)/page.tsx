import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { desc, sql } from "drizzle-orm"
import { db } from "@/lib/db"
import { drops, newsletterSubscribers, orders, products } from "@/lib/db/schema"
import { formatPrice } from "@/lib/utils"

export const dynamic = "force-dynamic"

async function getStats() {
  const [productsCount, ordersAll, dropsCount, subsCount, recent] = await Promise.all([
    db.select({ count: sql<number>`count(*)::int` }).from(products),
    db
      .select({ status: orders.status, grandTotal: orders.grandTotal })
      .from(orders),
    db.select({ count: sql<number>`count(*)::int` }).from(drops),
    db.select({ count: sql<number>`count(*)::int` }).from(newsletterSubscribers),
    db.select().from(orders).orderBy(desc(orders.createdAt)).limit(5),
  ])

  const paidOrders = ordersAll.filter(
    (o) => o.status === "paid" || o.status === "shipped" || o.status === "delivered",
  )
  const revenue = paidOrders.reduce((sum, o) => sum + Number(o.grandTotal || 0), 0)

  return {
    productCount: Number(productsCount[0]?.count) || 0,
    orderCount: ordersAll.length,
    dropCount: Number(dropsCount[0]?.count) || 0,
    subscriberCount: Number(subsCount[0]?.count) || 0,
    revenue,
    recentOrders: recent,
  }
}

export default async function AdminDashboard() {
  const stats = await getStats()

  return (
    <div className="max-w-6xl">
      <div className="mb-12 md:mb-16">
        <p className="text-[11px] tracking-[0.2em] uppercase text-[#1a1a1a]/50 mb-4">
          dashboard
        </p>
        <h1 className="headline-md text-[#1a1a1a]">καλωσήρθες πίσω</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 border-t border-[#1a1a1a]/10 mb-16">
        <Stat label="προϊόντα" value={stats.productCount} />
        <Stat label="παραγγελίες" value={stats.orderCount} />
        <Stat label="drops" value={stats.dropCount} />
        <Stat label="subscribers" value={stats.subscriberCount} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
        <div className="lg:col-span-1">
          <p className="text-[11px] tracking-[0.2em] uppercase text-[#1a1a1a]/50 mb-3">
            έσοδα
          </p>
          <p className="font-light text-[#1a1a1a] text-5xl md:text-6xl tabular-nums tracking-tight leading-none">
            {formatPrice(stats.revenue)}
          </p>
          <p className="text-[#1a1a1a]/55 text-sm mt-3">από επιτυχείς παραγγελίες</p>
        </div>
      </div>

      <div className="border-t border-[#1a1a1a]/10 pt-8">
        <div className="flex items-baseline justify-between mb-6">
          <p className="text-[11px] tracking-[0.2em] uppercase text-[#1a1a1a]/50">
            πρόσφατες παραγγελίες
          </p>
          <Link
            href="/admin/orders"
            className="text-xs tracking-[0.12em] uppercase text-[#1a1a1a]/70 hover:text-[#1a1a1a] inline-flex items-center gap-1.5 border-b border-[#1a1a1a]/20 hover:border-[#1a1a1a] pb-0.5 transition-colors"
          >
            όλες <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {stats.recentOrders.length === 0 ? (
          <p className="text-[#1a1a1a]/50 text-sm py-8">Καμία παραγγελία ακόμη.</p>
        ) : (
          <div className="divide-y divide-[#1a1a1a]/8">
            {stats.recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="flex items-center justify-between py-4 -mx-2 px-2 hover:bg-[#1a1a1a]/[0.02] transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-[#1a1a1a] truncate text-sm">
                    <span className="tabular-nums">{order.orderNumber}</span>
                    <span className="text-[#1a1a1a]/30 mx-2">·</span>
                    <span>{order.customerFirstName} {order.customerLastName}</span>
                  </p>
                  <p className="text-xs text-[#1a1a1a]/50 mt-1">
                    {order.createdAt instanceof Date
                      ? order.createdAt.toLocaleString("el-GR")
                      : String(order.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <StatusBadge status={order.status} />
                  <span className="text-[#1a1a1a] tabular-nums w-20 text-right text-sm">
                    {formatPrice(Number(order.grandTotal))}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="border-r last:border-r-0 border-[#1a1a1a]/10 py-6 md:py-8 px-4 md:px-6 first:pl-0">
      <p className="text-[11px] tracking-[0.2em] uppercase text-[#1a1a1a]/50 mb-3">{label}</p>
      <p className="font-light text-[#1a1a1a] text-4xl md:text-5xl tabular-nums tracking-tight leading-none">
        {value}
      </p>
    </div>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; dot: string }> = {
    payment_pending: { label: "αναμονή", dot: "bg-[#1a1a1a]/30" },
    paid: { label: "πληρώθηκε", dot: "bg-[#0f9b81]" },
    shipped: { label: "στάλθηκε", dot: "bg-[#1a1a1a]" },
    delivered: { label: "παραδόθηκε", dot: "bg-[#1a1a1a]" },
    cancelled: { label: "ακυρώθηκε", dot: "bg-destructive" },
    refunded: { label: "επιστρ.", dot: "bg-[#502e23]" },
  }
  const config = map[status] || { label: status, dot: "bg-[#1a1a1a]/30" }
  return (
    <span className="inline-flex items-center gap-2 text-[10px] tracking-[0.14em] uppercase text-[#1a1a1a]/70">
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  )
}
