"use client"

import { Suspense, useState, useTransition } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Loader2, Mail, CheckCircle2, AlertCircle } from "lucide-react"
import { Logo } from "@/components/brand/logo"
import { sendMagicLinkAction } from "./actions"

function LoginFormInner() {
  const searchParams = useSearchParams()
  const checkEmail = searchParams.get("check") === "email"

  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "sent" | "error">(
    checkEmail ? "sent" : "idle",
  )
  const [error, setError] = useState("")
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    startTransition(async () => {
      const fd = new FormData()
      fd.set("email", email)
      const result = await sendMagicLinkAction(fd)
      if (result?.error) {
        setError(result.error)
        setStatus("error")
        return
      }
      setStatus("sent")
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafaf7] p-6">
      <div className="w-full max-w-md bg-white border border-[#1a1a1a]/10 p-10">
        <Link
          href="/"
          className="text-[#1a1a1a] inline-block mb-10"
          aria-label="Kati Kandles"
        >
          <Logo size="md" />
        </Link>

        <p className="text-[11px] tracking-[0.2em] uppercase text-[#1a1a1a]/50 mb-3">admin</p>

        {status === "sent" ? (
          <>
            <h1 className="headline-md text-[#1a1a1a] text-3xl mb-3">έλεγξε το email</h1>
            <p className="text-[#1a1a1a]/65 leading-relaxed text-sm">
              <CheckCircle2 className="inline h-4 w-4 mr-1.5 -mt-0.5 text-[#0f9b81]" />
              Αν το email σου είναι εγκεκριμένο, σου στείλαμε σύνδεσμο εισόδου.
              Ισχύει για 24 ώρες — δεν χρειάζεσαι κωδικό.
            </p>
            <button
              type="button"
              onClick={() => {
                setStatus("idle")
                setEmail("")
              }}
              className="mt-8 text-xs tracking-[0.12em] uppercase text-[#1a1a1a]/60 hover:text-[#1a1a1a] border-b border-[#1a1a1a]/20 hover:border-[#1a1a1a] pb-0.5 transition-colors"
            >
              στείλε σε άλλο email
            </button>
          </>
        ) : (
          <>
            <h1 className="headline-md text-[#1a1a1a] text-3xl mb-2">σύνδεση</h1>
            <p className="text-[#1a1a1a]/65 text-sm mb-8">
              Δώσε το email σου · θα σου στείλουμε σύνδεσμο εισόδου.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <label className="block">
                <span className="text-[11px] tracking-[0.2em] uppercase text-[#1a1a1a]/50 mb-2 block">
                  email
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-0 py-2 bg-transparent border-0 border-b border-[#1a1a1a]/20 focus:border-[#1a1a1a] focus:outline-none text-[#1a1a1a] placeholder-[#1a1a1a]/30 transition-colors"
                  autoComplete="email"
                  placeholder="you@example.com"
                />
              </label>

              {error && (
                <p className="text-sm text-destructive flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </p>
              )}

              <button
                type="submit"
                disabled={isPending || !email}
                className="w-full inline-flex items-center justify-center gap-2 bg-[#1a1a1a] text-white px-6 py-3 text-sm tracking-[0.04em] hover:bg-[#1a1a1a]/85 disabled:opacity-50 transition-colors"
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Mail className="h-4 w-4" />
                    στείλε μου σύνδεσμο
                  </>
                )}
              </button>
            </form>

            <p className="mt-8 text-xs text-[#1a1a1a]/50 leading-relaxed">
              Μόνο εγκεκριμένα emails λαμβάνουν σύνδεσμο. Αν δεν είσαι admin,
              δεν θα σταλεί τίποτα.
            </p>
          </>
        )}
      </div>
    </div>
  )
}

export function LoginForm() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#fafaf7]" />}>
      <LoginFormInner />
    </Suspense>
  )
}
