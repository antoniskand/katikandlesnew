import crypto from "crypto"
import { Address4, Address6 } from "ip-address"

export function vivaPaymentsSignature(data: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(data).digest("hex")
}

export function verifyVivaSignature(payload: string, signature: string, secret: string): boolean {
  const expectedSignature = vivaPaymentsSignature(payload, secret)
  return crypto.timingSafeEqual(Buffer.from(signature, "hex"), Buffer.from(expectedSignature, "hex"))
}

// Production IPs
const VIVA_WEBHOOK_IPS_PRODUCTION = [
  "51.138.37.238",
  "13.80.70.181",
  "13.80.71.223",
  "13.79.28.70",
  "40.127.253.112/28",
  "51.105.129.192/28",
  "20.54.89.16",
  "4.223.76.50",
  "51.12.157.0/28",
]

// Demo/Sandbox IPs
const VIVA_WEBHOOK_IPS_DEMO = [
  "20.50.240.57",
  "40.74.20.78",
  "94.70.170.65",
  "94.70.255.73",
  "94.70.248.18",
  "83.235.24.226",
  "20.13.195.185",
  "94.70.174.36",
]

// Local development IPs
const LOCAL_IPS = ["127.0.0.1", "::1"]

function getVivaWebhookIPs(): string[] {
  const isDemo = process.env.VIVA_ENVIRONMENT === "demo" || process.env.NEXT_PUBLIC_VIVA_ENVIRONMENT === "demo"
  const vivaIPs = isDemo ? VIVA_WEBHOOK_IPS_DEMO : VIVA_WEBHOOK_IPS_PRODUCTION
  return [...vivaIPs, ...LOCAL_IPS]
}

export function isValidVivaIP(clientIP: string): boolean {
  // Always allow in development
  if (process.env.NODE_ENV === "development") {
    return true
  }

  if (!clientIP) {
    return false
  }

  const allowedIPs = getVivaWebhookIPs()

  // First, normalize the IP (remove IPv6 prefix if present)
  let normalizedIP = clientIP
  if (clientIP.startsWith("::ffff:")) {
    normalizedIP = clientIP.substring(7) // Remove ::ffff: prefix for IPv4-mapped IPv6
  }

  // Check for exact match first (for single IPs)
  if (allowedIPs.includes(normalizedIP)) {
    return true
  }

  // Check subnet ranges
  try {
    // Try parsing as IPv4
    const ipv4 = new Address4(normalizedIP)
    if (ipv4.isCorrect()) {
      return allowedIPs.some((range) => {
        // Skip non-CIDR entries for subnet check
        if (!range.includes("/")) {
          return false
        }
        try {
          const subnet = new Address4(range)
          return ipv4.isInSubnet(subnet)
        } catch {
          return false
        }
      })
    }
  } catch {
    // Not a valid IPv4
  }

  try {
    // Try parsing as IPv6
    const ipv6 = new Address6(clientIP)
    if (ipv6.isCorrect()) {
      return allowedIPs.some((range) => {
        if (!range.includes("/")) {
          return false
        }
        try {
          const subnet = new Address6(range)
          return ipv6.isInSubnet(subnet)
        } catch {
          return false
        }
      })
    }
  } catch {
    // Not a valid IPv6
  }

  return false
}

export interface VivaWebhookPayload {
  EventTypeId: number
  EventData: {
    OrderCode: string
    StatusId: string
    Amount: number
    TransactionId: string
    Email?: string
    FullName?: string
  }
}

export function parseVivaWebhook(body: string): VivaWebhookPayload | null {
  try {
    return JSON.parse(body)
  } catch {
    return null
  }
}
