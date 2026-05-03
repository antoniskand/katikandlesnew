import Link from "next/link"
import Image from "next/image"
import { Plus, Edit, Eye, EyeOff } from "lucide-react"
import { desc } from "drizzle-orm"
import { db } from "@/lib/db"
import { products } from "@/lib/db/schema"
import { AdminPageHeader } from "@/components/admin/page-header"
import { formatPrice } from "@/lib/utils"

export const dynamic = "force-dynamic"

export default async function ProductsAdmin() {
  const rows = await db.select().from(products).orderBy(desc(products.createdAt))

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

      <div className="border-t border-[#1a1a1a]/12">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] tracking-[0.18em] uppercase text-[#1a1a1a]/45 border-b border-[#1a1a1a]/12">
                <th className="px-3 py-3 font-normal"></th>
                <th className="px-3 py-3 font-normal">όνομα</th>
                <th className="px-3 py-3 font-normal">τιμή</th>
                <th className="px-3 py-3 font-normal">stock</th>
                <th className="px-3 py-3 font-normal">status</th>
                <th className="px-3 py-3 font-normal"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a1a1a]/8">
              {rows.map((p) => {
                const imgs = p.images as { url?: string }[] | undefined
                const img = Array.isArray(imgs) && imgs.length > 0 ? imgs[0]?.url : null
                return (
                  <tr key={p.id} className="hover:bg-[#1a1a1a]/[0.02]">
                    <td className="px-3 py-3">
                      <div className="relative w-12 h-12 bg-[#f4eee2] overflow-hidden">
                        {img && (
                          <Image src={img} alt={p.name} fill sizes="48px" className="object-cover" />
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <p className="text-[#1a1a1a]">{p.name}</p>
                      <p className="text-xs text-[#1a1a1a]/50 mt-0.5">/{p.slug}</p>
                    </td>
                    <td className="px-3 py-3 tabular-nums text-[#1a1a1a]">
                      {p.salePrice ? (
                        <>
                          <span>{formatPrice(Number(p.salePrice))}</span>
                          <span className="ml-2 text-xs line-through text-[#1a1a1a]/40">
                            {formatPrice(Number(p.price))}
                          </span>
                        </>
                      ) : (
                        formatPrice(Number(p.price))
                      )}
                    </td>
                    <td className="px-3 py-3 tabular-nums text-[#1a1a1a]/70">
                      {p.stockLevel ?? "—"}
                    </td>
                    <td className="px-3 py-3">
                      <span className="inline-flex items-center gap-2 text-[10px] tracking-[0.14em] uppercase text-[#1a1a1a]/70">
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            p.active ? "bg-[#0f9b81]" : "bg-[#1a1a1a]/30"
                          }`}
                        />
                        {p.active ? "ενεργό" : "ανενεργό"}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <Link
                        href={`/admin/products/${p.id}`}
                        className="inline-flex items-center gap-1.5 text-xs tracking-[0.12em] uppercase text-[#1a1a1a]/70 hover:text-[#1a1a1a] border-b border-[#1a1a1a]/20 hover:border-[#1a1a1a] pb-0.5 transition-colors"
                      >
                        <Edit className="h-3 w-3" /> edit
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {rows.length === 0 && (
            <div className="text-center text-[#1a1a1a]/55 py-16">
              Δεν υπάρχουν προϊόντα. Πρόσθεσε το πρώτο σου.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
