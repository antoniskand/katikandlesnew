"use client"

import { Suspense } from "react"
import Link from "next/link"
import { SignIn } from "@stackframe/stack"
import { Lock } from "lucide-react"
import { Logo } from "@/components/brand/logo"

function LoginForm() {
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
        <p className="text-[#502e23]/70 text-sm mb-6">μπες στο control panel</p>

        {/* Stack Auth pre-built sign-in form. Theme inherits parent styles. */}
        <SignIn />

        <p className="mt-6 text-xs text-[#502e23]/60">
          Μόνο εγκεκριμένα accounts μπορούν να έχουν πρόσβαση. Αν ο λογαριασμός σου
          δεν είναι admin, θα αποσυνδεθείς αυτόματα.
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={<div className="min-h-screen bg-[#f7e7ce]" />}
    >
      <LoginForm />
    </Suspense>
  )
}
