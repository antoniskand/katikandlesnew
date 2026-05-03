"use client"
import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
import Link from "next/link"
import { useCart } from "@/context/cart-context"

interface CartButtonProps {
  className?: string
  buttonText?: string
}

export function CartButton({ className = "", buttonText = "Go to Cart" }: CartButtonProps) {
  // Fix: Use cartCount instead of cartItems
  const { cartCount } = useCart()

  return (
    <Link href="/cart" className={`${className} relative`}>
      <Button variant="outline" className="w-full bg-black hover:bg-gray-800 text-white border-black">
        <ShoppingCart className="mr-2 h-5 w-5" />
        {buttonText}
      </Button>
      {/* Fix: Use cartCount instead of cartItems */}
      {cartCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
          {cartCount}
        </span>
      )}
    </Link>
  )
}
