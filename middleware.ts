// middleware.ts
// Guards /admin and /api/admin routes.
// Stack Auth tokens live in cookies (set by tokenStore: "nextjs-cookie")
// and are decoded server-side. We let the route layouts/handlers do the
// actual user lookup; the middleware just blocks unauthenticated requests
// from reaching protected pages.

import { NextResponse, type NextRequest } from "next/server"

const STACK_COOKIE_PREFIX = "stack-"

function hasStackToken(req: NextRequest): boolean {
  // Stack stores its session as cookies prefixed with "stack-".
  for (const cookie of req.cookies.getAll()) {
    if (cookie.name.startsWith(STACK_COOKIE_PREFIX) && cookie.value) {
      return true
    }
  }
  return false
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const isAdminPage = pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")
  const isAdminApi = pathname.startsWith("/api/admin")

  if (!isAdminPage && !isAdminApi) return NextResponse.next()

  if (hasStackToken(req)) return NextResponse.next()

  if (isAdminApi) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const url = req.nextUrl.clone()
  url.pathname = "/admin/login"
  url.searchParams.set("next", pathname)
  return NextResponse.redirect(url)
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
}
