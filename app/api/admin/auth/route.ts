// app/api/admin/auth/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

function getAuthClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// POST: Login
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 })
    }

    const supabase = getAuthClient()
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      user: { email: data.user?.email },
      session: {
        access_token: data.session?.access_token,
        expires_at: data.session?.expires_at,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 })
  }
}

// DELETE: Logout
export async function DELETE() {
  return NextResponse.json({ success: true })
}
