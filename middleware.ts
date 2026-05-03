// middleware.ts
// NextAuth v5 middleware. The `authorized` callback in auth.ts decides who gets through.
export { auth as middleware } from "@/auth"

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
}
