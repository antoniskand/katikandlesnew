"use server"

import { z } from "zod"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { newsletterSubscribers } from "@/lib/db/schema"

const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
})

type SubscribeResult = {
  success: boolean
  message: string
}

export async function subscribeToNewsletter(
  formData: FormData,
): Promise<SubscribeResult> {
  try {
    const email = formData.get("email") as string

    const parsed = emailSchema.safeParse({ email })
    if (!parsed.success) {
      return { success: false, message: "Παρακαλώ δώσε ένα έγκυρο email." }
    }

    const normalized = email.toLowerCase().trim()

    const existing = await db.query.newsletterSubscribers.findFirst({
      where: eq(newsletterSubscribers.email, normalized),
    })

    if (existing) {
      if (existing.status === "unsubscribed") {
        await db
          .update(newsletterSubscribers)
          .set({ status: "active", subscribedAt: new Date() })
          .where(eq(newsletterSubscribers.id, existing.id))
        return {
          success: true,
          message: "Καλώς ήρθες πίσω! Ξανά μέλος του newsletter.",
        }
      }
      return {
        success: true,
        message: "Είσαι ήδη εγγεγραμμένος στο newsletter.",
      }
    }

    await db.insert(newsletterSubscribers).values({
      email: normalized,
      source: "website_homepage",
      status: "active",
    })

    return {
      success: true,
      message: "Ευχαριστούμε για την εγγραφή στο newsletter!",
    }
  } catch (error) {
    console.error("Newsletter subscription error:", error)
    return {
      success: false,
      message: "Κάτι πήγε στραβά. Δοκίμασε ξανά αργότερα.",
    }
  }
}
