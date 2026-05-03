// auth.ts (project root)
// NextAuth v5 — Magic link via Resend, allowlist from admin_users.

import NextAuth from "next-auth"
import Resend from "next-auth/providers/resend"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { eq } from "drizzle-orm"
import { Resend as ResendClient } from "resend"

import { db } from "@/lib/db"
import {
  accounts,
  adminUsers,
  sessions,
  users,
  verificationTokens,
} from "@/lib/db/schema"

const RESEND_FROM = process.env.AUTH_RESEND_FROM || "Kati Kandles <onboarding@resend.dev>"
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

async function isAllowedAdmin(email: string): Promise<boolean> {
  const normalized = email.toLowerCase().trim()
  const row = await db.query.adminUsers.findFirst({
    where: eq(adminUsers.email, normalized),
  })
  return !!row
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  session: { strategy: "jwt" },
  pages: { signIn: "/admin/login", verifyRequest: "/admin/login?check=email" },
  trustHost: true,
  providers: [
    Resend({
      apiKey: process.env.AUTH_RESEND_KEY,
      from: RESEND_FROM,
      // Only send the email if the address is on the admin allowlist.
      // This prevents abuse of the form (anyone could otherwise trigger emails).
      async sendVerificationRequest({ identifier: email, url }) {
        if (!(await isAllowedAdmin(email))) {
          // Silently no-op so we don't leak whether an email is on the allowlist.
          return
        }

        if (!process.env.AUTH_RESEND_KEY) {
          // In dev without a key, log the link to the console.
          console.log("\n[magic-link]", email, "→", url, "\n")
          return
        }

        const client = new ResendClient(process.env.AUTH_RESEND_KEY)
        const result = await client.emails.send({
          from: RESEND_FROM,
          to: email,
          subject: "Kati Kandles · σύνδεσμος εισόδου",
          html: magicLinkHtml(url),
          text: `Πάτησε εδώ για να συνδεθείς: ${url}\n\nΑν δεν ζήτησες σύνδεση, αγνόησε αυτό το email.`,
        })
        if (result.error) {
          throw new Error(result.error.message)
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      // Even if a token survives, double-check on sign-in.
      if (!user.email) return false
      return await isAllowedAdmin(user.email)
    },
    async jwt({ token, user }) {
      if (user?.email) {
        const admin = await db.query.adminUsers.findFirst({
          where: eq(adminUsers.email, user.email.toLowerCase()),
          columns: { id: true, role: true },
        })
        if (admin) {
          token.id = admin.id
          token.role = admin.role
        }
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

// ============================================================
// Email template (kept inline so it tracks the brand)
// ============================================================
function magicLinkHtml(url: string) {
  return `<!doctype html>
<html lang="el">
  <body style="margin:0;padding:32px;background:#f7e7ce;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#1a1a1a;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:0 auto;background:white;border-radius:24px;border:2px solid #1a1a1a;box-shadow:0 12px 28px -16px rgba(26,18,8,.25);">
      <tr><td style="padding:40px 32px;">
        <p style="margin:0 0 8px;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#ff6b35;">kati kandles · admin</p>
        <h1 style="margin:0 0 16px;font-size:28px;line-height:1.1;font-weight:600;">σύνδεσμος εισόδου</h1>
        <p style="margin:0 0 24px;color:#502e23;line-height:1.6;">
          Πάτησε το παρακάτω κουμπί για να συνδεθείς στο control panel σου.
          Ο σύνδεσμος ισχύει για 24 ώρες.
        </p>
        <p style="margin:0 0 24px;">
          <a href="${url}" style="display:inline-block;background:#1a1a1a;color:white;text-decoration:none;padding:14px 28px;border-radius:9999px;font-weight:500;letter-spacing:.02em;">
            σύνδεση →
          </a>
        </p>
        <p style="margin:0 0 8px;color:#502e23;font-size:14px;">Ή αντίγραψε αυτό το URL στον browser:</p>
        <p style="margin:0;color:#502e23;font-size:13px;word-break:break-all;">${url}</p>
      </td></tr>
    </table>
    <p style="text-align:center;margin:24px 0 0;font-size:12px;color:#502e23;opacity:.7;">
      Αν δεν ζήτησες σύνδεση, αγνόησε αυτό το email.
    </p>
  </body>
</html>`
}
