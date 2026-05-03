-- 001_drops_admin_stripe.sql
-- Adds: drops table, admin_users with roles, stripe columns on orders.
-- Removes: viva_* columns (kept temporarily during migration; drop in 002).
-- Run in Supabase SQL Editor.

-- ============================================================
-- 1. DROPS
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
  product_ids uuid[] not null default '{}'::uuid[],
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists drops_active_idx on drops (active);
create index if not exists drops_featured_idx on drops (featured);
create index if not exists drops_slug_idx on drops (slug);

create trigger drops_set_updated_at
  before update on drops
  for each row execute function set_updated_at();

alter table drops enable row level security;

create policy "drops are viewable by everyone"
  on drops for select
  using (active = true);

create policy "drops are editable by authenticated users"
  on drops for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ============================================================
-- 2. ADMIN USERS WITH ROLES
-- ============================================================
create table if not exists admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  display_name text,
  role text not null default 'admin' check (role in ('owner', 'admin', 'editor')),
  created_at timestamptz not null default now()
);

alter table admin_users enable row level security;

create policy "admin users readable by authenticated"
  on admin_users for select
  using (auth.role() = 'authenticated');

create policy "admin users manageable by owner"
  on admin_users for all
  using (
    exists (
      select 1 from admin_users
      where id = auth.uid() and role = 'owner'
    )
  );

-- Helper function: is_admin(uid)
create or replace function is_admin(uid uuid)
returns boolean
language sql security definer
as $$
  select exists(select 1 from admin_users where id = uid)
$$;

-- ============================================================
-- 3. STRIPE COLUMNS ON ORDERS
-- ============================================================
alter table orders
  add column if not exists stripe_session_id text,
  add column if not exists stripe_payment_intent_id text;

create index if not exists orders_stripe_session_idx on orders (stripe_session_id);
create index if not exists orders_stripe_pi_idx on orders (stripe_payment_intent_id);

-- ============================================================
-- 4. SITE SETTINGS (key/value for admin-editable config)
-- ============================================================
create table if not exists site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create trigger site_settings_set_updated_at
  before update on site_settings
  for each row execute function set_updated_at();

alter table site_settings enable row level security;

create policy "site settings readable by everyone"
  on site_settings for select using (true);

create policy "site settings writable by authenticated"
  on site_settings for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Seed defaults
insert into site_settings (key, value) values
  ('shipping', '{"free_threshold": 30, "courier_price": 2, "boxnow_price": 2}'::jsonb),
  ('contact', '{"email": "hello@katikandles.gr", "instagram": "katikandles", "tiktok": "katikandles"}'::jsonb),
  ('hero', '{"caption": "χειροποίητα αρωματικά σόγιας", "headline": "smells like\\nwhateverness"}'::jsonb)
on conflict (key) do nothing;

-- ============================================================
-- 5. NEWSLETTER SUBSCRIBERS (was missing)
-- ============================================================
create table if not exists newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  status text not null default 'active' check (status in ('active', 'unsubscribed')),
  source text default 'website',
  subscribed_at timestamptz not null default now()
);

alter table newsletter_subscribers enable row level security;

create policy "anyone can subscribe"
  on newsletter_subscribers for insert
  with check (true);

create policy "subscribers visible to authenticated"
  on newsletter_subscribers for select
  using (auth.role() = 'authenticated');

create policy "subscribers manageable by authenticated"
  on newsletter_subscribers for update
  using (auth.role() = 'authenticated');
