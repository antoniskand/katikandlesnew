-- ============================================
-- Kati Kandles — Supabase Migration Schema
-- Run this in Supabase SQL Editor
-- Images are stored as Vercel Blob URLs in JSONB
-- ============================================

-- 1. CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. PRODUCTS
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  sale_price NUMERIC(10,2),
  currency TEXT DEFAULT 'EUR',
  images JSONB DEFAULT '[]'::jsonb,
  -- images format: [{"url": "https://xxxx.public.blob.vercel-storage.com/...", "alt": "..."}]
  stock_status TEXT DEFAULT 'in_stock' CHECK (stock_status IN ('in_stock', 'out_of_stock', 'low_stock')),
  stock_level INTEGER DEFAULT 0,
  stock_tracking BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  attributes JSONB DEFAULT '{}'::jsonb,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. PRODUCT <-> CATEGORY (many-to-many)
CREATE TABLE IF NOT EXISTS product_categories (
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, category_id)
);

-- 4. PRODUCT VARIANTS
CREATE TABLE IF NOT EXISTS product_variants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  price NUMERIC(10,2),
  stock_level INTEGER DEFAULT 0,
  option_values JSONB DEFAULT '{}'::jsonb,
  active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. COUPONS
CREATE TABLE IF NOT EXISTS coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percent', 'fixed', 'shipping')),
  discount_amount NUMERIC(10,2),
  discount_percent NUMERIC(5,2),
  min_order_amount NUMERIC(10,2),
  max_uses INTEGER,
  times_used INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. ORDERS
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE DEFAULT '',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','payment_pending','paid','processing','shipped','delivered','cancelled','refunded')),
  customer_email TEXT,
  customer_first_name TEXT,
  customer_last_name TEXT,
  customer_phone TEXT,
  shipping_address1 TEXT,
  shipping_address2 TEXT,
  shipping_city TEXT,
  shipping_state TEXT,
  shipping_zip TEXT,
  shipping_country TEXT DEFAULT 'GR',
  shipping_method TEXT,
  shipping_method_name TEXT,
  shipping_price NUMERIC(10,2) DEFAULT 0,
  currency TEXT DEFAULT 'EUR',
  subtotal NUMERIC(10,2) DEFAULT 0,
  discount_total NUMERIC(10,2) DEFAULT 0,
  shipping_total NUMERIC(10,2) DEFAULT 0,
  grand_total NUMERIC(10,2) DEFAULT 0,
  coupon_code TEXT,
  coupon_id UUID REFERENCES coupons(id),
  payment_method TEXT DEFAULT 'vivawallet',
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending','completed','failed','refunded')),
  viva_order_code TEXT,
  viva_transaction_id TEXT,
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. ORDER ITEMS
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_image_url TEXT,
  price NUMERIC(10,2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  line_total NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. CMS PAGES
CREATE TABLE IF NOT EXISTS pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT,
  meta_description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_products_created ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_viva_code ON orders(viva_order_code);
CREATE INDEX IF NOT EXISTS idx_orders_viva_tx ON orders(viva_transaction_id);
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);

-- ============================================
-- AUTO-INCREMENT ORDER NUMBER
-- ============================================
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number := 'KK-' || LPAD(nextval('order_number_seq')::TEXT, 5, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_order_number ON orders;
CREATE TRIGGER set_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION generate_order_number();

-- ============================================
-- AUTO-UPDATE updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS products_updated_at ON products;
CREATE TRIGGER products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS categories_updated_at ON categories;
CREATE TRIGGER categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS orders_updated_at ON orders;
CREATE TRIGGER orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS pages_updated_at ON pages;
CREATE TRIGGER pages_updated_at BEFORE UPDATE ON pages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- HELPER: Increment coupon usage
-- ============================================
CREATE OR REPLACE FUNCTION increment_coupon_usage(p_coupon_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE coupons SET times_used = times_used + 1 WHERE id = p_coupon_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Products: public read, service-role write
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Products readable by all" ON products;
CREATE POLICY "Products readable by all" ON products FOR SELECT USING (true);
DROP POLICY IF EXISTS "Products writable by service role" ON products;
CREATE POLICY "Products writable by service role" ON products FOR ALL USING (auth.role() = 'service_role' OR auth.role() = 'authenticated');

-- Categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Categories readable by all" ON categories;
CREATE POLICY "Categories readable by all" ON categories FOR SELECT USING (true);
DROP POLICY IF EXISTS "Categories writable by auth" ON categories;
CREATE POLICY "Categories writable by auth" ON categories FOR ALL USING (auth.role() = 'service_role' OR auth.role() = 'authenticated');

-- Product Categories
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "PC readable by all" ON product_categories;
CREATE POLICY "PC readable by all" ON product_categories FOR SELECT USING (true);
DROP POLICY IF EXISTS "PC writable by auth" ON product_categories;
CREATE POLICY "PC writable by auth" ON product_categories FOR ALL USING (auth.role() = 'service_role' OR auth.role() = 'authenticated');

-- Variants
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Variants readable by all" ON product_variants;
CREATE POLICY "Variants readable by all" ON product_variants FOR SELECT USING (true);
DROP POLICY IF EXISTS "Variants writable by auth" ON product_variants;
CREATE POLICY "Variants writable by auth" ON product_variants FOR ALL USING (auth.role() = 'service_role' OR auth.role() = 'authenticated');

-- Orders: full access for service_role/authenticated, read+insert for anon
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Orders full access auth" ON orders;
CREATE POLICY "Orders full access auth" ON orders FOR ALL USING (auth.role() = 'service_role' OR auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Orders insertable by anon" ON orders;
CREATE POLICY "Orders insertable by anon" ON orders FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Orders readable by anon" ON orders;
CREATE POLICY "Orders readable by anon" ON orders FOR SELECT USING (true);

-- Order Items
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "OI full access" ON order_items;
CREATE POLICY "OI full access" ON order_items FOR ALL USING (true);

-- Coupons: public read, auth write
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Coupons readable by all" ON coupons;
CREATE POLICY "Coupons readable by all" ON coupons FOR SELECT USING (true);
DROP POLICY IF EXISTS "Coupons writable by auth" ON coupons;
CREATE POLICY "Coupons writable by auth" ON coupons FOR ALL USING (auth.role() = 'service_role' OR auth.role() = 'authenticated');

-- Pages: public read
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Pages readable by all" ON pages;
CREATE POLICY "Pages readable by all" ON pages FOR SELECT USING (true);
DROP POLICY IF EXISTS "Pages writable by auth" ON pages;
CREATE POLICY "Pages writable by auth" ON pages FOR ALL USING (auth.role() = 'service_role' OR auth.role() = 'authenticated');

-- ============================================
-- SEED: Default categories
-- ============================================
INSERT INTO categories (name, slug, description, sort_order) VALUES
  ('Candles', 'candles', 'Χειροποίητα κεριά σόγιας', 1),
  ('Wax Melts', 'wax-melts', 'Αρωματικά wax melts', 2),
  ('Aromatics', 'aromatics', 'Αρωματικά χώρου', 3),
  ('Car Diffuser', 'car-diffuser', 'Αρωματικά αυτοκινήτου', 4)
ON CONFLICT (slug) DO NOTHING;
