import Image from "next/image"
import { notFound } from "next/navigation"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { orderItems, orders } from "@/lib/db/schema"
import { AdminPageHeader } from "@/components/admin/page-header"
import { OrderStatusForm } from "@/components/admin/order-status-form"
import { StatusBadge } from "@/app/admin/(authed)/page"
import { formatPrice } from "@/lib/utils"

export const dynamic = "force-dynamic"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function OrderDetailPage({ params }: PageProps) {
  const { id } = await params

  const [order, items] = await Promise.all([
    db.query.orders.findFirst({ where: eq(orders.id, id) }),
    db.select().from(orderItems).where(eq(orderItems.orderId, id)),
  ])

  if (!order) notFound()

  return (
    <div>
      <AdminPageHeader
        eyebrow={`order ${order.orderNumber}`}
        title={`${order.customerFirstName} ${order.customerLastName}`}
        back={{ href: "/admin/orders", label: "πίσω στις παραγγελίες" }}
        actions={<StatusBadge status={order.status} />}
      />

      <div className="grid lg:grid-cols-3 gap-10 max-w-6xl">
        <div className="lg:col-span-2 space-y-12">
          <Card title="προϊόντα">
            <div className="border-t border-[#1a1a1a]/12 divide-y divide-[#1a1a1a]/8">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 py-4">
                  <div className="relative w-12 h-12 bg-[#f4eee2] overflow-hidden flex-shrink-0">
                    {item.productImageUrl && (
                      <Image
                        src={item.productImageUrl}
                        alt={item.productName}
                        fill
                        sizes="48px"
                        className="object-contain p-1"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[#1a1a1a]">{item.productName}</p>
                    <p className="text-[10px] tracking-[0.12em] uppercase text-[#1a1a1a]/55 mt-1 tabular-nums">
                      {formatPrice(Number(item.price))} · {item.quantity}
                    </p>
                  </div>
                  <span className="text-[#1a1a1a] tabular-nums">
                    {formatPrice(Number(item.lineTotal))}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-5 border-t border-[#1a1a1a]/12 space-y-2 text-sm">
              <Row label="υποσύνολο" value={formatPrice(Number(order.subtotal))} />
              {Number(order.discountTotal) > 0 && (
                <Row
                  label={`έκπτωση ${order.couponCode || ""}`}
                  value={`−${formatPrice(Number(order.discountTotal))}`}
                />
              )}
              <Row label="μεταφορικά" value={formatPrice(Number(order.shippingTotal))} />
              <div className="pt-4 mt-2 border-t border-[#1a1a1a] flex items-baseline justify-between">
                <span className="text-[11px] tracking-[0.22em] uppercase text-[#1a1a1a]/50">
                  σύνολο
                </span>
                <span className="font-light text-[#1a1a1a] text-3xl tabular-nums tracking-tight leading-none">
                  {formatPrice(Number(order.grandTotal))}
                </span>
              </div>
            </div>
          </Card>

          <Card title="αποστολή">
            <p className="text-[#1a1a1a]">
              {order.customerFirstName} {order.customerLastName}
            </p>
            <p className="text-[#1a1a1a]/65 text-sm">{order.shippingAddress1}</p>
            {order.shippingAddress2 && (
              <p className="text-[#1a1a1a]/65 text-sm">{order.shippingAddress2}</p>
            )}
            <p className="text-[#1a1a1a]/65 text-sm">
              {order.shippingCity}, {order.shippingZip}
            </p>
            <p className="text-[#1a1a1a]/65 text-sm">{order.shippingCountry}</p>
            <p className="text-[#1a1a1a]/65 text-sm mt-4">
              <span className="text-[10px] tracking-[0.18em] uppercase text-[#1a1a1a]/50 mr-2">
                μέθοδος
              </span>
              {order.shippingMethodName || order.shippingMethod}
            </p>
          </Card>
        </div>

        <div className="space-y-12">
          <Card title="πελάτης">
            <p className="text-[#1a1a1a]">
              {order.customerFirstName} {order.customerLastName}
            </p>
            <p className="text-sm mt-1">
              <a
                href={`mailto:${order.customerEmail}`}
                className="text-[#1a1a1a] underline underline-offset-4"
              >
                {order.customerEmail}
              </a>
            </p>
            <p className="text-sm mt-1">
              <a
                href={`tel:${order.customerPhone}`}
                className="text-[#1a1a1a] underline underline-offset-4"
              >
                {order.customerPhone}
              </a>
            </p>
          </Card>

          <Card title="πληρωμή">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-[10px] tracking-[0.18em] uppercase text-[#1a1a1a]/50">μέθοδος</dt>
                <dd className="text-[#1a1a1a]">{order.paymentMethod || "—"}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[10px] tracking-[0.18em] uppercase text-[#1a1a1a]/50">status</dt>
                <dd className="text-[#1a1a1a]">{order.paymentStatus}</dd>
              </div>
            </dl>
            {order.stripeSessionId && (
              <p className="text-[10px] text-[#1a1a1a]/45 mt-3 break-all tabular-nums">
                {order.stripeSessionId}
              </p>
            )}
          </Card>

          <Card title="status">
            <OrderStatusForm orderId={order.id} currentStatus={order.status} />
          </Card>
        </div>
      </div>
    </div>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-[11px] tracking-[0.22em] uppercase text-[#1a1a1a]/50 mb-4">
        {title}
      </h3>
      {children}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="text-[#1a1a1a]/65">{label}</span>
      <span className="text-[#1a1a1a] tabular-nums">{value}</span>
    </div>
  )
}
