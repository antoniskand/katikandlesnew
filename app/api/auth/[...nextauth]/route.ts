// app/api/auth/[...nextauth]/route.ts
// NextAuth v5 catch-all handler.
import { handlers } from "@/auth"

export const { GET, POST } = handlers
