-- 001_initial.sql
-- Initial schema for Kati Kandles on Neon Postgres.
-- No Supabase RLS, no auth.users FK — auth is handled at the app layer (Stack Auth + admin_users).
-- Run this in the Neon SQL Editor (or via `psql $DATABASE_URL -f 001_initial.sql`).
-- The Drizzle schema in lib/db/schema.ts mirrors this.

-- ============================================================
-- Extensions
-- ============================================================
create extension if not exists "pgcrypto";  -- for gen_random_uuid()

-- ============================================================
-- updated_at trigger function
-- ============================================================
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================
-- Categories
-- ============================================================
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists categories_sort_idx on categories (sort_order);
create trigger categories_set_updated_at
  before update on categories
  for each row execute function set_updated_at();

-- ============================================================
-- Products
-- ============================================================
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  price numeric(10, 2) not null,
  sale_price numeric(10, 2),
  currency text not null default 'EUR',
  images jsonb not null default '[]'::jsonb,
  stock_status text not null default 'in_stock',
  stock_level int default 0,
  stock_tracking boolean not null default false,
  active boolean not null default true,
  attributes jsonb not null default '{}'::jsonb,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists products_active_idx on products (active);
create index if not exists products_created_idx on products (created_at);
create trigger products_set_updated_at
  before update on products
  for each row execute function set_updated_at();

-- ============================================================
-- Product ↔ Category (many-to-many)
-- ============================================================
create table if not exists product_categories (
  product_id uuid not null references products(id) on delete cascade,
  category_id uuid not null references categories(id) on delete cascade,
  primary key (product_id, category_id)
);

-- ============================================================
-- Product variants
-- ============================================================
create table if not exists product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  name text not null,
  price numeric(10, 2),
  stock_level int not null default 0,
  option_values jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ============================================================
-- Coupons
-- ============================================================
create table if not exists coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text,
  description text,
  discount_type text not null check (discount_type in ('percent', 'fixed', 'shipping')),
  discount_amount numeric(10, 2),
  discount_percent numeric(5, 2),
  min_order_amount numeric(10, 2),
  max_uses int,
  times_used int not null default 0,
  active boolean not null default true,
  starts_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

-- ============================================================
-- Orders
-- ============================================================
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  status text not null default 'pending',
  customer_email text,
  customer_first_name text,
  customer_last_name text,
  customer_phone text,
  shipping_address1 text,
  shipping_address2 text,
  shipping_city text,
  shipping_state text,
  shipping_zip text,
  shipping_country text default 'GR',
  shipping_method text,
  shipping_method_name text,
  shipping_price numeric(10, 2) not null default 0,
  currency text not null default 'EUR',
  subtotal numeric(10, 2) not null default 0,
  discount_total numeric(10, 2) not null default 0,
  shipping_total numeric(10, 2) not null default 0,
  grand_total numeric(10, 2) not null default 0,
  coupon_code text,
  coupon_id uuid references coupons(id) on delete set null,
  payment_method text,
  payment_status text default 'pending',
  stripe_session_id text,
  stripe_payment_intent_id text,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists orders_status_idx on orders (status);
create index if not exists orders_email_idx on orders (customer_email);
create index if not exists orders_stripe_session_idx on orders (stripe_session_id);
create index if not exists orders_stripe_pi_idx on orders (stripe_payment_intent_id);
create index if not exists orders_created_idx on orders (created_at);
create trigger orders_set_updated_at
  before update on orders
  for each row execute function set_updated_at();

-- ============================================================
-- Order items
-- ============================================================
create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  variant_id uuid references product_variants(id) on delete set null,
  product_name text not null,
  product_image_url text,
  price numeric(10, 2) not null,
  quantity int not null default 1,
  line_total numeric(10, 2) not null,
  created_at timestamptz not null default now()
);

-- ============================================================
-- CMS pages
-- ============================================================
create table if not exists pages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  content text,
  meta_description text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger pages_set_updated_at
  before update on pages
  for each row execute function set_updated_at();

-- ============================================================
-- Drops
-- ============================================================
create table if not exists drops (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  tagline text,
  description text,
  badge_text text default 'limited drop',
  starts_at timestamptz,
  ends_at timestamptz,
  hero_image_url text,
  background_color text default '#ff6b35',
  active boolean not null default true,
  featured boolean not null default false,
  product_ids jsonb not null default '[]'::jsonb,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists drops_active_idx on drops (active);
create index if not exists drops_featured_idx on drops (featured);
create trigger drops_set_updated_at
  before update on drops
  for each row execute function set_updated_at();

-- ============================================================
-- Newsletter subscribers
-- ============================================================
create table if not exists newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  status text not null default 'active' check (status in ('active', 'unsubscribed')),
  source text default 'website',
  subscribed_at timestamptz not null default now()
);

-- ============================================================
-- Admin users (id = Stack Auth user id, stored as text)
-- ============================================================
create table if not exists admin_users (
  id text primary key,
  email text not null unique,
  display_name text,
  role text not null default 'admin' check (role in ('owner', 'admin', 'editor')),
  created_at timestamptz not null default now()
);

-- ============================================================
-- Site settings (key/value)
-- ============================================================
create table if not exists site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
create trigger site_settings_set_updated_at
  before update on site_settings
  for each row execute function set_updated_at();

-- ============================================================
-- Seed defaults
-- ============================================================
insert into categories (name, slug, sort_order) values
  ('Κεριά', 'candles', 0),
  ('Wax Melts', 'wax-melts', 1),
  ('Αρωματικά', 'aromatics', 2),
  ('Αρωματικά αυτοκινήτου', 'car-diffuser', 3)
on conflict (slug) do nothing;

insert into site_settings (key, value) values
  ('shipping', '{"free_threshold": 30, "courier_price": 2, "boxnow_price": 2}'::jsonb),
  ('contact', '{"email": "hello@katikandles.gr", "instagram": "katikandles", "tiktok": "katikandles"}'::jsonb),
  ('hero', '{"caption": "χειροποίητα αρωματικά σόγιας", "headline": "smells like\nwhateverness"}'::jsonb)
on conflict (key) do nothing;
