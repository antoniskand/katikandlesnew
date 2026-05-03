// app/handler/[...stack]/page.tsx
// Stack Auth catch-all handler — provides /handler/sign-in, /handler/sign-up,
// /handler/sign-out, /handler/account-settings, etc.

import { StackHandler } from "@stackframe/stack"
import { stackServerApp } from "@/stack"

export default function Handler(props: any) {
  return <StackHandler fullPage app={stackServerApp} routeProps={props} />
}
