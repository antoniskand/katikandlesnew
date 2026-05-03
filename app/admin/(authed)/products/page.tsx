import Link from "next/link"
import Image from "next/image"
import { Plus, Edit, Eye, EyeOff } from "lucide-react"
import { getSupabaseServiceClient } from "@/lib/supabase-server"
import { AdminPageHeader } from "@/components/admin/page-header"
import { formatPrice } from "@/lib/utils"

export const dynamic = "force-dynamic"

export default async function ProductsAdmin() {
  const supabase = getSupabaseServiceClient()
  const { data: products } = await supabase
    .from("products")
    .select("id, name, slug, price, sale_price, images, stock_status, stock_level, active, created_at")
    .order("created_at", { ascending: false })

  return (
    <div>
      <AdminPageHeader
        eyebrow="catalog"
        title="Προϊόντα"
        actions={
          <Link href="/admin/products/new" className="kk-btn kk-btn-primary">
            <Plus className="h-4 w-4" />
            νέο
          </Link>
        }
      />

      <div
        className="bg-white border-2 border-[#1a1a1a] rounded-3xl overflow-hidden"
        style={{ boxShadow: "0 12px 28px -16px rgba(26, 18, 8, 0.25)" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#f7e7ce] border-b-2 border-[#1a1a1a]/10">
              <tr className="text-left text-[#502e23]/70 uppercase text-[10px] tracking-wider">
                <th className="px-4 py-3"></th>
                <th className="px-4 py-3">όνομα</th>
                <th className="px-4 py-3">τιμή</th>
                <th className="px-4 py-3">stock</th>
                <th className="px-4 py-3">status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {(products || []).map((p: any) => {
                const img = Array.isArray(p.images) && p.images.length > 0 ? p.images[0]?.url : null
                return (
                  <tr key={p.id} className="hover:bg-[#f7e7ce]/50">
                    <td className="px-4 py-3">
                      <div className="relative w-12 h-12 rounded-xl bg-[#f7e7ce] overflow-hidden">
                        {img && (
                          <Image src={img} alt={p.name} fill sizes="48px" className="object-cover" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-[#1a1a1a]">{p.name}</p>
                      <p className="text-xs text-[#502e23]/70">/{p.slug}</p>
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {p.sale_price ? (
                        <>
                          <span className="text-[#ff6b35]">{formatPrice(p.sale_price)}</span>
                          <span className="ml-2 text-xs line-through text-[#502e23]/70">{formatPrice(p.price)}</span>
                        </>
                      ) : (
                        formatPrice(p.price)
                      )}
                    </td>
                    <td className="px-4 py-3 text-[#502e23]/70">
                      {p.stock_level ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                          p.active
                            ? "bg-[#0f9b81]/15 text-[#0f9b81]"
                            : "bg-[#1a1a1a]/10 text-[#502e23]/70"
                        }`}
                      >
                        {p.active ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                        {p.active ? "ενεργό" : "ανενεργό"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/products/${p.id}`}
                        className="inline-flex items-center gap-1 text-[#ff6b35] hover:underline text-sm font-medium"
                      >
                        <Edit className="h-3.5 w-3.5" />
                        edit
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {(!products || products.length === 0) && (
            <div className="text-center text-[#502e23]/70 py-16">
              Δεν υπάρχουν προϊόντα. Πρόσθεσε το πρώτο σου.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
