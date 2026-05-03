import { getSupabaseServiceClient } from "@/lib/supabase-server"
import { AdminPageHeader } from "@/components/admin/page-header"
import { Download } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function SubscribersAdmin() {
  const supabase = getSupabaseServiceClient()
  const { data: subs } = await supabase
    .from("newsletter_subscribers")
    .select("*")
    .order("subscribed_at", { ascending: false })

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

      <div
        className="bg-white border-2 border-[#1a1a1a] rounded-3xl overflow-hidden"
        style={{ boxShadow: "0 12px 28px -16px rgba(26, 18, 8, 0.25)" }}
      >
        <table className="w-full text-sm">
          <thead className="bg-[#f7e7ce] border-b-2 border-[#1a1a1a]/10">
            <tr className="text-left text-[#502e23]/70 uppercase text-[10px] tracking-wider">
              <th className="px-4 py-3">email</th>
              <th className="px-4 py-3">status</th>
              <th className="px-4 py-3">source</th>
              <th className="px-4 py-3">date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/5">
            {(subs || []).map((s: any) => (
              <tr key={s.id} className="hover:bg-[#f7e7ce]/50">
                <td className="px-4 py-3 font-medium">{s.email}</td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${
                      s.status === "active"
                        ? "bg-[#0f9b81]/15 text-[#0f9b81]"
                        : "bg-[#1a1a1a]/10 text-[#502e23]/70"
                    }`}
                  >
                    {s.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-[#502e23]/70">{s.source || "—"}</td>
                <td className="px-4 py-3 text-[#502e23]/70">
                  {new Date(s.subscribed_at).toLocaleDateString("el-GR")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!subs || subs.length === 0) && (
          <p className="text-center text-[#502e23]/70 py-12">Καμία εγγραφή.</p>
        )}
      </div>
    </div>
  )
}
