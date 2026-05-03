"use server"

import { signIn } from "@/auth"

export async function loginAction(formData: FormData) {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    })
    return { ok: true as const }
  } catch (e: any) {
    // NextAuth throws CredentialsSignin / CallbackRouteError
    const msg =
      e?.type === "CredentialsSignin"
        ? "Λάθος email ή κωδικός."
        : "Δεν ήταν δυνατή η σύνδεση. Δοκίμασε ξανά."
    return { error: msg }
  }
}

export async function signOutAction() {
  const { signOut } = await import("@/auth")
  await signOut({ redirect: false })
}
