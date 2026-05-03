"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { AnimatePresence, motion } from "framer-motion"
import { X } from "lucide-react"
import {
  ACCEPT_ALL,
  DEFAULT_DENY,
  readConsent,
  writeConsent,
  type ConsentState,
} from "@/lib/cookie-consent"

type Mode = "hidden" | "banner" | "preferences"

export function CookieConsent() {
  const [mode, setMode] = useState<Mode>("hidden")
  const [draft, setDraft] = useState<Omit<ConsentState, "timestamp">>(ACCEPT_ALL)

  useEffect(() => {
    const existing = readConsent()
    if (!existing) {
      setMode("banner")
    } else {
      setDraft({
        necessary: true,
        analytics: existing.analytics,
        marketing: existing.marketing,
        preferences: existing.preferences,
      })
    }

    // Allow other code (e.g. footer link) to reopen the panel.
    function onOpen() {
      const cur = readConsent()
      if (cur) {
        setDraft({
          necessary: true,
          analytics: cur.analytics,
          marketing: cur.marketing,
          preferences: cur.preferences,
        })
      }
      setMode("preferences")
    }
    window.addEventListener("kk-open-cookie-preferences", onOpen)
    return () => window.removeEventListener("kk-open-cookie-preferences", onOpen)
  }, [])

  if (mode === "hidden") return null

  const acceptAll = () => {
    writeConsent(ACCEPT_ALL)
    setMode("hidden")
  }
  const rejectAll = () => {
    writeConsent({
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false,
    })
    setMode("hidden")
  }
  const savePreferences = () => {
    writeConsent(draft)
    setMode("hidden")
  }

  return (
    <AnimatePresence>
      {mode === "banner" && (
        <motion.div
          key="banner"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-x-0 bottom-0 z-[60] px-4 pb-4 md:px-6 md:pb-6 pointer-events-none"
        >
          <div className="pointer-events-auto mx-auto max-w-3xl bg-[#1a1a1a] text-white p-6 md:p-7 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.45)]">
            <p className="text-[11px] tracking-[0.22em] uppercase text-white/50 mb-3">
              cookies
            </p>
            <p className="text-white/85 text-sm md:text-base leading-relaxed mb-5">
              Χρησιμοποιούμε cookies για να λειτουργεί σωστά το καλάθι σου και
              να μετράμε την επισκεψιμότητα. Επίλεξε τι σου ταιριάζει — μπορείς
              να αλλάξεις γνώμη οποτεδήποτε.{" "}
              <Link
                href="/privacy-policy"
                className="underline underline-offset-4 hover:opacity-80"
              >
                Πολιτική απορρήτου
              </Link>
              .
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={acceptAll}
                className="h-11 px-6 inline-flex items-center justify-center bg-white text-[#1a1a1a] hover:bg-white/90 text-sm tracking-[0.06em] uppercase transition-colors"
              >
                αποδοχή όλων
              </button>
              <button
                onClick={rejectAll}
                className="h-11 px-6 inline-flex items-center justify-center border border-white/30 hover:border-white text-white text-sm tracking-[0.06em] uppercase transition-colors"
              >
                μόνο τα απαραίτητα
              </button>
              <button
                onClick={() => setMode("preferences")}
                className="ml-auto md:ml-2 text-xs tracking-[0.12em] uppercase text-white/60 hover:text-white border-b border-white/20 hover:border-white pb-0.5 transition-colors"
              >
                ρυθμίσεις
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {mode === "preferences" && (
        <motion.div
          key="prefs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
        >
          <div
            className="absolute inset-0 bg-[#1a1a1a]/55"
            onClick={() => setMode("banner")}
            aria-hidden
          />
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-xl bg-[#fafaf7] p-8 md:p-10 max-h-[90vh] overflow-y-auto"
          >
            <button
              onClick={() => setMode("banner")}
              className="absolute top-5 right-5 text-[#1a1a1a]/50 hover:text-[#1a1a1a] transition-colors"
              aria-label="Κλείσιμο"
            >
              <X className="h-5 w-5" />
            </button>

            <p className="text-[11px] tracking-[0.22em] uppercase text-[#1a1a1a]/50 mb-3">
              cookies
            </p>
            <h2 className="headline-sm text-[#1a1a1a] mb-6">προτιμήσεις</h2>
            <p className="text-[#1a1a1a]/70 text-sm leading-relaxed mb-8">
              Επίλεξε ποιες κατηγορίες cookies θες να ενεργοποιήσεις. Τα
              απαραίτητα είναι πάντα ενεργά για να λειτουργεί το site.
            </p>

            <div className="border-t border-[#1a1a1a]/12">
              <Toggle
                title="απαραίτητα"
                description="Καλάθι, session, ασφάλεια — δεν μπορούν να απενεργοποιηθούν."
                checked={true}
                disabled
              />
              <Toggle
                title="προτιμήσεις"
                description="Θυμόμαστε επιλογές όπως κατηγορία προβολής ή γλώσσα."
                checked={draft.preferences}
                onChange={(v) => setDraft((d) => ({ ...d, preferences: v }))}
              />
              <Toggle
                title="στατιστικά"
                description="Ανώνυμα στοιχεία επισκεψιμότητας για βελτίωση του site."
                checked={draft.analytics}
                onChange={(v) => setDraft((d) => ({ ...d, analytics: v }))}
              />
              <Toggle
                title="marketing"
                description="Cookies για στοχευμένες ανακοινώσεις ή retargeting."
                checked={draft.marketing}
                onChange={(v) => setDraft((d) => ({ ...d, marketing: v }))}
              />
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                onClick={savePreferences}
                className="h-11 px-6 inline-flex items-center justify-center bg-[#1a1a1a] hover:bg-[#1a1a1a]/85 text-white text-sm tracking-[0.06em] uppercase transition-colors"
              >
                αποθήκευση
              </button>
              <button
                onClick={acceptAll}
                className="h-11 px-6 inline-flex items-center justify-center border border-[#1a1a1a]/20 hover:border-[#1a1a1a] text-[#1a1a1a] text-sm tracking-[0.06em] uppercase transition-colors"
              >
                αποδοχή όλων
              </button>
              <button
                onClick={() => {
                  setDraft(DEFAULT_DENY)
                }}
                className="ml-auto text-xs tracking-[0.12em] uppercase text-[#1a1a1a]/60 hover:text-[#1a1a1a] border-b border-[#1a1a1a]/20 hover:border-[#1a1a1a] pb-0.5 transition-colors"
              >
                καθαρισμός
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Toggle({
  title,
  description,
  checked,
  disabled,
  onChange,
}: {
  title: string
  description: string
  checked: boolean
  disabled?: boolean
  onChange?: (v: boolean) => void
}) {
  return (
    <div className="flex items-start justify-between gap-6 py-5 border-b border-[#1a1a1a]/12">
      <div className="min-w-0">
        <p className="text-[#1a1a1a] mb-1">{title}</p>
        <p className="text-xs text-[#1a1a1a]/60 leading-relaxed">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange?.(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center transition-colors ${
          checked ? "bg-[#1a1a1a]" : "bg-[#1a1a1a]/15"
        } ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <span
          className={`inline-block h-4 w-4 bg-white transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  )
}

// Convenience helper for the footer "Ρυθμίσεις cookies" link.
export function openCookiePreferences() {
  if (typeof window === "undefined") return
  window.dispatchEvent(new CustomEvent("kk-open-cookie-preferences"))
}
