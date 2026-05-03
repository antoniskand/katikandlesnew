"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Trash2, Loader2, Save } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { RichEditor } from "@/components/admin/rich-editor"

interface PageFormProps {
  initial?: any
}

export function PageForm({ initial }: PageFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()

  const [form, setForm] = useState({
    name: initial?.name || "",
    slug: initial?.slug || "",
    content: initial?.content || "",
    meta_description: initial?.meta_description || "",
    active: initial?.active ?? true,
  } as any)

  const update = (k: string, v: unknown) => setForm((f: any) => ({ ...f, [k]: v }))

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      try {
        const url = initial?.id ? `/api/admin/pages/${initial.id}` : "/api/admin/pages"
        const method = initial?.id ? "PUT" : "POST"
        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err.error || "save failed")
        }
        toast({ title: "Αποθηκεύτηκε ✿" })
        router.push("/admin/pages")
        router.refresh()
      } catch (e: any) {
        toast({ title: "Σφάλμα", description: e.message, variant: "destructive" })
      }
    })
  }

  const remove = () => {
    if (!initial?.id || !confirm("Διαγραφή σελίδας;")) return
    startTransition(async () => {
      const res = await fetch(`/api/admin/pages/${initial.id}`, { method: "DELETE" })
      if (!res.ok) {
        toast({ title: "Σφάλμα", variant: "destructive" })
        return
      }
      toast({ title: "Διαγράφηκε" })
      router.push("/admin/pages")
      router.refresh()
    })
  }

  return (
    <form onSubmit={submit} className="grid lg:grid-cols-3 gap-6 max-w-6xl">
      <div className="lg:col-span-2 space-y-5">
        <Card title="Περιεχόμενο">
          <Field label="Τίτλος *">
            <input type="text" required className="kk-input" value={form.name} onChange={(e) => update("name", e.target.value)} />
          </Field>
          <Field label="Slug">
            <input type="text" className="kk-input" value={form.slug} onChange={(e) => update("slug", e.target.value)} />
          </Field>
          <Field label="Σώμα κειμένου">
            <RichEditor value={form.content} onChange={(html) => update("content", html)} />
          </Field>
        </Card>
      </div>

      <div className="space-y-5">
        <Card title="Status">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.active} onChange={(e) => update("active", e.target.checked)} className="w-5 h-5 accent-[#1a1a1a]" />
            <span className="font-medium">δημοσιευμένη</span>
          </label>
        </Card>

        <Card title="SEO">
          <Field label="Meta description">
            <textarea
              rows={3}
              maxLength={160}
              className="kk-input kk-textarea"
              value={form.meta_description}
              onChange={(e) => update("meta_description", e.target.value)}
              placeholder="μέχρι 160 χαρακτήρες"
            />
            <span className="text-xs text-[#1a1a1a]/55 mt-1 block">
              {form.meta_description.length}/160
            </span>
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
