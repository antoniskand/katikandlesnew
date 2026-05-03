// lib/supabase-api.ts
// Replaces lib/swell-direct-api.ts — all data access via Supabase
// Images are Vercel Blob URLs stored in products.images JSONB

import { createClient, type SupabaseClient } from "@supabase/supabase-js"

// ─── CLIENTS ───────────────────────────────────────

let serverClient: SupabaseClient | null = null

export function getServerClient(): SupabaseClient {
  if (serverClient) return serverClient
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  serverClient = createClient(url, key)
  return serverClient
}

export function getPublicClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createClient(url, key)
}

// ─── TYPES ─────────────────────────────────────────

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
  coupon_id?: string
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

export interface Page {
  id: string
  name: string
  slug: string
  content?: string
  meta_description?: string
  active: boolean
}

// ─── TRANSFORM HELPERS ─────────────────────────────

function normalizeImages(images: unknown): ProductImage[] {
  if (!images) return []
  if (!Array.isArray(images)) return []
  return images.map((img: any) => ({
    url: img.url || "",
    alt: img.alt || "",
  }))
}

function transformProductRow(row: any): Product {
  const categories: Category[] = []
  if (row.product_categories) {
    for (const pc of row.product_categories) {
      if (pc.categories) {
        categories.push(pc.categories)
      }
    }
  }

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description || "",
    price: Number(row.price) || 0,
    sale_price: row.sale_price ? Number(row.sale_price) : null,
    currency: row.currency || "EUR",
    images: normalizeImages(row.images),
    stock_status: row.stock_status || "in_stock",
    stock_level: row.stock_level ?? undefined,
    stock_tracking: row.stock_tracking || false,
    active: row.active !== false,
    attributes: row.attributes || {},
    sort_order: row.sort_order || 0,
    categories,
    variants: row.product_variants || [],
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

// ─── PRODUCTS ──────────────────────────────────────

export async function getProducts(params: {
  limit?: number
  page?: number
  category?: string
  search?: string
  sort?: string
  activeOnly?: boolean
} = {}): Promise<{ results: Product[]; count: number }> {
  const supabase = getServerClient()
  const { limit = 100, page = 1, category, search, sort, activeOnly = true } = params
  const offset = (page - 1) * limit

  // If filtering by category, do a 2-step query
  if (category) {
    return getProductsByCategory(category, limit, offset, activeOnly)
  }

  let query = supabase
    .from("products")
    .select(`
      *,
      product_categories(category_id, categories(*)),
      product_variants(*)
    `, { count: "exact" })

  if (activeOnly) {
    query = query.eq("active", true)
  }

  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
  }

  if (sort === "price_asc") {
    query = query.order("price", { ascending: true })
  } else if (sort === "price_desc") {
    query = query.order("price", { ascending: false })
  } else if (sort === "newest") {
    query = query.order("created_at", { ascending: false })
  } else {
    query = query.order("sort_order").order("created_at", { ascending: false })
  }

  query = query.range(offset, offset + limit - 1)

  const { data, error, count } = await query

  if (error) {
    console.error("Error fetching products:", error)
    return { results: [], count: 0 }
  }

  return {
    results: (data || []).map(transformProductRow),
    count: count || 0,
  }
}

async function getProductsByCategory(
  categorySlug: string,
  limit: number,
  offset: number,
  activeOnly: boolean
): Promise<{ results: Product[]; count: number }> {
  const supabase = getServerClient()

  // Get category ID
  const { data: cat } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", categorySlug)
    .single()

  if (!cat) return { results: [], count: 0 }

  // Get product IDs in category
  const { data: pcs } = await supabase
    .from("product_categories")
    .select("product_id")
    .eq("category_id", cat.id)

  if (!pcs || pcs.length === 0) return { results: [], count: 0 }

  const productIds = pcs.map((pc) => pc.product_id)

  let query = supabase
    .from("products")
    .select(`
      *,
      product_categories(category_id, categories(*)),
      product_variants(*)
    `, { count: "exact" })
    .in("id", productIds)

  if (activeOnly) {
    query = query.eq("active", true)
  }

  query = query.order("sort_order").order("created_at", { ascending: false })
  query = query.range(offset, offset + limit - 1)

  const { data, error, count } = await query

  if (error) {
    console.error("Error fetching products by category:", error)
    return { results: [], count: 0 }
  }

  return {
    results: (data || []).map(transformProductRow),
    count: count || 0,
  }
}

