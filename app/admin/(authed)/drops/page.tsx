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

      <div className="border-t border-[#1a1a1a]/12">
        {rows.map((d) => {
          const productIds = Array.isArray(d.productIds) ? (d.productIds as string[]) : []
          return (
            <Link
              key={d.id}
              href={`/admin/drops/${d.id}`}
              className="grid grid-cols-[3.5rem_1fr_auto] gap-4 items-center py-5 border-b border-[#1a1a1a]/12 hover:bg-[#1a1a1a]/[0.02] px-2 -mx-2 transition-colors"
            >
              <div
                className="w-14 h-14 border border-[#1a1a1a]/15"
                style={{ background: d.backgroundColor || "#1a1a1a" }}
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg tracking-tight text-[#1a1a1a] truncate">{d.name}</h3>
                  {d.featured && <Star className="h-3.5 w-3.5 fill-[#1a1a1a] text-[#1a1a1a]" />}
                </div>
                <p className="text-xs text-[#1a1a1a]/50 mt-0.5">/{d.slug}</p>
              </div>
              <div className="flex items-center gap-5 text-xs">
                <span className="inline-flex items-center gap-2 text-[10px] tracking-[0.14em] uppercase text-[#1a1a1a]/70">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      d.active ? "bg-[#0f9b81]" : "bg-[#1a1a1a]/30"
                    }`}
                  />
                  {d.active ? "ενεργό" : "ανενεργό"}
                </span>
                <span className="text-[#1a1a1a]/55 tabular-nums">
                  {productIds.length} προϊόντα
                </span>
                <Edit className="h-3.5 w-3.5 text-[#1a1a1a]/40" />
              </div>
            </Link>
          )
        })}

        {rows.length === 0 && (
          <div className="text-center text-[#1a1a1a]/55 py-16">
            Δεν υπάρχουν drops. Φτιάξε το πρώτο για να εμφανίζεται στην αρχική.
          </div>
        )}
      </div>
    </div>
  )
}
