import Link from "next/link"
import { ArrowRight, Package, Receipt, Sparkles, Users, Euro } from "lucide-react"
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
    <div className="space-y-8 max-w-6xl">
      <div>
        <div className="caption text-[#ff6b35] mb-2">control panel</div>
        <h1 className="headline-md text-[#1a1a1a] text-4xl md:text-5xl">καλωσήρθες πίσω ✿</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="προϊόντα" value={stats.productCount.toString()} icon={Package} bg="bg-[#ff6b35]" text="text-white" />
        <StatCard label="παραγγελίες" value={stats.orderCount.toString()} icon={Receipt} bg="bg-[#0f9b81]" text="text-white" />
        <StatCard label="drops" value={stats.dropCount.toString()} icon={Sparkles} bg="bg-[#ffc107]" text="text-[#1a1a1a]" />
        <StatCard label="subscribers" value={stats.subscriberCount.toString()} icon={Users} bg="bg-[#6a1b9a]" text="text-white" />
      </div>

      <div
        className="bg-white border-2 border-[#1a1a1a] rounded-3xl p-6"
        style={{ boxShadow: "0 12px 28px -16px rgba(26, 18, 8, 0.25)" }}
      >
        <div className="flex items-center gap-3 mb-3">
          <Euro className="h-5 w-5 text-[#ff6b35]" />
          <h2 className="font-heading font-bold text-xl">συνολικά έσοδα</h2>
        </div>
        <p className="font-light text-[#ff6b35] text-6xl">{formatPrice(stats.revenue)}</p>
        <p className="text-[#502e23]/70 text-sm mt-1">από επιτυχείς παραγγελίες</p>
      </div>

      <div
        className="bg-white border-2 border-[#1a1a1a] rounded-3xl p-6"
        style={{ boxShadow: "0 12px 28px -16px rgba(26, 18, 8, 0.25)" }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-heading font-bold text-xl">πρόσφατες παραγγελίες</h2>
          <Link
            href="/admin/orders"
            className="text-sm font-medium text-[#ff6b35] hover:underline inline-flex items-center gap-1"
          >
            όλες <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {stats.recentOrders.length === 0 ? (
          <p className="text-[#502e23]/70 text-sm">Καμία παραγγελία ακόμη.</p>
        ) : (
          <div className="space-y-2">
            {stats.recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="flex items-center justify-between p-3 rounded-2xl hover:bg-[#f7e7ce] transition-colors"
              >
                <div className="min-w-0">
                  <p className="font-medium text-[#1a1a1a] truncate">
                    {order.orderNumber} · {order.customerFirstName} {order.customerLastName}
                  </p>
                  <p className="text-xs text-[#502e23]/70">
                    {order.createdAt instanceof Date
                      ? order.createdAt.toLocaleString("el-GR")
                      : String(order.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={order.status} />
                  <span className="font-bold text-[#1a1a1a]">{formatPrice(Number(order.grandTotal))}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon: Icon,
  bg,
  text,
}: {
  label: string
  value: string
  icon: any
  bg: string
  text: string
}) {
  return (
    <div
      className={`p-5 rounded-3xl border-2 border-[#1a1a1a] ${bg} ${text}`}
      style={{ boxShadow: "0 12px 28px -16px rgba(26, 18, 8, 0.25)" }}
    >
      <Icon className="h-5 w-5 mb-3 opacity-80" />
      <p className="font-heading font-bold text-3xl">{value}</p>
      <p className="text-xs uppercase tracking-wider opacity-80 mt-1">{label}</p>
    </div>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    payment_pending: { label: "αναμονή", cls: "bg-[#ffc107] text-[#1a1a1a]" },
    paid: { label: "πληρώθηκε", cls: "bg-[#0f9b81] text-white" },
    shipped: { label: "στάλθηκε", cls: "bg-[#6a1b9a] text-white" },
    delivered: { label: "παραδόθηκε", cls: "bg-[#1a1a1a] text-[#ffc107]" },
    cancelled: { label: "ακυρώθηκε", cls: "bg-destructive text-white" },
    refunded: { label: "επιστρ.", cls: "bg-[#502e23] text-white" },
  }
  const config = map[status] || { label: status, cls: "bg-[#1a1a1a]/10 text-[#1a1a1a]" }
  return (
    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${config.cls}`}>
      {config.label}
    </span>
  )
}
