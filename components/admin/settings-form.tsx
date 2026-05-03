"use client"

import { useState, useTransition } from "react"
import { Loader2, Save } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

interface Props {
  initial: Record<string, any>
}

export function SettingsForm({ initial }: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()

  const [shipping, setShipping] = useState({
    free_threshold: initial.shipping?.free_threshold ?? 30,
    courier_price: initial.shipping?.courier_price ?? 2,
    boxnow_price: initial.shipping?.boxnow_price ?? 2,
  })
  const [contact, setContact] = useState({
    email: initial.contact?.email ?? "hello@katikandles.gr",
    instagram: initial.contact?.instagram ?? "katikandles",
    tiktok: initial.contact?.tiktok ?? "katikandles",
  })
  const [hero, setHero] = useState({
    caption: initial.hero?.caption ?? "χειροποίητα αρωματικά σόγιας",
    headline: initial.hero?.headline ?? "smells like\nwhateverness",
  })

  const save = () => {
    startTransition(async () => {
      try {
        const updates = [
          { key: "shipping", value: shipping },
          { key: "contact", value: contact },
          { key: "hero", value: hero },
        ]
        for (const u of updates) {
          const res = await fetch("/api/admin/settings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(u),
          })
          if (!res.ok) throw new Error("save failed")
        }
        toast({ title: "Αποθηκεύτηκε ✿" })
        router.refresh()
      } catch (e: any) {
        toast({ title: "Σφάλμα", description: e.message, variant: "destructive" })
      }
    })
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6 max-w-5xl">
      <Card title="Αποστολές">
        <Field label="Όριο δωρεάν αποστολής (€)">
          <input
            type="number"
            className="kk-input"
            value={shipping.free_threshold}
            onChange={(e) => setShipping((s) => ({ ...s, free_threshold: parseFloat(e.target.value) || 0 }))}
          />
        </Field>
        <Field label="Τιμή Courier (€)">
          <input
            type="number"
            step="0.01"
            className="kk-input"
            value={shipping.courier_price}
            onChange={(e) => setShipping((s) => ({ ...s, courier_price: parseFloat(e.target.value) || 0 }))}
          />
        </Field>
        <Field label="Τιμή BoxNow (€)">
          <input
            type="number"
            step="0.01"
            className="kk-input"
            value={shipping.boxnow_price}
            onChange={(e) => setShipping((s) => ({ ...s, boxnow_price: parseFloat(e.target.value) || 0 }))}
          />
        </Field>
      </Card>

      <Card title="Επικοινωνία">
        <Field label="Email">
          <input type="email" className="kk-input" value={contact.email} onChange={(e) => setContact((s) => ({ ...s, email: e.target.value }))} />
        </Field>
        <Field label="Instagram handle">
          <input type="text" className="kk-input" value={contact.instagram} onChange={(e) => setContact((s) => ({ ...s, instagram: e.target.value }))} />
        </Field>
        <Field label="TikTok handle">
          <input type="text" className="kk-input" value={contact.tiktok} onChange={(e) => setContact((s) => ({ ...s, tiktok: e.target.value }))} />
        </Field>
      </Card>

      <Card title="Hero (αρχική)">
        <Field label="Caption">
          <input type="text" className="kk-input" value={hero.caption} onChange={(e) => setHero((s) => ({ ...s, caption: e.target.value }))} />
        </Field>
        <Field label="Headline (νέα γραμμή με \\n)">
          <textarea
            rows={3}
            className="kk-input kk-textarea"
            value={hero.headline}
            onChange={(e) => setHero((s) => ({ ...s, headline: e.target.value }))}
          />
        </Field>
      </Card>

      <div className="lg:col-span-2 flex justify-end">
        <button onClick={save} disabled={isPending} className="kk-btn kk-btn-primary disabled:opacity-60">
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          αποθήκευση όλων
        </button>
      </div>
    </div>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border-2 border-[#1a1a1a] rounded-3xl p-5" style={{ boxShadow: "0 12px 28px -16px rgba(26, 18, 8, 0.25)" }}>
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
