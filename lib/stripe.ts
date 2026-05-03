import Stripe from "stripe"

let stripeClient: Stripe | null = null

export function getStripeClient(): Stripe {
  if (stripeClient) return stripeClient
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error("STRIPE_SECRET_KEY missing")
  stripeClient = new Stripe(key, {
    apiVersion: "2025-09-30.clover" as Stripe.LatestApiVersion,
    typescript: true,
  })
  return stripeClient
}

export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || ""
