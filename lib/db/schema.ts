// lib/db/schema.ts
// Drizzle schema for Kati Kandles eshop on Neon Postgres.

import { sql } from "drizzle-orm"
import {
  pgTable,
  uuid,
  text,
  numeric,
  integer,
  boolean,
  jsonb,
  timestamp,
  primaryKey,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core"

// ============================================================
// Categories
// ============================================================
export const categories = pgTable(
  "categories",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description"),
    imageUrl: text("image_url"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("categories_sort_idx").on(t.sortOrder)],
)

// ============================================================
// Products
// ============================================================
export const products = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description"),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
    salePrice: numeric("sale_price", { precision: 10, scale: 2 }),
    currency: text("currency").notNull().default("EUR"),
    images: jsonb("images").notNull().default(sql`'[]'::jsonb`),
    stockStatus: text("stock_status").notNull().default("in_stock"),
    stockLevel: integer("stock_level").default(0),
    stockTracking: boolean("stock_tracking").notNull().default(false),
    active: boolean("active").notNull().default(true),
    attributes: jsonb("attributes").notNull().default(sql`'{}'::jsonb`),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("products_active_idx").on(t.active),
    index("products_created_idx").on(t.createdAt),
  ],
)

// ============================================================
// Product ↔ Category (many-to-many)
// ============================================================
export const productCategories = pgTable(
  "product_categories",
  {
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.productId, t.categoryId] })],
)

// ============================================================
// Product variants
// ============================================================
export const productVariants = pgTable("product_variants", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }),
  stockLevel: integer("stock_level").notNull().default(0),
  optionValues: jsonb("option_values").notNull().default(sql`'{}'::jsonb`),
  active: boolean("active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})

// ============================================================
// Coupons
// ============================================================
export const coupons = pgTable("coupons", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull().unique(),
  name: text("name"),
  description: text("description"),
  // 'percent' | 'fixed' | 'shipping'
  discountType: text("discount_type").notNull(),
  discountAmount: numeric("discount_amount", { precision: 10, scale: 2 }),
  discountPercent: numeric("discount_percent", { precision: 5, scale: 2 }),
  minOrderAmount: numeric("min_order_amount", { precision: 10, scale: 2 }),
  maxUses: integer("max_uses"),
  timesUsed: integer("times_used").notNull().default(0),
  active: boolean("active").notNull().default(true),
  startsAt: timestamp("starts_at", { withTimezone: true }),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})

// ============================================================
// Orders
// ============================================================
export const orders = pgTable(
  "orders",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    orderNumber: text("order_number").notNull().unique(),
    status: text("status").notNull().default("pending"),
    customerEmail: text("customer_email"),
    customerFirstName: text("customer_first_name"),
    customerLastName: text("customer_last_name"),
    customerPhone: text("customer_phone"),
    shippingAddress1: text("shipping_address1"),
    shippingAddress2: text("shipping_address2"),
    shippingCity: text("shipping_city"),
    shippingState: text("shipping_state"),
    shippingZip: text("shipping_zip"),
    shippingCountry: text("shipping_country").default("GR"),
    shippingMethod: text("shipping_method"),
    shippingMethodName: text("shipping_method_name"),
    shippingPrice: numeric("shipping_price", { precision: 10, scale: 2 }).notNull().default("0"),
    currency: text("currency").notNull().default("EUR"),
    subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull().default("0"),
    discountTotal: numeric("discount_total", { precision: 10, scale: 2 }).notNull().default("0"),
    shippingTotal: numeric("shipping_total", { precision: 10, scale: 2 }).notNull().default("0"),
    grandTotal: numeric("grand_total", { precision: 10, scale: 2 }).notNull().default("0"),
    couponCode: text("coupon_code"),
    couponId: uuid("coupon_id").references(() => coupons.id, { onDelete: "set null" }),
    paymentMethod: text("payment_method"),
    paymentStatus: text("payment_status").default("pending"),
    stripeSessionId: text("stripe_session_id"),
    stripePaymentIntentId: text("stripe_payment_intent_id"),
    notes: text("notes"),
    metadata: jsonb("metadata").notNull().default(sql`'{}'::jsonb`),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("orders_status_idx").on(t.status),
    index("orders_email_idx").on(t.customerEmail),
    index("orders_stripe_session_idx").on(t.stripeSessionId),
    index("orders_stripe_pi_idx").on(t.stripePaymentIntentId),
    index("orders_created_idx").on(t.createdAt),
  ],
)

// ============================================================
// Order items
// ============================================================
export const orderItems = pgTable("order_items", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: uuid("product_id").references(() => products.id, { onDelete: "set null" }),
  variantId: uuid("variant_id").references(() => productVariants.id, { onDelete: "set null" }),
  productName: text("product_name").notNull(),
  productImageUrl: text("product_image_url"),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  quantity: integer("quantity").notNull().default(1),
  lineTotal: numeric("line_total", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})

// ============================================================
// CMS pages
// ============================================================
export const pages = pgTable("pages", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content"),
  metaDescription: text("meta_description"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
})

// ============================================================
// Drops (limited-edition releases)
// ============================================================
export const drops = pgTable(
  "drops",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    tagline: text("tagline"),
    description: text("description"),
    badgeText: text("badge_text").default("limited drop"),
    startsAt: timestamp("starts_at", { withTimezone: true }),
    endsAt: timestamp("ends_at", { withTimezone: true }),
    heroImageUrl: text("hero_image_url"),
    backgroundColor: text("background_color").default("#ff6b35"),
    active: boolean("active").notNull().default(true),
    featured: boolean("featured").notNull().default(false),
    productIds: jsonb("product_ids").notNull().default(sql`'[]'::jsonb`),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("drops_active_idx").on(t.active),
    index("drops_featured_idx").on(t.featured),
  ],
)

// ============================================================
// Newsletter subscribers
// ============================================================
export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  status: text("status").notNull().default("active"),
  source: text("source").default("website"),
  subscribedAt: timestamp("subscribed_at", { withTimezone: true }).notNull().defaultNow(),
})

// ============================================================
// Admin users (linked to Stack Auth user id stored as text)
// ============================================================
export const adminUsers = pgTable("admin_users", {
  // Stack Auth user id (UUID-shaped string)
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  displayName: text("display_name"),
  // 'owner' | 'admin' | 'editor'
  role: text("role").notNull().default("admin"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})

// ============================================================
// Site settings (key/value)
// ============================================================
export const siteSettings = pgTable("site_settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull().default(sql`'{}'::jsonb`),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
})

// ============================================================
// Helpful inferred types
// ============================================================
export type Category = typeof categories.$inferSelect
export type Product = typeof products.$inferSelect
export type ProductVariant = typeof productVariants.$inferSelect
export type Coupon = typeof coupons.$inferSelect
export type Order = typeof orders.$inferSelect
export type OrderItem = typeof orderItems.$inferSelect
export type Page = typeof pages.$inferSelect
export type Drop = typeof drops.$inferSelect
export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect
export type AdminUser = typeof adminUsers.$inferSelect
export type SiteSetting = typeof siteSettings.$inferSelect
