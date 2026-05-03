import { desc } from "drizzle-orm"
import { db } from "@/lib/db"
import { coupons } from "@/lib/db/schema"
import { AdminPageHeader } from "@/components/admin/page-header"
import { SimpleCrudList } from "@/components/admin/simple-crud-list"

export const dynamic = "force-dynamic"

export default async function CouponsAdmin() {
  const rows = await db.select().from(coupons).orderBy(desc(coupons.createdAt))

  const data = rows.map((c) => ({
    id: c.id,
    code: c.code,
    name: c.name ?? "",
    description: c.description ?? "",
    discount_type: c.discountType,
    discount_amount: c.discountAmount != null ? Number(c.discountAmount) : null,
    discount_percent: c.discountPercent != null ? Number(c.discountPercent) : null,
    min_order_amount: c.minOrderAmount != null ? Number(c.minOrderAmount) : null,
    max_uses: c.maxUses,
    times_used: c.timesUsed,
    active: c.active,
  }))

  return (
    <div>
      <AdminPageHeader eyebrow="discounts" title="Κουπόνια" />
      <SimpleCrudList
        endpoint="/api/admin/coupons"
        rows={data}
        itemNoun="κουπονιού"
        newDefaults={{ discount_type: "percent", active: true, times_used: 0 }}
        columns={[
          { key: "code", label: "Code", required: true, placeholder: "WELCOME10" },
          { key: "name", label: "Όνομα" },
          {
            key: "discount_type",
            label: "Τύπος",
            type: "select",
            options: [
              { value: "percent", label: "ποσοστό %" },
              { value: "fixed", label: "ποσό €" },
              { value: "shipping", label: "δωρεάν αποστολή" },
            ],
          },
          { key: "discount_percent", label: "%", type: "number", placeholder: "10" },
          { key: "discount_amount", label: "€", type: "number", hideInList: true },
          { key: "min_order_amount", label: "min order €", type: "number", hideInList: true },
          { key: "max_uses", label: "max uses", type: "number", hideInList: true },
          { key: "times_used", label: "χρήσεις", type: "number" },
          { key: "active", label: "ενεργό", type: "checkbox" },
        ]}
      />
    </div>
  )
}
