"use client"

import { Suspense, useState, useTransition } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Loader2, Mail, CheckCircle2, AlertCircle } from "lucide-react"
import { Logo } from "@/components/brand/logo"
import { sendMagicLinkAction } from "./actions"

function LoginForm() {
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
    <div className="min-h-screen flex items-center justify-center bg-[#f7e7ce] p-6">
      <div
        className="w-full max-w-md bg-white border-2 border-[#1a1a1a] rounded-3xl p-8"
        style={{ boxShadow: "0 12px 28px -16px rgba(26, 18, 8, 0.25)" }}
      >
        <Link
          href="/"
          className="text-[#1a1a1a] inline-block mb-6"
          aria-label="Kati Kandles"
        >
          <Logo size="md" />
        </Link>

        <div className="caption text-[#ff6b35] mb-2">admin</div>

        {status === "sent" ? (
          <>
            <h1 className="headline-md text-[#1a1a1a] text-3xl mb-2">
              <CheckCircle2 className="inline h-6 w-6 mr-2 -mt-1 text-[#0f9b81]" />
              έλεγξε το email
            </h1>
            <p className="text-[#502e23]/85 leading-relaxed">
              Αν το email σου είναι εγκεκριμένο, σου στείλαμε σύνδεσμο εισόδου.
              Ισχύει για 24 ώρες — δεν χρειάζεσαι κωδικό.
            </p>
            <button
              type="button"
              onClick={() => {
                setStatus("idle")
                setEmail("")
              }}
              className="mt-6 text-sm text-[#502e23]/70 hover:text-[#1a1a1a] underline"
            >
              στείλε σε άλλο email
            </button>
          </>
        ) : (
          <>
            <h1 className="headline-md text-[#1a1a1a] text-3xl mb-1">
              <Mail className="inline h-6 w-6 mr-2 -mt-1" />
              σύνδεση
            </h1>
            <p className="text-[#502e23]/70 text-sm mb-7">
              Δώσε το email σου · θα σου στείλουμε σύνδεσμο εισόδου.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block">
                <span className="caption text-[#502e23]/70 mb-1.5 block">email</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="kk-input"
                  autoComplete="email"
                  placeholder="you@example.com"
                />
              </label>

              {error && (
                <p className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-2xl p-3 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </p>
              )}

              <button
                type="submit"
                disabled={isPending || !email}
                className="kk-btn kk-btn-primary w-full disabled:opacity-60"
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

            <p className="mt-6 text-xs text-[#502e23]/60">
              Μόνο εγκεκριμένα emails λαμβάνουν σύνδεσμο. Αν δεν είσαι admin,
              δεν θα σταλεί τίποτα.
            </p>
          </>
        )}
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f7e7ce]" />}>
      <LoginForm />
    </Suspense>
  )
}
