// stack.ts
// Stack Auth (Neon Auth) server-side instance.
// Used by route handlers, server components, middleware.

import "server-only"
import { StackServerApp } from "@stackframe/stack"

export const stackServerApp = new StackServerApp({
  tokenStore: "nextjs-cookie",
  urls: {
    signIn: "/admin/login",
    afterSignIn: "/admin",
    afterSignUp: "/admin",
    afterSignOut: "/",
  },
})
