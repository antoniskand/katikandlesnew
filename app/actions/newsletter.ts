"use server"

import { z } from "zod"
import { createClient } from "@supabase/supabase-js"

// Create Supabase client for server-side operations
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

// Email validation schema
const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
})

type SubscribeResult = {
  success: boolean
  message: string
}

export async function subscribeToNewsletter(formData: FormData): Promise<SubscribeResult> {
  try {
    // Get email from form data
    const email = formData.get("email") as string

    // Validate email
    const result = emailSchema.safeParse({ email })
    if (!result.success) {
      return {
        success: false,
        message: "Please enter a valid email address",
      }
    }

    // Normalize email (lowercase and trim)
    const normalizedEmail = email.toLowerCase().trim()

    // Check if email already exists
    const { data: existingSubscriber, error: checkError } = await supabase
      .from("newsletter_subscribers")
      .select("id, status")
      .eq("email", normalizedEmail)
      .single()

    if (checkError && checkError.code !== "PGRST116") {
      console.error("Error checking for existing subscriber:", checkError)
      return {
        success: false,
        message: "Something went wrong. Please try again later.",
      }
    }

    if (existingSubscriber) {
      // If user was previously unsubscribed, reactivate them
      if (existingSubscriber.status === "unsubscribed") {
        const { error: updateError } = await supabase
          .from("newsletter_subscribers")
          .update({
            status: "active",
            subscribed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingSubscriber.id)

        if (updateError) {
          console.error("Error reactivating subscriber:", updateError)
          return {
            success: false,
            message: "Something went wrong. Please try again later.",
          }
        }

        return {
          success: true,
          message: "Welcome back! You've been resubscribed to our newsletter.",
        }
      }

      // Email already exists and is active
      return {
        success: true,
        message: "You're already subscribed to our newsletter!",
      }
    }

    // Insert new subscriber
    const { error: insertError } = await supabase.from("newsletter_subscribers").insert([
      {
        email: normalizedEmail,
        source: "website_homepage",
        status: "active",
      },
    ])

    if (insertError) {
      console.error("Error inserting subscriber:", insertError)

      // If it's a unique constraint violation, the email was added concurrently
      if (insertError.code === "23505") {
        return {
          success: true,
          message: "Thank you for subscribing to our newsletter!",
        }
      }

      return {
        success: false,
        message: "Something went wrong. Please try again later.",
      }
    }

    console.log(`New newsletter subscriber: ${normalizedEmail}`)

    return {
      success: true,
      message: "Thank you for subscribing to our newsletter!",
    }
  } catch (error) {
    console.error("Newsletter subscription error:", error)
    return {
      success: false,
      message: "Something went wrong. Please try again later.",
    }
  }
}
