import Image from "next/image"
import { notFound } from "next/navigation"
import { getSupabaseServiceClient } from "@/lib/supabase-server"
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
  const supabase = getSupabaseServiceClient()

  const [orderRes, itemsRes] = await Promise.all([
    supabase.from("orders").select("*").eq("id", id).single(),
    supabase.from("order_items").select("*").eq("order_id", id),
  ])

  if (orderRes.error || !orderRes.data) notFound()
  const order = orderRes.data as any
  const items = itemsRes.data || []

  return (
    <div>
      <AdminPageHeader
        eyebrow={`order ${order.order_number}`}
        title={`${order.customer_first_name} ${order.customer_last_name}`}
        back={{ href: "/admin/orders", label: "πίσω στις παραγγελίες" }}
        actions={<StatusBadge status={order.status} />}
      />

      <div className="grid lg:grid-cols-3 gap-6 max-w-6xl">
        <div className="lg:col-span-2 space-y-5">
          <Card title="Προϊόντα">
            <div className="divide-y divide-ink/5">
              {items.map((item: any) => (
                <div key={item.id} className="flex items-center gap-4 py-3">
                  <div className="relative w-14 h-14 rounded-xl bg-[#f7e7ce] overflow-hidden">
                    {item.product_image_url && (
                      <Image src={item.product_image_url} alt={item.product_name} fill sizes="56px" className="object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[#1a1a1a]">{item.product_name}</p>
                    <p className="text-sm text-[#502e23]/70">
                      {formatPrice(item.price)} × {item.quantity}
                    </p>
                  </div>
                  <span className="font-bold">{formatPrice(item.line_total)}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-[#1a1a1a]/10 space-y-2 text-sm">
              <Row label="υποσύνολο" value={formatPrice(order.subtotal)} />
              {order.discount_total > 0 && <Row label={`έκπτωση ${order.coupon_code || ""}`} value={`-${formatPrice(order.discount_total)}`} />}
              <Row label="μεταφορικά" value={formatPrice(order.shipping_total)} />
              <Row label="σύνολο" value={formatPrice(order.grand_total)} bold />
            </div>
          </Card>

          <Card title="Αποστολή">
            <p className="font-medium text-[#1a1a1a]">
              {order.customer_first_name} {order.customer_last_name}
            </p>
            <p className="text-[#502e23]/70 text-sm">{order.shipping_address1}</p>
            {order.shipping_address2 && <p className="text-[#502e23]/70 text-sm">{order.shipping_address2}</p>}
            <p className="text-[#502e23]/70 text-sm">
              {order.shipping_city}, {order.shipping_zip}
            </p>
            <p className="text-[#502e23]/70 text-sm">{order.shipping_country}</p>
            <p className="text-[#502e23]/70 text-sm mt-3">
              <strong className="text-[#1a1a1a]">Μέθοδος:</strong> {order.shipping_method_name || order.shipping_method}
            </p>
          </Card>
        </div>

        <div className="space-y-5">
          <Card title="Πελάτης">
            <p className="font-medium">{order.customer_first_name} {order.customer_last_name}</p>
            <p className="text-sm">
              <a href={`mailto:${order.customer_email}`} className="text-[#ff6b35] hover:underline">
                {order.customer_email}
              </a>
            </p>
            <p className="text-sm">
              <a href={`tel:${order.customer_phone}`} className="text-[#ff6b35] hover:underline">
                {order.customer_phone}
              </a>
            </p>
          </Card>

          <Card title="Πληρωμή">
            <p className="text-sm">
              <strong>Μέθοδος:</strong> {order.payment_method || "—"}
            </p>
            <p className="text-sm">
              <strong>Status:</strong> {order.payment_status}
            </p>
            {order.stripe_session_id && (
              <p className="text-xs text-[#502e23]/70 mt-2 break-all">{order.stripe_session_id}</p>
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
    <div className="bg-white border-2 border-[#1a1a1a] rounded-3xl p-5" style={{ boxShadow: "0 12px 28px -16px rgba(26, 18, 8, 0.25)" }}>
      <h3 className="font-heading font-bold text-lg mb-4">{title}</h3>
      {children}
    </div>
  )
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? "font-bold text-base pt-2 border-t border-[#1a1a1a]/10" : ""}`}>
      <span className={bold ? "text-[#1a1a1a]" : "text-[#502e23]/70"}>{label}</span>
      <span className="text-[#1a1a1a]">{value}</span>
    </div>
  )
}
