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

      <div className="grid lg:grid-cols-3 gap-6 max-w-6xl">
        <div className="lg:col-span-2 space-y-5">
          <Card title="Προϊόντα">
            <div className="divide-y divide-[#1a1a1a]/5">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 py-3">
                  <div className="relative w-14 h-14 rounded-xl bg-[#f7e7ce] overflow-hidden">
                    {item.productImageUrl && (
                      <Image
                        src={item.productImageUrl}
                        alt={item.productName}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[#1a1a1a]">{item.productName}</p>
                    <p className="text-sm text-[#502e23]/70">
                      {formatPrice(Number(item.price))} × {item.quantity}
                    </p>
                  </div>
                  <span className="font-bold">{formatPrice(Number(item.lineTotal))}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-[#1a1a1a]/10 space-y-2 text-sm">
              <Row label="υποσύνολο" value={formatPrice(Number(order.subtotal))} />
              {Number(order.discountTotal) > 0 && (
                <Row
                  label={`έκπτωση ${order.couponCode || ""}`}
                  value={`-${formatPrice(Number(order.discountTotal))}`}
                />
              )}
              <Row label="μεταφορικά" value={formatPrice(Number(order.shippingTotal))} />
              <Row label="σύνολο" value={formatPrice(Number(order.grandTotal))} bold />
            </div>
          </Card>

          <Card title="Αποστολή">
            <p className="font-medium text-[#1a1a1a]">
              {order.customerFirstName} {order.customerLastName}
            </p>
            <p className="text-[#502e23]/70 text-sm">{order.shippingAddress1}</p>
            {order.shippingAddress2 && (
              <p className="text-[#502e23]/70 text-sm">{order.shippingAddress2}</p>
            )}
            <p className="text-[#502e23]/70 text-sm">
              {order.shippingCity}, {order.shippingZip}
            </p>
            <p className="text-[#502e23]/70 text-sm">{order.shippingCountry}</p>
            <p className="text-[#502e23]/70 text-sm mt-3">
              <strong className="text-[#1a1a1a]">Μέθοδος:</strong>{" "}
              {order.shippingMethodName || order.shippingMethod}
            </p>
          </Card>
        </div>

        <div className="space-y-5">
          <Card title="Πελάτης">
            <p className="font-medium">
              {order.customerFirstName} {order.customerLastName}
            </p>
            <p className="text-sm">
              <a
                href={`mailto:${order.customerEmail}`}
                className="text-[#ff6b35] hover:underline"
              >
                {order.customerEmail}
              </a>
            </p>
            <p className="text-sm">
              <a href={`tel:${order.customerPhone}`} className="text-[#ff6b35] hover:underline">
                {order.customerPhone}
              </a>
            </p>
          </Card>

          <Card title="Πληρωμή">
            <p className="text-sm">
              <strong>Μέθοδος:</strong> {order.paymentMethod || "—"}
            </p>
            <p className="text-sm">
              <strong>Status:</strong> {order.paymentStatus}
            </p>
            {order.stripeSessionId && (
              <p className="text-xs text-[#502e23]/70 mt-2 break-all">{order.stripeSessionId}</p>
            )}
          </Card>

          <Card title="Status">
            <OrderStatusForm orderId={order.id} currentStatus={order.status} />
          </Card>
        </div>
      </div>
    </div>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="bg-white border-2 border-[#1a1a1a] rounded-3xl p-5"
      style={{ boxShadow: "0 12px 28px -16px rgba(26, 18, 8, 0.25)" }}
    >
      <h3 className="font-heading font-bold text-lg mb-4">{title}</h3>
      {children}
    </div>
  )
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div
      className={`flex justify-between ${
        bold ? "font-bold text-base pt-2 border-t border-[#1a1a1a]/10" : ""
      }`}
    >
      <span className={bold ? "text-[#1a1a1a]" : "text-[#502e23]/70"}>{label}</span>
      <span className="text-[#1a1a1a]">{value}</span>
    </div>
  )
}
