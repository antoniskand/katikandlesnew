import Link from "next/link"
import { Plus, FileText } from "lucide-react"
import { asc } from "drizzle-orm"
import { db } from "@/lib/db"
import { pages } from "@/lib/db/schema"
import { AdminPageHeader } from "@/components/admin/page-header"

export const dynamic = "force-dynamic"

export default async function PagesAdmin() {
  const rows = await db.select().from(pages).orderBy(asc(pages.name))

  return (
    <div>
      <AdminPageHeader
        eyebrow="cms"
        title="Σελίδες"
        actions={
          <Link href="/admin/pages/new" className="kk-btn kk-btn-primary">
            <Plus className="h-4 w-4" /> νέα σελίδα
          </Link>
        }
      />

      <div className="grid gap-3">
        {rows.map((p) => (
          <Link
            key={p.id}
            href={`/admin/pages/${p.id}`}
            className="bg-white border-2 border-[#1a1a1a] rounded-3xl p-5 flex items-center gap-4 hover:translate-x-[-2px] hover:translate-y-[-2px] transition-transform"
            style={{ boxShadow: "0 12px 28px -16px rgba(26, 18, 8, 0.25)" }}
          >
            <div className="p-3 rounded-2xl bg-[#ffc107] border-2 border-[#1a1a1a]">
              <FileText className="h-5 w-5 text-[#1a1a1a]" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-heading font-bold text-lg truncate">{p.name}</h3>
              <p className="text-sm text-[#502e23]/70">/{p.slug}</p>
            </div>
            <span
              className={`text-xs font-medium px-2 py-1 rounded-full ${
                p.active
                  ? "bg-[#0f9b81]/15 text-[#0f9b81]"
                  : "bg-[#1a1a1a]/10 text-[#502e23]/70"
              }`}
            >
              {p.active ? "δημοσιευμένη" : "πρόχειρο"}
            </span>
          </Link>
        ))}

        {rows.length === 0 && (
          <div className="text-center text-[#502e23]/70 py-16 bg-white rounded-3xl border-2 border-dashed border-[#1a1a1a]/20">
            Δεν υπάρχουν σελίδες ακόμη.
          </div>
        )}
      </div>
    </div>
  )
}
