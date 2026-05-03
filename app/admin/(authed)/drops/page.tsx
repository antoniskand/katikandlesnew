import Link from "next/link"
import { Plus, Star, Edit } from "lucide-react"
import { asc, desc } from "drizzle-orm"
import { db } from "@/lib/db"
import { drops } from "@/lib/db/schema"
import { AdminPageHeader } from "@/components/admin/page-header"

export const dynamic = "force-dynamic"

export default async function DropsAdmin() {
  const rows = await db
    .select()
    .from(drops)
    .orderBy(asc(drops.sortOrder), desc(drops.createdAt))

  return (
    <div>
      <AdminPageHeader
        eyebrow="releases"
        title="Drops"
        actions={
          <Link href="/admin/drops/new" className="kk-btn kk-btn-primary">
            <Plus className="h-4 w-4" /> νέο drop
          </Link>
        }
      />

      <div className="grid gap-4">
        {rows.map((d) => {
          const productIds = Array.isArray(d.productIds) ? (d.productIds as string[]) : []
          return (
            <Link
              key={d.id}
              href={`/admin/drops/${d.id}`}
              className="bg-white border-2 border-[#1a1a1a] rounded-3xl p-5 flex items-center gap-4 hover:translate-x-[-2px] hover:translate-y-[-2px] transition-transform"
              style={{ boxShadow: "0 12px 28px -16px rgba(26, 18, 8, 0.25)" }}
            >
              <div
                className="w-14 h-14 rounded-2xl border-2 border-[#1a1a1a]"
                style={{ background: d.backgroundColor || "#ff5a36" }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-heading font-bold text-lg truncate">{d.name}</h3>
                  {d.featured && <Star className="h-4 w-4 fill-[#ffc107] text-[#ffc107]" />}
                </div>
                <p className="text-sm text-[#502e23]/70">/{d.slug}</p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span
                  className={`px-2 py-1 rounded-full font-medium ${
                    d.active
                      ? "bg-[#0f9b81]/15 text-[#0f9b81]"
                      : "bg-[#1a1a1a]/10 text-[#502e23]/70"
                  }`}
                >
                  {d.active ? "ενεργό" : "ανενεργό"}
                </span>
                <span className="text-[#502e23]/70">{productIds.length} προϊόντα</span>
                <Edit className="h-4 w-4 text-[#502e23]/70" />
              </div>
            </Link>
          )
        })}

        {rows.length === 0 && (
          <div className="text-center text-[#502e23]/70 py-16 bg-white rounded-3xl border-2 border-dashed border-[#1a1a1a]/20">
            Δεν υπάρχουν drops. Φτιάξε το πρώτο για να εμφανίζεται στην αρχική.
          </div>
        )}
      </div>
    </div>
  )
}
