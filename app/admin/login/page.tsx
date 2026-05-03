"use client"

import { Suspense, useState, useTransition } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2, Lock } from "lucide-react"
import { Logo } from "@/components/brand/logo"
import { loginAction } from "./actions"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get("next") || "/admin"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    startTransition(async () => {
      const fd = new FormData()
      fd.set("email", email)
      fd.set("password", password)
      fd.set("redirectTo", next)
      const result = await loginAction(fd)
      if (result?.error) {
        setError(result.error)
        return
      }
      router.replace(next)
      router.refresh()
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
        <h1 className="headline-md text-[#1a1a1a] text-3xl mb-1">
          <Lock className="inline h-6 w-6 mr-2 -mt-1" />
          είσοδος
        </h1>
        <p className="text-[#502e23]/70 text-sm mb-7">μπες στο control panel</p>

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
            />
          </label>

          <label className="block">
            <span className="caption text-[#502e23]/70 mb-1.5 block">password</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="kk-input"
              autoComplete="current-password"
            />
          </label>

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-2xl p-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="kk-btn kk-btn-primary w-full disabled:opacity-60"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "είσοδος"}
          </button>
        </form>
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
