"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Trash2, GripVertical, Upload, Loader2, Save } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface Category {
  id: string
  name: string
  slug: string
}

interface ProductFormProps {
  initial?: {
    id?: string
    name?: string
    slug?: string
    description?: string
    price?: number
    sale_price?: number | null
    currency?: string
    images?: { url: string; alt?: string }[]
    stock_status?: string
    stock_level?: number
    stock_tracking?: boolean
    active?: boolean
    categoryIds?: string[]
  }
  categories: Category[]
}

export function ProductForm({ initial, categories }: ProductFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [uploading, setUploading] = useState(false)

  const [form, setForm] = useState({
    name: initial?.name || "",
    slug: initial?.slug || "",
    description: initial?.description || "",
    price: initial?.price ?? 0,
    sale_price: initial?.sale_price ?? null,
    currency: initial?.currency || "EUR",
    images: initial?.images || [],
    stock_status: initial?.stock_status || "in_stock",
    stock_level: initial?.stock_level ?? 0,
    stock_tracking: initial?.stock_tracking ?? false,
    active: initial?.active ?? true,
    categoryIds: initial?.categoryIds || [],
  } as any)

  const update = (k: string, v: unknown) => setForm((f: any) => ({ ...f, [k]: v }))

  const handleImageUpload = async (files: FileList | null) => {
    if (!files?.length) return
    setUploading(true)
    try {
      const newImages = []
      for (const file of Array.from(files)) {
        const fd = new FormData()
        fd.set("file", file)
        const res = await fetch("/api/admin/upload", { method: "POST", body: fd })
        if (!res.ok) throw new Error("upload failed")
        const data = await res.json()
        newImages.push({ url: data.url, alt: file.name })
      }
      update("images", [...form.images, ...newImages])
    } catch (e: any) {
      toast({ title: "Σφάλμα upload", description: e.message, variant: "destructive" })
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (idx: number) => {
    update(
      "images",
      form.images.filter((_: any, i: number) => i !== idx),
    )
  }

  const moveImage = (idx: number, dir: -1 | 1) => {
    const next = [...form.images]
    const target = idx + dir
    if (target < 0 || target >= next.length) return
    ;[next[idx], next[target]] = [next[target], next[idx]]
    update("images", next)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      try {
        const url = initial?.id ? `/api/admin/products/${initial.id}` : "/api/admin/products"
        const method = initial?.id ? "PUT" : "POST"
        const { categoryIds, ...rest } = form
        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...rest, categories: categoryIds }),
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err.error || "save failed")
        }
        toast({ title: "Αποθηκεύτηκε ✿" })
        router.push("/admin/products")
        router.refresh()
      } catch (e: any) {
        toast({ title: "Σφάλμα", description: e.message, variant: "destructive" })
      }
    })
  }

  const handleDelete = () => {
    if (!initial?.id) return
    if (!confirm("Διαγραφή προϊόντος; Αυτή η ενέργεια δεν αναιρείται.")) return
    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/products/${initial.id}`, { method: "DELETE" })
        if (!res.ok) throw new Error("delete failed")
        toast({ title: "Διαγράφηκε" })
        router.push("/admin/products")
        router.refresh()
      } catch (e: any) {
        toast({ title: "Σφάλμα", description: e.message, variant: "destructive" })
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6 max-w-6xl">
      <div className="lg:col-span-2 space-y-5">
        <Card title="Βασικά">
          <Field label="Όνομα *">
            <input
              type="text"
              required
              className="kk-input"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
            />
          </Field>
          <Field label="Slug">
            <input
              type="text"
              className="kk-input"
              value={form.slug}
              onChange={(e) => update("slug", e.target.value)}
              placeholder="auto-generated αν αφεθεί κενό"
            />
          </Field>
          <Field label="Περιγραφή (HTML)">
            <textarea
              rows={6}
              className="kk-input kk-textarea"
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
            />
          </Field>
        </Card>

        <Card title="Εικόνες">
          {form.images.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-3">
              {form.images.map((img: any, i: number) => (
                <div key={i} className="relative group rounded-2xl border-2 border-[#1a1a1a]/10 overflow-hidden aspect-square bg-[#f7e7ce]">
                  <Image src={img.url} alt={img.alt || ""} fill sizes="120px" className="object-cover" />
                  <div className="absolute inset-0 bg-[#1a1a1a]/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveImage(i, -1)}
                      className="p-1.5 rounded-full bg-white/90 hover:bg-white"
                      aria-label="Μετακίνηση πάνω"
                    >
                      <GripVertical className="h-3.5 w-3.5 text-[#1a1a1a]" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="p-1.5 rounded-full bg-destructive/90 hover:bg-destructive text-white"
                      aria-label="Διαγραφή"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  {i === 0 && (
                    <span className="absolute top-1.5 left-1.5 bg-[#1a1a1a] text-white text-[9px] tracking-[0.14em] uppercase py-0.5 px-1.5">
                      cover
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
          <label className="kk-btn kk-btn-secondary cursor-pointer w-fit">
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            ανέβασε εικόνες
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleImageUpload(e.target.files)}
              className="hidden"
            />
          </label>
        </Card>
      </div>

      <div className="space-y-5">
        <Card title="Status">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => update("active", e.target.checked)}
              className="w-5 h-5 accent-[#ff6b35]"
            />
            <span className="font-medium">ενεργό</span>
          </label>
        </Card>

        <Card title="Τιμή">
          <Field label="Τιμή (€) *">
            <input
              type="number"
              step="0.01"
              required
              className="kk-input"
              value={form.price}
              onChange={(e) => update("price", parseFloat(e.target.value) || 0)}
            />
          </Field>
          <Field label="Sale Price (€)">
            <input
              type="number"
              step="0.01"
              className="kk-input"
              value={form.sale_price ?? ""}
              onChange={(e) => update("sale_price", e.target.value ? parseFloat(e.target.value) : null)}
            />
          </Field>
        </Card>

        <Card title="Stock">
          <label className="flex items-center gap-3 mb-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.stock_tracking}
              onChange={(e) => update("stock_tracking", e.target.checked)}
              className="w-5 h-5 accent-[#ff6b35]"
            />
            <span className="font-medium">παρακολούθηση</span>
          </label>
          <Field label="Διαθέσιμο">
            <input
              type="number"
              className="kk-input"
              value={form.stock_level}
              onChange={(e) => update("stock_level", parseInt(e.target.value) || 0)}
              disabled={!form.stock_tracking}
            />
          </Field>
          <Field label="Status">
            <select
              className="kk-input"
              value={form.stock_status}
              onChange={(e) => update("stock_status", e.target.value)}
            >
              <option value="in_stock">in stock</option>
              <option value="low_stock">low stock</option>
              <option value="out_of_stock">out of stock</option>
            </select>
          </Field>
        </Card>

        <Card title="Κατηγορίες">
          <div className="space-y-2">
            {categories.map((c) => (
              <label key={c.id} className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-[#ff6b35]"
                  checked={form.categoryIds.includes(c.id)}
                  onChange={(e) => {
                    update(
                      "categoryIds",
                      e.target.checked
                        ? [...form.categoryIds, c.id]
                        : form.categoryIds.filter((id: string) => id !== c.id),
                    )
                  }}
                />
                {c.name}
              </label>
            ))}
          </div>
        </Card>
      </div>

      <div className="lg:col-span-3 flex items-center justify-between gap-3 pt-2">
        {initial?.id && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="text-destructive font-medium text-sm flex items-center gap-2 hover:underline"
          >
            <Trash2 className="h-4 w-4" /> διαγραφή προϊόντος
          </button>
        )}
        <div className="ml-auto flex gap-2">
          <button
            type="submit"
            disabled={isPending}
            className="kk-btn kk-btn-primary disabled:opacity-60"
          >
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
    <div
      className="bg-white border-2 border-[#1a1a1a] rounded-3xl p-5"
      style={{ boxShadow: "0 12px 28px -16px rgba(26, 18, 8, 0.25)" }}
    >
      <h3 className="font-heading font-bold text-lg mb-4">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="caption text-[#502e23]/70 mb-1.5 block">{label}</span>
      {children}
    </label>
  )
}
