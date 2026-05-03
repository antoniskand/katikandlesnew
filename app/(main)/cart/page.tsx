"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Minus, Plus, Trash2 } from "lucide-react"
import { useCart } from "@/context/cart-context"

export default function CartPage() {
  const router = useRouter()
  const { cart, isLoading, removeItem, updateItemQuantity } = useCart()

  const getShippingCost = () => (cart.sub_total >= 30 ? 0 : 2)
  const getFinalTotal = () => Math.round((cart.sub_total - cart.discount_total + getShippingCost()) * 100) / 100

  if (isLoading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#f8e7ce' }}>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-8">Your Cart</h1>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto" />
            <p className="mt-4 text-gray-600">Loading your cart...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#f8e7ce' }}>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
            <p className="text-gray-600 mb-6">Add some beautiful candles to get started!</p>
            <Button asChild className="bg-black hover:bg-gray-800 text-white"><a href="/">Continue Shopping</a></Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8e7ce' }}>
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="mb-6 md:mb-8"><h1 className="text-2xl md:text-3xl font-bold">Your Cart</h1></div>
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {cart.items.map((item) => {
                const imageUrl = item.product?.images?.[0]?.url || "/placeholder.svg?height=80&width=80"
                const productName = item.product?.name || "Product"
                return (
                  <div key={item.id} className="border rounded-lg p-4">
                    {/* Mobile */}
                    <div className="block md:hidden">
                      <div className="flex gap-3 mb-3">
                        <img src={imageUrl} alt={productName} className="w-16 h-16 object-cover rounded flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm leading-tight mb-1 line-clamp-2">{productName}</h3>
                          <p className="text-gray-600 text-sm">€{item.price.toFixed(2)}</p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-700 p-1 h-8 w-8">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm" onClick={() => updateItemQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1} className="h-8 w-8 p-0"><Minus className="h-3 w-3" /></Button>
                          <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                          <Button variant="outline" size="sm" onClick={() => updateItemQuantity(item.id, item.quantity + 1)} className="h-8 w-8 p-0"><Plus className="h-3 w-3" /></Button>
                        </div>
                        <p className="font-semibold">€{item.price_total.toFixed(2)}</p>
                      </div>
                    </div>
                    {/* Desktop */}
                    <div className="hidden md:flex items-center space-x-4">
                      <img src={imageUrl} alt={productName} className="w-20 h-20 object-cover rounded" />
                      <div className="flex-1">
                        <h3 className="font-semibold">{productName}</h3>
                        <p className="text-gray-600">€{item.price.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" onClick={() => updateItemQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1}><Minus className="h-4 w-4" /></Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button variant="outline" size="sm" onClick={() => updateItemQuantity(item.id, item.quantity + 1)}><Plus className="h-4 w-4" /></Button>
                      </div>
                      <div className="text-right w-28"><p className="font-semibold">€{item.price_total.toFixed(2)}</p></div>
                      <Button variant="ghost" size="sm" onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-700"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="bg-gray-50 p-4 md:p-6 rounded-lg sticky top-4">
              <h2 className="text-lg md:text-xl font-semibold mb-4">Σύνοψη Παραγγελίας</h2>
              <div className="space-y-2 mb-4 text-sm md:text-base">
                <div className="flex justify-between"><span>Προϊόντα ({cart.item_quantity})</span><span>€{cart.sub_total.toFixed(2)}</span></div>
                {cart.discount_total > 0 && (
                  <div className="flex justify-between text-green-600"><span>Έκπτωση {cart.coupon?.code ? `(${cart.coupon.code})` : ""}</span><span>-€{cart.discount_total.toFixed(2)}</span></div>
                )}
                <div className="flex justify-between">
                  <span>Μεταφορικά</span>
                  {getShippingCost() === 0 ? <span className="text-green-600 font-semibold">Δωρεάν</span> : <span>€{getShippingCost().toFixed(2)}</span>}
                </div>
                {cart.sub_total < 30 && cart.sub_total > 0 && (
                  <div className="text-xs md:text-sm text-gray-500">Προσθέστε €{(30 - cart.sub_total).toFixed(2)} ακόμα για δωρεάν μεταφορικά</div>
                )}
                <hr className="my-2" />
                <div className="flex justify-between font-semibold text-base md:text-lg"><span>Σύνολο</span><span>€{getFinalTotal().toFixed(2)}</span></div>
              </div>
              <Button className="w-full bg-black hover:bg-gray-800 text-white" size="lg" onClick={() => router.push("/checkout")}>Ολοκληρωση Παραγγελιας</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