export async function getProduct(slug: string): Promise<Product | null> {
  const supabase = getServerClient()

  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      product_categories(category_id, categories(*)),
      product_variants(*)
    `)
    .eq("slug", slug)
    .eq("active", true)
    .single()

  if (error || !data) return null
  return transformProductRow(data)
}

export async function getProductById(id: string): Promise<Product | null> {
  const supabase = getServerClient()

  const { data, error } = await supabase
    .from("products")
    .select(`*, product_variants(*)`)
    .eq("id", id)
    .single()

  if (error || !data) return null
  return transformProductRow(data)
}

export async function getAllProductSlugs(): Promise<string[]> {
  const supabase = getServerClient()
  const { data } = await supabase
    .from("products")
    .select("slug")
    .eq("active", true)

  return (data || []).map((p) => p.slug)
}

// ─── CATEGORIES ────────────────────────────────────

export async function getCategory(slug: string): Promise<Category | null> {
  const supabase = getServerClient()
  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .single()
  return data as Category | null
}

export async function getCategories(): Promise<Category[]> {
  const supabase = getServerClient()
  const { data } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order")
  return (data || []) as Category[]
}

// ─── COUPONS ───────────────────────────────────────

export async function validateCoupon(code: string): Promise<Coupon | null> {
  const supabase = getServerClient()

  const { data } = await supabase
    .from("coupons")
    .select("*")
    .eq("code", code.toUpperCase().trim())
    .eq("active", true)
    .single()

  if (!data) return null

  const coupon = data as Coupon
  const now = new Date()

  if (coupon.expires_at && new Date(coupon.expires_at) < now) return null
  if (coupon.starts_at && new Date(coupon.starts_at) > now) return null
  if (coupon.max_uses && coupon.times_used >= coupon.max_uses) return null

  return coupon
}

export function calculateDiscount(coupon: Coupon, subtotal: number): number {
  if (coupon.min_order_amount && subtotal < coupon.min_order_amount) return 0

  switch (coupon.discount_type) {
    case "percent":
      return Math.round((subtotal * (coupon.discount_percent || 0)) / 100 * 100) / 100
    case "fixed":
      return Math.min(coupon.discount_amount || 0, subtotal)
    case "shipping":
      return 0 // shipping discount handled separately
    default:
      return 0
  }
}

export async function incrementCouponUsage(couponId: string): Promise<void> {
  const supabase = getServerClient()
  const { error } = await supabase.rpc("increment_coupon_usage", { p_coupon_id: couponId })
  if (error) console.error("Error incrementing coupon usage:", error)
}

// ─── ORDERS ────────────────────────────────────────

export async function createOrder(orderData: {
  customer_email: string
  customer_first_name: string
  customer_last_name: string
  customer_phone: string
  shipping_address1: string
  shipping_address2?: string
  shipping_city: string
  shipping_state?: string
  shipping_zip: string
  shipping_country?: string
  shipping_method: string
  shipping_method_name: string
  shipping_price: number
  subtotal: number
  discount_total?: number
  shipping_total?: number
  grand_total: number
  coupon_code?: string
  coupon_id?: string
  stripe_session_id?: string
  stripe_payment_intent_id?: string
  payment_method?: string
  payment_status?: string
  status?: string
  items: Array<{
    product_id: string
    variant_id?: string
    product_name: string
    product_image_url?: string
    price: number
    quantity: number
    line_total: number
  }>
  metadata?: Record<string, unknown>
}): Promise<Order | null> {
  const supabase = getServerClient()

  const { items, ...orderFields } = orderData

  // Insert order
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      ...orderFields,
      order_number: "", // trigger generates it
      shipping_total: orderData.shipping_price,
    })
    .select()
    .single()

  if (orderError || !order) {
    console.error("Error creating order:", orderError)
    return null
  }

  // Insert order items
  if (items.length > 0) {
    const orderItems = items.map((item) => ({
      ...item,
      order_id: order.id,
    }))

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems)

    if (itemsError) {
      console.error("Error creating order items:", itemsError)
    }
  }

  // Increment coupon usage
  if (orderData.coupon_id) {
    await incrementCouponUsage(orderData.coupon_id)
  }

  return order as Order
}

export async function getOrder(id: string): Promise<Order | null> {
  const supabase = getServerClient()

  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .single()

  if (!order) return null

  const { data: items } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", id)

  return { ...order, items: items || [] } as Order
}

export async function getOrderByStripeSession(sessionId: string): Promise<Order | null> {
  const supabase = getServerClient()

  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("stripe_session_id", sessionId)
    .single()

  if (!order) return null

  const { data: items } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", order.id)

  return { ...order, items: items || [] } as Order
}

export async function updateOrderStatus(
  orderId: string,
  status: string,
  paymentStatus?: string,
  extraFields?: Record<string, unknown>
): Promise<Order | null> {
  const supabase = getServerClient()

  const updateData: Record<string, unknown> = { status }
  if (paymentStatus) updateData.payment_status = paymentStatus
  if (extraFields) Object.assign(updateData, extraFields)

  const { data, error } = await supabase
    .from("orders")
    .update(updateData)
    .eq("id", orderId)
    .select()
    .single()

  if (error) {
    console.error("Error updating order:", error)
    return null
  }

  return data as Order
}

export async function getOrders(params: {
  limit?: number
  page?: number
  status?: string
} = {}): Promise<{ results: Order[]; count: number }> {
  const supabase = getServerClient()
  const { limit = 50, page = 1, status } = params
  const offset = (page - 1) * limit

  let query = supabase
    .from("orders")
    .select("*", { count: "exact" })

  if (status) {
    query = query.eq("status", status)
  }

  query = query.order("created_at", { ascending: false })
  query = query.range(offset, offset + limit - 1)

  const { data, error, count } = await query

  if (error) {
    console.error("Error fetching orders:", error)
    return { results: [], count: 0 }
  }

  return { results: (data || []) as Order[], count: count || 0 }
}

// ─── PAGES ─────────────────────────────────────────

export async function getPage(slug: string): Promise<Page | null> {
  const supabase = getServerClient()

  const { data } = await supabase
    .from("pages")
    .select("*")
    .eq("slug", slug)
    .eq("active", true)
    .single()

  return data as Page | null
}

export async function getPages(): Promise<Page[]> {
  const supabase = getServerClient()
  const { data } = await supabase.from("pages").select("*").order("name")
  return (data || []) as Page[]
}

// ─── DROPS ─────────────────────────────────────────

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
  sort_order: number
  created_at: string
  updated_at: string
}

export async function getFeaturedDrop(): Promise<{
  drop: Drop | null
  products: Product[]
}> {
  const supabase = getServerClient()

  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from("drops")
    .select("*")
    .eq("active", true)
    .eq("featured", true)
    .or(`starts_at.is.null,starts_at.lte.${now}`)
    .or(`ends_at.is.null,ends_at.gte.${now}`)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error || !data) return { drop: null, products: [] }

  const drop = data as Drop
  let products: Product[] = []

  if (drop.product_ids?.length) {
    const { data: rows } = await supabase
      .from("products")
      .select("*, product_categories(category_id, categories(*)), product_variants(*)")
      .in("id", drop.product_ids)
      .eq("active", true)

    products = (rows || []).map(transformProductRow)
  }

  return { drop, products }
}

export async function getDrops(): Promise<Drop[]> {
  const supabase = getServerClient()
  const { data } = await supabase
    .from("drops")
    .select("*")
    .order("sort_order")
    .order("created_at", { ascending: false })
  return (data || []) as Drop[]
}

// ─── STOCK HELPERS ─────────────────────────────────

export async function decrementStock(
  productId: string,
  quantity: number,
  variantId?: string
): Promise<boolean> {
  const supabase = getServerClient()

  if (variantId) {
    const { error } = await supabase.rpc("decrement_variant_stock", {
      p_variant_id: variantId,
      p_quantity: quantity,
    })
    return !error
  }

  // Simple decrement for product
  const { data: product } = await supabase
    .from("products")
    .select("stock_level, stock_tracking")
    .eq("id", productId)
    .single()

  if (!product || !product.stock_tracking) return true

  const newLevel = Math.max(0, (product.stock_level || 0) - quantity)
  const newStatus = newLevel === 0 ? "out_of_stock" : newLevel <= 5 ? "low_stock" : "in_stock"

  const { error } = await supabase
    .from("products")
    .update({ stock_level: newLevel, stock_status: newStatus })
    .eq("id", productId)

  return !error
}

// ─── SHIPPING HELPERS ──────────────────────────────

const FREE_SHIPPING_THRESHOLD = 30
const STANDARD_SHIPPING_PRICE = 2

export function calculateShipping(subtotal: number): number {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_PRICE
}

export function isFreeShipping(subtotal: number): boolean {
  return subtotal >= FREE_SHIPPING_THRESHOLD
}
