import { desc } from "drizzle-orm"
import { db } from "@/lib/db"
import { newsletterSubscribers } from "@/lib/db/schema"
import { AdminPageHeader } from "@/components/admin/page-header"
import { Download } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function SubscribersAdmin() {
  const subs = await db
    .select()
    .from(newsletterSubscribers)
    .orderBy(desc(newsletterSubscribers.subscribedAt))

  return (
    <div>
      <AdminPageHeader
        eyebrow="newsletter"
        title="Subscribers"
        actions={
          <a
            href="/api/admin/export-subscribers"
            className="kk-btn kk-btn-secondary"
            download
          >
            <Download className="h-4 w-4" /> CSV
          </a>
        }
      />

      <div className="border-t border-[#1a1a1a]/12 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[10px] tracking-[0.18em] uppercase text-[#1a1a1a]/45 border-b border-[#1a1a1a]/12">
              <th className="px-3 py-3 font-normal">email</th>
              <th className="px-3 py-3 font-normal">status</th>
              <th className="px-3 py-3 font-normal">source</th>
              <th className="px-3 py-3 font-normal">date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1a1a1a]/8">
            {subs.map((s) => (
              <tr key={s.id} className="hover:bg-[#1a1a1a]/[0.02]">
                <td className="px-3 py-3 text-[#1a1a1a]">{s.email}</td>
                <td className="px-3 py-3">
                  <span className="inline-flex items-center gap-2 text-[10px] tracking-[0.14em] uppercase text-[#1a1a1a]/70">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        s.status === "active" ? "bg-[#0f9b81]" : "bg-[#1a1a1a]/30"
                      }`}
                    />
                    {s.status}
                  </span>
                </td>
                <td className="px-3 py-3 text-[#1a1a1a]/55">{s.source || "—"}</td>
                <td className="px-3 py-3 text-[#1a1a1a]/55 tabular-nums">
                  {s.subscribedAt instanceof Date
                    ? s.subscribedAt.toLocaleDateString("el-GR")
                    : ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {subs.length === 0 && (
          <p className="text-center text-[#1a1a1a]/55 py-12">Καμία εγγραφή.</p>
        )}
      </div>
    </div>
  )
}
