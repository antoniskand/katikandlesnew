// Server-component shell — redirects to /admin if already signed in,
// otherwise renders the (client) form.
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { LoginForm } from "./login-form"

export const dynamic = "force-dynamic"

export default async function LoginPage() {
  const session = await auth()
  if (session?.user) {
    redirect("/admin")
  }
  return <LoginForm />
}
