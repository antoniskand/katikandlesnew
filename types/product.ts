// types/product.ts

export interface ProductImage {
  url: string
  alt?: string
}

export interface Product {
  id: string
  name: string
  slug: string
  description?: string
  price: number
  sale_price?: number | null
  currency: string
  images: ProductImage[]
  stock_status: "in_stock" | "out_of_stock" | "low_stock"
  stock_level?: number
  stock_tracking: boolean
  active: boolean
  attributes: Record<string, unknown>
  sort_order: number
  categories?: Category[]
  variants?: ProductVariant[]
  created_at: string
  updated_at: string
}

export interface ProductVariant {
  id: string
  product_id: string
  name: string
  price?: number | null
  stock_level: number
  option_values: Record<string, string>
  active: boolean
  sort_order: number
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image_url?: string
  sort_order: number
}

export interface CartItem {
  id: string
  product_id: string
  variant_id?: string
  product: {
    name: string
    slug: string
    price: number
    sale_price?: number | null
    currency: string
    images: ProductImage[]
  }
  quantity: number
  price: number
  price_total: number
}

export interface Cart {
  items: CartItem[]
  item_quantity: number
  sub_total: number
  discount_total: number
  shipping_total: number
  grand_total: number
  currency: string
  coupon?: {
    code: string
    name?: string
    discount_type: string
    discount_amount?: number
    discount_percent?: number
  } | null
}

export interface Order {
  id: string
  order_number: string
  status: string
  customer_email?: string
  customer_first_name?: string
  customer_last_name?: string
  customer_phone?: string
  shipping_address1?: string
  shipping_address2?: string
  shipping_city?: string
  shipping_state?: string
  shipping_zip?: string
  shipping_country?: string
  shipping_method?: string
  shipping_method_name?: string
  shipping_price: number
  currency: string
  subtotal: number
  discount_total: number
  shipping_total: number
  grand_total: number
  coupon_code?: string
  payment_method: string
  payment_status: string
  stripe_session_id?: string
  stripe_payment_intent_id?: string
  notes?: string
  metadata: Record<string, unknown>
  items?: OrderItem[]
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id?: string
  variant_id?: string
  product_name: string
  product_image_url?: string
  price: number
  quantity: number
  line_total: number
}

export interface Coupon {
  id: string
  code: string
  name?: string
  description?: string
  discount_type: "percent" | "fixed" | "shipping"
  discount_amount?: number
  discount_percent?: number
  min_order_amount?: number
  max_uses?: number
  times_used: number
  active: boolean
  starts_at?: string
  expires_at?: string
}

export interface Page {
  id: string
  name: string
  slug: string
  content?: string
  meta_description?: string
  active: boolean
}

export interface Drop {
  id: string
  name: string
  slug: string
  tagline?: string
  description?: string
  badge_text?: string
  starts_at?: string
  ends_at?: string
  hero_image_url?: string
  background_color?: string
  active: boolean
  featured: boolean
  product_ids: string[]
  products?: Product[]
  sort_order: number
  created_at: string
  updated_at: string
}

export interface AdminUser {
  id: string
  email: string
  role: "owner" | "admin" | "editor"
  display_name?: string
  created_at: string
}
