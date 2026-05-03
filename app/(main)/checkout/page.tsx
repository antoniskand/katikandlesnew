"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useCart } from "@/context/cart-context"
import { useToast } from "@/hooks/use-toast"
import { formatPrice } from "@/lib/utils"
import { X, Lock, Loader2 } from "lucide-react"

export default function Checkout() {
  const { cart, isLoading: cartLoading, applyCoupon, removeCoupon, getAppliedCoupon } = useCart()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState("")
  const [couponInput, setCouponInput] = useState("")
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false)
  const [couponError, setCouponError] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    zip: "",
    country: "GR",
    shippingMethod: "courier",
  })

  const shippingMethods = [
    {
      id: "courier",
      name: "Courier",
      description: "Παράδοση στη διεύθυνσή σου, 1–3 εργάσιμες",
      price: 2.0,
    },
    {
      id: "boxnow",
      name: "BoxNow",
      description: "Παράδοση σε σημείο BoxNow, 1–2 εργάσιμες",
      price: 2.0,
    },
  ]

  const selectedShippingMethod = shippingMethods.find((m) => m.id === formData.shippingMethod)
  const subtotal = cart.sub_total
  const discountTotal = cart.discount_total
  const isFreeShipping = subtotal >= 30
  const shippingCost = isFreeShipping ? 0 : selectedShippingMethod?.price || 0
  const total = Math.round((subtotal + shippingCost - discountTotal) * 100) / 100
  const appliedCoupon = getAppliedCoupon()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleApplyCoupon = async () => {
    if (!couponInput.trim() || isApplyingCoupon) return
    setIsApplyingCoupon(true)
    setCouponError("")

    try {
      const response = await fetch("/api/cart/apply-coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ couponCode: couponInput.trim(), subtotal }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || "Άκυρο κουπόνι")
      if (result.success && result.coupon) {
        applyCoupon(result.coupon)
        setCouponInput("")
        toast({ title: "Επιτυχία!", description: "Το κουπόνι εφαρμόστηκε" })
      }
    } catch (error: any) {
      setCouponError(error.message || "Σφάλμα κατά την εφαρμογή του κουπονιού")
    } finally {
      setIsApplyingCoupon(false)
    }
  }

  const validateForm = () => {
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.phone ||
      !formData.address1 ||
      !formData.city ||
      !formData.zip
    ) {
      setFormError("Συμπλήρωσε όλα τα πεδία με αστερίσκο (*).")
      return false
    }
    setFormError("")
    return true
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isSubmitting || !validateForm()) return
    setIsSubmitting(true)
    setFormError("")

    try {
      const response = await fetch("/api/payments/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerInfo: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
          },
          shippingInfo: {
            address1: formData.address1,
            address2: formData.address2,
            city: formData.city,
            state: formData.state,
            zip: formData.zip,
            country: formData.country,
          },
          shippingMethod: selectedShippingMethod,
          items: cart.items,
          coupon: appliedCoupon
            ? { id: appliedCoupon.id, code: appliedCoupon.code, discount: discountTotal }
            : null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Σφάλμα δημιουργίας παραγγελίας")
      }

      const { url } = await response.json()
      window.location.href = url
    } catch (error: any) {
      setFormError(error.message || "Προέκυψε σφάλμα κατά την ολοκλήρωση της παραγγελίας.")
      toast({ title: "Σφάλμα", description: error.message, variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (cartLoading) {
    return (
      <div className="min-h-screen bg-[#fafaf7] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-6 w-6 mx-auto animate-spin text-[#1a1a1a]/60" />
          <p className="mt-4 text-[10px] tracking-[0.22em] uppercase text-[#1a1a1a]/50">
            φόρτωση
          </p>
        </div>
      </div>
    )
  }

  if (!cart.items?.length) {
    return (
      <div className="min-h-screen bg-[#fafaf7] flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <p className="text-[11px] tracking-[0.22em] uppercase text-[#1a1a1a]/50 mb-4">
            ολοκλήρωση
          </p>
          <h1 className="headline-md text-[#1a1a1a] mb-6">
            το καλάθι είναι άδειο
          </h1>
          <Link
            href="/"
            className="inline-flex items-center justify-center bg-[#1a1a1a] hover:bg-[#1a1a1a]/85 text-white text-sm tracking-[0.06em] uppercase px-8 h-12 transition-colors"
          >
            δες τα κεριά
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fafaf7]">
      <div className="mx-auto max-w-7xl px-6 md:px-12 lg:px-16 pt-28 md:pt-36 pb-20">
        {/* Header */}
        <div className="mb-12 md:mb-16">
          <p className="text-[11px] tracking-[0.22em] uppercase text-[#1a1a1a]/50 mb-3">
            ολοκλήρωση
          </p>
          <h1 className="headline-md text-[#1a1a1a]">checkout</h1>
        </div>

        <div className="grid lg:grid-cols-[1fr_22rem] gap-12 lg:gap-16">
          <form onSubmit={handleSubmit} className="space-y-14 md:space-y-20">
            {/* 01 — Στοιχεία πελάτη */}
            <FormSection number="01" title="στοιχεία επικοινωνίας">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-7">
                <Field label="όνομα *" name="firstName" value={formData.firstName} onChange={handleChange} required />
                <Field label="επώνυμο *" name="lastName" value={formData.lastName} onChange={handleChange} required />
                <Field label="email *" name="email" type="email" value={formData.email} onChange={handleChange} required />
                <Field label="τηλέφωνο *" name="phone" type="tel" value={formData.phone} onChange={handleChange} required />
              </div>
            </FormSection>

            {/* 02 — Διεύθυνση */}
            <FormSection number="02" title="διεύθυνση αποστολής">
              <div className="space-y-7">
                <Field label="διεύθυνση *" name="address1" value={formData.address1} onChange={handleChange} required />
                <Field label="διεύθυνση 2 (προαιρετικό)" name="address2" value={formData.address2} onChange={handleChange} />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-7">
                  <Field label="πόλη *" name="city" value={formData.city} onChange={handleChange} required />
                  <Field label="περιοχή" name="state" value={formData.state} onChange={handleChange} />
                  <Field label="τ.κ. *" name="zip" value={formData.zip} onChange={handleChange} required />
                </div>
              </div>
            </FormSection>

            {/* 03 — Αποστολή */}
            <FormSection number="03" title="τρόπος αποστολής">
              {isFreeShipping && (
                <p className="text-[11px] tracking-[0.18em] uppercase text-[#0f9b81] mb-5 inline-flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#0f9b81]" />
                  δωρεάν αποστολή
                </p>
              )}
              <div className="space-y-3">
                {shippingMethods.map((method) => {
                  const active = formData.shippingMethod === method.id
                  return (
                    <label
                      key={method.id}
                      className={`flex items-center justify-between gap-4 px-5 py-4 border cursor-pointer transition-colors ${
                        active
                          ? "border-[#1a1a1a]"
                          : "border-[#1a1a1a]/15 hover:border-[#1a1a1a]/40"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <span
                          className={`h-3.5 w-3.5 rounded-full border transition-colors ${
                            active
                              ? "border-[#1a1a1a] bg-[#1a1a1a] ring-2 ring-white ring-inset"
                              : "border-[#1a1a1a]/30"
                          }`}
                        />
                        <input
                          type="radio"
                          name="shippingMethod"
                          value={method.id}
                          checked={active}
                          onChange={(e) =>
                            setFormData((p) => ({ ...p, shippingMethod: e.target.value }))
                          }
                          className="sr-only"
                        />
                        <div>
                          <p className="text-[#1a1a1a] text-base">{method.name}</p>
                          <p className="text-xs text-[#1a1a1a]/55 mt-0.5">{method.description}</p>
                        </div>
                      </div>
                      <span className="text-sm tabular-nums text-[#1a1a1a]">
                        {isFreeShipping ? "δωρεάν" : formatPrice(method.price)}
                      </span>
                    </label>
                  )
                })}
              </div>
            </FormSection>

            {/* 04 — Πληρωμή */}
            <FormSection number="04" title="πληρωμή">
              <div className="flex items-center gap-4 px-5 py-4 border border-[#1a1a1a]/15">
                <Lock className="h-4 w-4 text-[#1a1a1a]/70 shrink-0" />
                <div>
                  <p className="text-[#1a1a1a] text-sm">Stripe Secure Checkout</p>
                  <p className="text-xs text-[#1a1a1a]/55 mt-0.5">
                    Πληρωμή με κάρτα, Apple Pay ή Google Pay
                  </p>
                </div>
              </div>
            </FormSection>

            {formError && (
              <p className="text-sm text-destructive">{formError}</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-14 inline-flex items-center justify-center gap-3 bg-[#1a1a1a] hover:bg-[#1a1a1a]/85 disabled:opacity-60 text-white text-sm tracking-[0.08em] uppercase transition-colors"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  μεταφορά στο stripe…
                </>
              ) : (
                <>
                  <span>συνέχεια στην πληρωμή</span>
                  <span className="text-white/40">·</span>
                  <span className="tabular-nums">{formatPrice(total)}</span>
                </>
              )}
            </button>
          </form>

          {/* Summary */}
          <aside className="lg:sticky lg:top-32 lg:self-start">
            <p className="text-[11px] tracking-[0.22em] uppercase text-[#1a1a1a]/50 mb-6">
              σύνοψη
            </p>

            <div className="border-t border-[#1a1a1a]/12 divide-y divide-[#1a1a1a]/8">
              {cart.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 py-4">
                  <div className="relative w-12 h-12 bg-[#f4eee2] overflow-hidden flex-shrink-0">
                    {item.product?.images?.[0]?.url ? (
                      <Image
                        src={item.product.images[0].url}
                        alt={item.product.name || ""}
                        fill
                        className="object-contain p-1.5"
                        sizes="48px"
                      />
                    ) : null}
                    {item.quantity > 1 && (
                      <span className="absolute -top-1 -right-1 bg-[#1a1a1a] text-white text-[10px] tabular-nums w-4 h-4 flex items-center justify-center">
                        {item.quantity}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#1a1a1a] line-clamp-1">{item.product?.name}</p>
                    <p className="text-[10px] tracking-[0.12em] uppercase text-[#1a1a1a]/50 mt-0.5 tabular-nums">
                      {formatPrice(item.price)} · {item.quantity}
                    </p>
                  </div>
                  <span className="text-sm text-[#1a1a1a] tabular-nums">
                    {formatPrice(item.price_total)}
                  </span>
                </div>
              ))}
            </div>

            {/* Coupon */}
            <div className="mt-8">
              <p className="text-[11px] tracking-[0.22em] uppercase text-[#1a1a1a]/50 mb-3">
                κουπόνι
              </p>
              {appliedCoupon ? (
                <div className="flex items-center justify-between border border-[#1a1a1a]/15 px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-sm text-[#1a1a1a]">{appliedCoupon.name || appliedCoupon.code}</p>
                    <p className="text-xs text-[#0f9b81] mt-0.5 tabular-nums">
                      −{formatPrice(discountTotal)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={removeCoupon}
                    className="text-[#1a1a1a]/40 hover:text-[#1a1a1a] transition-colors"
                    aria-label="Αφαίρεση κουπονιού"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="κωδικός"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    className="flex-1 px-0 py-2 bg-transparent border-0 border-b border-[#1a1a1a]/20 focus:border-[#1a1a1a] focus:outline-none text-[#1a1a1a] placeholder-[#1a1a1a]/30 text-sm"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={!couponInput.trim() || isApplyingCoupon}
                    className="text-xs tracking-[0.12em] uppercase text-[#1a1a1a] border-b border-[#1a1a1a] hover:opacity-70 disabled:opacity-30 pb-1.5 transition-opacity whitespace-nowrap"
                  >
                    {isApplyingCoupon ? "…" : "εφαρμογή"}
                  </button>
                </div>
              )}
              {couponError && (
                <p className="text-xs text-destructive mt-2">{couponError}</p>
              )}
            </div>

            {/* Totals */}
            <div className="mt-8 space-y-3 text-sm border-t border-[#1a1a1a]/12 pt-5">
              <Row label="υποσύνολο" value={formatPrice(subtotal)} />
              {discountTotal > 0 && (
                <Row label="έκπτωση" value={`−${formatPrice(discountTotal)}`} emphasis />
              )}
              <Row
                label="μεταφορικά"
                value={isFreeShipping ? "δωρεάν" : formatPrice(shippingCost)}
                emphasis={isFreeShipping}
              />
            </div>

            <div className="mt-8 pt-6 border-t border-[#1a1a1a] flex items-baseline justify-between gap-4">
              <span className="text-[11px] tracking-[0.22em] uppercase text-[#1a1a1a]/50">
                σύνολο
              </span>
              <span className="font-light text-[#1a1a1a] text-4xl md:text-5xl tabular-nums tracking-tight leading-none">
                {formatPrice(total)}
              </span>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
function FormSection({
  number,
  title,
  children,
}: {
  number: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section>
      <div className="flex items-baseline gap-6 md:gap-10 mb-8 pb-4 border-b border-[#1a1a1a]">
        <span className="text-sm tabular-nums tracking-[0.1em] text-[#1a1a1a]/40">
          {number}
        </span>
        <h2 className="text-xl md:text-2xl tracking-tight lowercase text-[#1a1a1a]">
          {title}
        </h2>
      </div>
      <div className="md:pl-[3.25rem]">{children}</div>
    </section>
  )
}

function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  type?: string
  required?: boolean
}) {
  return (
    <label className="block">
      <span className="text-[11px] tracking-[0.2em] uppercase text-[#1a1a1a]/50 block mb-2">
        {label}
      </span>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full px-0 py-2 bg-transparent border-0 border-b border-[#1a1a1a]/20 focus:border-[#1a1a1a] focus:outline-none text-[#1a1a1a] placeholder-[#1a1a1a]/30 text-base transition-colors"
      />
    </label>
  )
}

function Row({
  label,
  value,
  emphasis,
}: {
  label: string
  value: string
  emphasis?: boolean
}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="text-[#1a1a1a]/65">{label}</span>
      <span className={`tabular-nums ${emphasis ? "text-[#0f9b81]" : "text-[#1a1a1a]"}`}>
        {value}
      </span>
    </div>
  )
}
