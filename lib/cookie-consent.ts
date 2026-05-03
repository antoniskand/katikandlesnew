// lib/cookie-consent.ts
// Storage helpers for cookie consent. Consent is persisted in a single
// localStorage entry so the user only has to choose once.
//
// Categories follow the GDPR / IAB pattern:
//  - necessary: always on (cart, session, fraud prevention) — not togglable
//  - analytics: opt-in (e.g. Google Analytics, Vercel Analytics)
//  - marketing: opt-in (ad pixels, retargeting)
//  - preferences: opt-in (UI preferences beyond what's needed for cart)
//
// We don't currently load any third-party trackers, but the toggles are wired
// so that any future script can read `getConsent().analytics` etc. before
// running.

export const CONSENT_STORAGE_KEY = "kk-cookie-consent-v1"

export type ConsentCategory = "necessary" | "analytics" | "marketing" | "preferences"

export interface ConsentState {
  necessary: true
  analytics: boolean
  marketing: boolean
  preferences: boolean
  timestamp: number
}

export const DEFAULT_DENY: ConsentState = {
  necessary: true,
  analytics: false,
  marketing: false,
  preferences: false,
  timestamp: 0,
}

export const ACCEPT_ALL: Omit<ConsentState, "timestamp"> = {
  necessary: true,
  analytics: true,
  marketing: true,
  preferences: true,
}

export function readConsent(): ConsentState | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (typeof parsed !== "object" || parsed === null) return null
    return {
      necessary: true,
      analytics: !!parsed.analytics,
      marketing: !!parsed.marketing,
      preferences: !!parsed.preferences,
      timestamp: Number(parsed.timestamp) || Date.now(),
    }
  } catch {
    return null
  }
}

export function writeConsent(state: Omit<ConsentState, "timestamp">): ConsentState {
  const stored: ConsentState = { ...state, necessary: true, timestamp: Date.now() }
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(stored))
      window.dispatchEvent(new CustomEvent("kk-consent-changed", { detail: stored }))
    } catch {
      // localStorage disabled; fail silently — banner will reappear next visit
    }
  }
  return stored
}

export function clearConsent(): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.removeItem(CONSENT_STORAGE_KEY)
    window.dispatchEvent(new CustomEvent("kk-consent-changed", { detail: null }))
  } catch {}
}
