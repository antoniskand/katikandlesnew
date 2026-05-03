"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2, Loader2, Save, Edit3, X } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export interface CrudColumn {
  key: string
  label: string
  type?: "text" | "number" | "checkbox" | "select"
  required?: boolean
  options?: { value: string; label: string }[]
  placeholder?: string
  hideInList?: boolean
  render?: (value: any, row: any) => React.ReactNode
}

interface Props {
  endpoint: string // e.g. /api/admin/categories
  rows: any[]
  columns: CrudColumn[]
  newDefaults?: Record<string, unknown>
  itemNoun: string
}

export function SimpleCrudList({ endpoint, rows, columns, newDefaults = {}, itemNoun }: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const [editing, setEditing] = useState<any | null>(null)
  const [creating, setCreating] = useState(false)
  const [isPending, startTransition] = useTransition()

  const save = (data: any) => {
    startTransition(async () => {
      try {
        const url = data.id ? `${endpoint}/${data.id}` : endpoint
        const method = data.id ? "PUT" : "POST"
        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })
        if (!res.ok) throw new Error("save failed")
        toast({ title: "Αποθηκεύτηκε ✿" })
        setEditing(null)
        setCreating(false)
        router.refresh()
      } catch (e: any) {
        toast({ title: "Σφάλμα", description: e.message, variant: "destructive" })
      }
    })
  }

  const remove = (id: string) => {
    if (!confirm(`Διαγραφή ${itemNoun};`)) return
    startTransition(async () => {
      const res = await fetch(`${endpoint}/${id}`, { method: "DELETE" })
      if (!res.ok) {
        toast({ title: "Σφάλμα", variant: "destructive" })
        return
      }
      toast({ title: "Διαγράφηκε" })
      router.refresh()
    })
  }

  const visibleCols = columns.filter((c) => !c.hideInList)

  return (
    <div>
      <div className="mb-5 flex justify-end">
        <button
          onClick={() => setCreating(true)}
          className="kk-btn kk-btn-primary"
        >
          <Plus className="h-4 w-4" /> νέο
        </button>
      </div>

      <div
        className="bg-white border-2 border-[#1a1a1a] rounded-3xl overflow-hidden"
        style={{ boxShadow: "0 12px 28px -16px rgba(26, 18, 8, 0.25)" }}
      >
        <table className="w-full text-sm">
          <thead className="bg-[#f7e7ce] border-b-2 border-[#1a1a1a]/10">
            <tr className="text-left text-[#502e23]/70 uppercase text-[10px] tracking-wider">
              {visibleCols.map((c) => (
                <th key={c.key} className="px-4 py-3">{c.label}</th>
              ))}
              <th className="px-4 py-3 text-right">actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/5">
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-[#f7e7ce]/50">
                {visibleCols.map((c) => (
                  <td key={c.key} className="px-4 py-3">
                    {c.render
                      ? c.render(row[c.key], row)
                      : c.type === "checkbox"
                      ? row[c.key] ? "✓" : "—"
                      : row[c.key] ?? "—"}
                  </td>
                ))}
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => setEditing(row)}
                    className="text-[#ff6b35] hover:underline text-sm font-medium mr-3"
                  >
                    <Edit3 className="inline h-3.5 w-3.5 mr-1" /> edit
                  </button>
                  <button
                    onClick={() => remove(row.id)}
                    className="text-destructive hover:underline text-sm font-medium"
                  >
                    <Trash2 className="inline h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <p className="text-center text-[#502e23]/70 py-12">καμία εγγραφή</p>}
      </div>

      {(editing || creating) && (
        <Modal
          title={editing ? `Επεξεργασία ${itemNoun}` : `Νέο ${itemNoun}`}
          onClose={() => {
            setEditing(null)
            setCreating(false)
          }}
        >
          <CrudForm
            initial={editing || newDefaults}
            columns={columns}
            onSave={save}
            isPending={isPending}
          />
        </Modal>
      )}
    </div>
  )
}

function CrudForm({
  initial,
  columns,
  onSave,
  isPending,
}: {
  initial: any
  columns: CrudColumn[]
  onSave: (data: any) => void
  isPending: boolean
}) {
  const [data, setData] = useState<any>({ ...initial })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(data)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {columns.map((c) => (
        <label key={c.key} className="block">
          <span className="caption text-[#502e23]/70 mb-1.5 block">
            {c.label} {c.required && "*"}
          </span>
          {c.type === "checkbox" ? (
            <input
              type="checkbox"
              checked={!!data[c.key]}
              onChange={(e) => setData({ ...data, [c.key]: e.target.checked })}
              className="w-5 h-5 accent-[#ff6b35]"
            />
          ) : c.type === "select" ? (
            <select
              className="kk-input"
              value={data[c.key] ?? ""}
              onChange={(e) => setData({ ...data, [c.key]: e.target.value })}
            >
              {c.options?.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          ) : (
            <input
              type={c.type || "text"}
              required={c.required}
              placeholder={c.placeholder}
              className="kk-input"
              step={c.type === "number" ? "any" : undefined}
              value={data[c.key] ?? ""}
              onChange={(e) =>
                setData({
                  ...data,
                  [c.key]: c.type === "number" ? (e.target.value ? Number(e.target.value) : null) : e.target.value,
                })
              }
            />
          )}
        </label>
      ))}

      <button type="submit" disabled={isPending} className="kk-btn kk-btn-primary w-full disabled:opacity-60">
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        αποθήκευση
      </button>
    </form>
  )
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string
  children: React.ReactNode
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1a1a1a]/50 backdrop-blur-sm">
      <div
        className="bg-white border-2 border-[#1a1a1a] rounded-3xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
        style={{ boxShadow: "0 12px 28px -16px rgba(26, 18, 8, 0.25)" }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-heading font-bold text-xl">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#f7e7ce]"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
