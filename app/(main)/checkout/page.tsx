"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useCart } from "@/context/cart-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { formatPrice } from "@/lib/utils"
import { X, Tag, Lock, Loader2 } from "lucide-react"

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
      description: "Παράδοση στη διεύθυνσή σας, 1-3 εργάσιμες",
      price: 2.0,
    },
    {
      id: "boxnow",
      name: "BoxNow",
      description: "Παράδοση σε σημείο BoxNow, 1-2 εργάσιμες",
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
      setFormError("Παρακαλώ συμπλήρωσε όλα τα πεδία με αστερίσκο (*).")
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
      <div className="min-h-screen bg-[#f7e7ce]">
        <div className="container mx-auto pt-32 pb-12 px-4 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p>Φόρτωση καλαθιού...</p>
        </div>
      </div>
    )
  }

  if (!cart.items?.length) {
    return (
      <div className="min-h-screen bg-[#f7e7ce]">
        <div className="container mx-auto pt-32 pb-12 px-4 text-center">
          <h1 className="headline-md text-[#1a1a1a] mb-4">το καλάθι σου είναι άδειο</h1>
          <p className="text-[#502e23]/70 mb-6">
            Πρόσθεσε προϊόντα στο καλάθι σου για να συνεχίσεις.
          </p>
          <Button onClick={() => router.push("/")} className="bg-[#1a1a1a] text-white">
            Περιήγηση στα προϊόντα
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7e7ce]">
      <div className="container mx-auto pt-28 md:pt-32 pb-16 px-4">
        <div className="mb-8 text-center">
          <div className="caption text-[#502e23]/60 mb-3">checkout</div>
          <h1 className="headline-md text-[#1a1a1a]">ολοκλήρωση</h1>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          <form onSubmit={handleSubmit} className="md:col-span-2 space-y-6">
            <div className="bg-white/70 p-6 rounded-2xl border border-white/90">
              <h2 className="text-lg font-semibold mb-4 text-[#1a1a1a]">Στοιχεία πελάτη</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Όνομα *</Label>
                  <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} required />
                </div>
                <div>
                  <Label htmlFor="lastName">Επώνυμο *</Label>
                  <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
                </div>
                <div>
                  <Label htmlFor="phone">Τηλέφωνο *</Label>
                  <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} required />
                </div>
              </div>
            </div>

            <div className="bg-white/70 p-6 rounded-2xl border border-white/90">
              <h2 className="text-lg font-semibold mb-4 text-[#1a1a1a]">Διεύθυνση αποστολής</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="address1">Διεύθυνση *</Label>
                  <Input id="address1" name="address1" value={formData.address1} onChange={handleChange} required />
                </div>
                <div>
                  <Label htmlFor="address2">Διεύθυνση 2 (προαιρετικό)</Label>
                  <Input id="address2" name="address2" value={formData.address2} onChange={handleChange} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">Πόλη *</Label>
                    <Input id="city" name="city" value={formData.city} onChange={handleChange} required />
                  </div>
                  <div>
                    <Label htmlFor="state">Περιοχή</Label>
                    <Input id="state" name="state" value={formData.state} onChange={handleChange} />
                  </div>
                  <div>
                    <Label htmlFor="zip">Τ.Κ. *</Label>
                    <Input id="zip" name="zip" value={formData.zip} onChange={handleChange} required />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/70 p-6 rounded-2xl border border-white/90">
              <h2 className="text-lg font-semibold mb-4 text-[#1a1a1a]">Τρόπος αποστολής</h2>
              {isFreeShipping && (
                <div className="mb-4 p-3 bg-green-50 text-green-800 rounded-md border border-green-200 text-sm font-medium">
                  ✿ Δωρεάν αποστολή για παραγγελίες άνω των 30€
                </div>
              )}
              <RadioGroup
                value={formData.shippingMethod}
                onValueChange={(v) => setFormData((p) => ({ ...p, shippingMethod: v }))}
                className="space-y-3"
              >
                {shippingMethods.map((method) => (
                  <div
                    key={method.id}
                    className={`flex items-center justify-between p-4 rounded-md border ${
                      formData.shippingMethod === method.id
                        ? "border-[#ff6b35] bg-[#ff6b35]/5"
                        : "border-[#502e23]/15"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value={method.id} id={`shipping-${method.id}`} />
                      <div>
                        <Label htmlFor={`shipping-${method.id}`} className="font-medium">
                          {method.name}
                        </Label>
                        <p className="text-sm text-[#502e23]/70">{method.description}</p>
                      </div>
                    </div>
                    <div>
                      {isFreeShipping ? (
                        <span className="text-green-700 font-medium">Δωρεάν</span>
                      ) : (
                        <span>{formatPrice(method.price)}</span>
                      )}
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="bg-white/70 p-6 rounded-2xl border border-white/90">
              <h2 className="text-lg font-semibold mb-4 text-[#1a1a1a]">Τρόπος πληρωμής</h2>
              <div className="flex items-center gap-4 p-4 border border-[#502e23]/15 rounded-md bg-white/60">
                <Lock className="h-5 w-5 text-[#ff6b35]" />
                <div>
                  <p className="font-medium text-[#1a1a1a]">Stripe Secure Checkout</p>
                  <p className="text-sm text-[#502e23]/70">
                    Ασφαλής πληρωμή με κάρτα, Apple Pay ή Google Pay
                  </p>
                </div>
              </div>
            </div>

            {formError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
                {formError}
              </div>
            )}

            <Button
              type="submit"
              className="w-full py-6 text-base bg-[#1a1a1a] hover:bg-[#1a1a1a]/85 text-white tracking-wide"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Μεταφορά στο Stripe...
                </>
              ) : (
                <>Συνέχεια στην πληρωμή · {formatPrice(total)}</>
              )}
            </Button>
          </form>

          <div className="md:sticky md:top-24 h-fit">
            <div className="bg-white/70 p-6 rounded-2xl border border-white/90">
              <h2 className="text-lg font-semibold mb-4 text-[#1a1a1a]">Σύνοψη</h2>

              <div className="space-y-4 mb-6">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="relative w-14 h-14 bg-white rounded-md overflow-hidden flex-shrink-0">
                      {item.product?.images?.[0]?.url ? (
                        <Image
                          src={item.product.images[0].url}
                          alt={item.product.name || ""}
                          fill
                          className="object-contain p-1.5"
                          sizes="56px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#502e23]/40 text-xs">
                          –
                        </div>
                      )}
                      {item.quantity > 1 && (
                        <div className="absolute -top-1 -right-1 bg-[#ff6b35] text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                          {item.quantity}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-[#1a1a1a] line-clamp-1">
                        {item.product?.name}
                      </p>
                      <p className="text-xs text-[#502e23]/65">{formatPrice(item.price)}</p>
                    </div>
                    <span className="text-sm font-semibold">{formatPrice(item.price_total)}</span>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="mb-4">
                <h3 className="text-sm font-medium mb-3 text-[#1a1a1a]">Κουπόνι</h3>
                {appliedCoupon ? (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-green-700" />
                        <span className="text-sm font-medium text-green-800">
                          {appliedCoupon.name || appliedCoupon.code}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-green-700">
                        -{formatPrice(discountTotal)}
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={removeCoupon}
                      className="w-full text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Αφαίρεση
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="Κωδικός κουπονιού"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleApplyCoupon}
                        disabled={!couponInput.trim() || isApplyingCoupon}
                        className="whitespace-nowrap bg-transparent"
                      >
                        {isApplyingCoupon ? "Εφαρμογή..." : "Εφαρμογή"}
                      </Button>
                    </div>
                    {couponError && <p className="text-sm text-red-600">{couponError}</p>}
                  </div>
                )}
              </div>

              <Separator className="my-4" />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#502e23]">Υποσύνολο</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {discountTotal > 0 && (
                  <div className="flex justify-between text-green-700">
                    <span>Έκπτωση</span>
                    <span>-{formatPrice(discountTotal)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-[#502e23]">Μεταφορικά</span>
                  {isFreeShipping ? (
                    <span className="text-green-700">Δωρεάν</span>
                  ) : (
                    <span>{formatPrice(shippingCost)}</span>
                  )}
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-bold text-lg pt-1">
                  <span>Σύνολο</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
