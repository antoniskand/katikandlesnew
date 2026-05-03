// lib/supabase-server.ts
// Server-side Supabase clients with proper SSR cookie handling.

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { createClient as createServiceClient } from "@supabase/supabase-js"
import { cache } from "react"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function getSupabaseServerClient() {
  const cookieStore = await cookies()

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        } catch {
          // server component context — ignore
        }
      },
    },
  })
}

export const getSupabaseServiceClient = cache(() =>
  createServiceClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false },
  }),
)

export async function getCurrentUser() {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export async function getAdminUser() {
  const user = await getCurrentUser()
  if (!user) return null

  const service = getSupabaseServiceClient()
  const { data } = await service
    .from("admin_users")
    .select("*")
    .eq("id", user.id)
    .single()

  if (!data) return null
  return { ...data, email: user.email } as {
    id: string
    email: string
    role: "owner" | "admin" | "editor"
    display_name?: string
    created_at: string
  }
}

export async function requireAdmin() {
  const admin = await getAdminUser()
  if (!admin) throw new Error("UNAUTHORIZED")
  return admin
}
