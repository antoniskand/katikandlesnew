"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Trash2, Loader2, Save, Star } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface ProductOpt {
  id: string
  name: string
  images?: { url?: string }[] | any
}

interface DropFormProps {
  initial?: any
  products: ProductOpt[]
}

const COLORS = ["#ff5a36", "#1bb89a", "#ffc94d", "#6a1b9a", "#ffb4d4", "#1a1208"]

export function DropForm({ initial, products }: DropFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()

  const [form, setForm] = useState({
    name: initial?.name || "",
    slug: initial?.slug || "",
    tagline: initial?.tagline || "",
    description: initial?.description || "",
    badge_text: initial?.badge_text || "limited drop",
    starts_at: initial?.starts_at?.slice(0, 16) || "",
    ends_at: initial?.ends_at?.slice(0, 16) || "",
    hero_image_url: initial?.hero_image_url || "",
    background_color: initial?.background_color || "#ff5a36",
    active: initial?.active ?? true,
    featured: initial?.featured ?? false,
    product_ids: initial?.product_ids || [],
    sort_order: initial?.sort_order ?? 0,
  } as any)

  const update = (k: string, v: unknown) => setForm((f: any) => ({ ...f, [k]: v }))

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      try {
        const url = initial?.id ? `/api/admin/drops/${initial.id}` : "/api/admin/drops"
        const method = initial?.id ? "PUT" : "POST"
        const body = {
          ...form,
          starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : null,
          ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : null,
        }
        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err.error || "save failed")
        }
        toast({ title: "Αποθηκεύτηκε ✿" })
        router.push("/admin/drops")
        router.refresh()
      } catch (e: any) {
        toast({ title: "Σφάλμα", description: e.message, variant: "destructive" })
      }
    })
  }

  const remove = () => {
    if (!initial?.id || !confirm("Διαγραφή drop;")) return
    startTransition(async () => {
      const res = await fetch(`/api/admin/drops/${initial.id}`, { method: "DELETE" })
      if (!res.ok) {
        toast({ title: "Σφάλμα", variant: "destructive" })
        return
      }
      toast({ title: "Διαγράφηκε" })
      router.push("/admin/drops")
      router.refresh()
    })
  }

  return (
    <form onSubmit={submit} className="grid lg:grid-cols-3 gap-6 max-w-6xl">
      <div className="lg:col-span-2 space-y-5">
        <Card title="Βασικά">
          <Field label="Όνομα *">
            <input type="text" required className="kk-input" value={form.name} onChange={(e) => update("name", e.target.value)} />
          </Field>
          <Field label="Slug">
            <input type="text" className="kk-input" value={form.slug} onChange={(e) => update("slug", e.target.value)} placeholder="auto-generated" />
          </Field>
          <Field label="Tagline (font-light)">
            <input type="text" className="kk-input" value={form.tagline} onChange={(e) => update("tagline", e.target.value)} placeholder="πχ smells like spring" />
          </Field>
          <Field label="Badge text">
            <input type="text" className="kk-input" value={form.badge_text} onChange={(e) => update("badge_text", e.target.value)} />
          </Field>
          <Field label="Περιγραφή">
            <textarea rows={4} className="kk-input kk-textarea" value={form.description} onChange={(e) => update("description", e.target.value)} />
          </Field>
        </Card>

        <Card title="Διάρκεια">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Ξεκινάει">
              <input type="datetime-local" className="kk-input" value={form.starts_at} onChange={(e) => update("starts_at", e.target.value)} />
            </Field>
            <Field label="Λήγει">
              <input type="datetime-local" className="kk-input" value={form.ends_at} onChange={(e) => update("ends_at", e.target.value)} />
            </Field>
          </div>
          <p className="text-xs text-[#1a1a1a]/55">Άδεια = πάντα ενεργό</p>
        </Card>

        <Card title="Προϊόντα drop">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-96 overflow-y-auto">
            {products.map((p) => {
              const checked = form.product_ids.includes(p.id)
              const img = Array.isArray(p.images) ? p.images[0]?.url : null
              return (
                <label
                  key={p.id}
                  className={`flex flex-col gap-1 p-2  border-2 cursor-pointer transition-colors ${
                    checked ? "border-[#1a1a1a] bg-[#1a1a1a]/5" : "border-[#1a1a1a]/15 hover:border-[#1a1a1a]/40"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={checked}
                    onChange={(e) =>
                      update(
                        "product_ids",
                        e.target.checked
                          ? [...form.product_ids, p.id]
                          : form.product_ids.filter((id: string) => id !== p.id),
                      )
                    }
                  />
                  <div className="relative aspect-square  bg-[#f4eee2] overflow-hidden">
                    {img && <Image src={img} alt={p.name} fill sizes="100px" className="object-cover" />}
                  </div>
                  <span className="text-xs font-medium text-[#1a1a1a] line-clamp-2">{p.name}</span>
                </label>
              )
            })}
          </div>
        </Card>
      </div>

      <div className="space-y-5">
        <Card title="Status">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.active} onChange={(e) => update("active", e.target.checked)} className="w-5 h-5 accent-[#1a1a1a]" />
            <span className="font-medium">ενεργό</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.featured} onChange={(e) => update("featured", e.target.checked)} className="w-5 h-5 accent-[#1a1a1a]" />
            <span className="font-medium flex items-center gap-1">
              <Star className="h-4 w-4 text-[#1a1a1a]" /> featured (αρχική)
            </span>
          </label>
          <Field label="Σειρά">
            <input type="number" className="kk-input" value={form.sort_order} onChange={(e) => update("sort_order", parseInt(e.target.value) || 0)} />
          </Field>
        </Card>

        <Card title="Visual">
          <Field label="Hero image URL">
            <input type="text" className="kk-input" value={form.hero_image_url} onChange={(e) => update("hero_image_url", e.target.value)} placeholder="https://..." />
          </Field>
          <Field label="Background color">
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => update("background_color", c)}
                  className={`w-9 h-9  border-2 ${
                    form.background_color === c ? "border-[#1a1a1a] scale-110" : "border-[#1a1a1a]/20"
                  }`}
                  style={{ background: c }}
                  aria-label={c}
                />
              ))}
            </div>
            <input
              type="text"
              className="kk-input mt-2 text-xs"
              value={form.background_color}
              onChange={(e) => update("background_color", e.target.value)}
            />
          </Field>
        </Card>
      </div>

      <div className="lg:col-span-3 flex items-center justify-between gap-3 pt-2">
        {initial?.id && (
          <button
            type="button"
            onClick={remove}
            disabled={isPending}
            className="text-destructive font-medium text-sm flex items-center gap-2 hover:underline"
          >
            <Trash2 className="h-4 w-4" /> διαγραφή
          </button>
        )}
        <div className="ml-auto">
          <button type="submit" disabled={isPending} className="kk-btn kk-btn-primary disabled:opacity-60">
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            αποθήκευση
          </button>
        </div>
      </div>
    </form>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-transparent">
      <h3 className="text-[11px] tracking-[0.22em] uppercase text-[#1a1a1a]/50 mb-4">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="caption text-[#1a1a1a]/55 mb-1.5 block">{label}</span>
      {children}
    </label>
  )
}
