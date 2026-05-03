// auth.ts (project root)
// NextAuth v5 — Credentials provider, JWT sessions, admin_users table.

import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { adminUsers } from "@/lib/db/schema"

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/admin/login" },
  trustHost: true,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(creds) {
        if (!creds?.email || !creds?.password) return null
        const email = String(creds.email).toLowerCase().trim()

        const user = await db.query.adminUsers.findFirst({
          where: eq(adminUsers.email, email),
        })
        if (!user || !user.passwordHash) return null

        const ok = await bcrypt.compare(String(creds.password), user.passwordHash)
        if (!ok) return null

        return {
          id: user.id,
          email: user.email,
          name: user.displayName || user.email,
          role: user.role,
        } as any
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        ;(session.user as any).id = token.id
        ;(session.user as any).role = token.role
      }
      return session
    },
    async authorized({ auth, request }) {
      const { pathname } = request.nextUrl
      const isAdmin = pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")
      const isAdminApi = pathname.startsWith("/api/admin")
      if (isAdmin || isAdminApi) return !!auth
      return true
    },
  },
})
