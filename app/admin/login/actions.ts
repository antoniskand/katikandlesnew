"use server"

import { signIn, signOut } from "@/auth"

/** Trigger NextAuth's Resend provider to send a magic link. */
export async function sendMagicLinkAction(formData: FormData) {
  const email = String(formData.get("email") || "").toLowerCase().trim()
  if (!email) return { error: "Δώσε email." }

  try {
    await signIn("resend", {
      email,
      redirect: false,
    })
    return { ok: true as const }
  } catch (e: any) {
    console.error("sendMagicLink error:", e)
    return { error: "Δεν ήταν δυνατή η αποστολή. Δοκίμασε ξανά σε λίγο." }
  }
}

export async function signOutAction() {
  await signOut({ redirect: false })
}
