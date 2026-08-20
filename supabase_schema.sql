-- =========================================================================
-- SUPABASE POSTGRES SCHEMA FOR PRAX STUDIO STREETWEAR E-COMMERCE
-- =========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  original_price NUMERIC(10, 2),
  rating NUMERIC(3, 1) DEFAULT 5.0,
  reviews_count INT DEFAULT 0,
  description TEXT NOT NULL,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  sizes JSONB NOT NULL DEFAULT '[]'::jsonb,
  colors JSONB NOT NULL DEFAULT '[]'::jsonb,
  images JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_new BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  in_stock BOOLEAN DEFAULT true,
  stock_count INT DEFAULT 0,
  tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  sku TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.reviews (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_avatar TEXT,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT NOT NULL,
  comment TEXT NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  verified BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CUSTOM USERS / PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT, -- Stores password hash or plain legacy pwd (if not using Supabase Auth directly)
  name TEXT NOT NULL,
  phone TEXT DEFAULT '',
  avatar TEXT DEFAULT '',
  addresses JSONB NOT NULL DEFAULT '[]'::jsonb,
  payment_methods JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT DEFAULT '',
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  shipping_address JSONB NOT NULL DEFAULT '{}'::jsonb,
  shipping_method JSONB NOT NULL DEFAULT '{}'::jsonb,
  payment_method JSONB NOT NULL DEFAULT '{}'::jsonb,
  subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0,
  discount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  shipping_fee NUMERIC(10, 2) NOT NULL DEFAULT 0,
  tax NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total NUMERIC(10, 2) NOT NULL DEFAULT 0,
  discount_code_applied TEXT,
  status TEXT NOT NULL DEFAULT 'placed',
  tracking_number TEXT,
  carrier TEXT,
  estimated_delivery TEXT,
  timeline JSONB NOT NULL DEFAULT '[]'::jsonb
);

-- Ensure all columns exist if orders table was created with older schema
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_email TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_name TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_phone TEXT DEFAULT '';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS subtotal NUMERIC(10, 2) DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS discount NUMERIC(10, 2) DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_fee NUMERIC(10, 2) DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS tax NUMERIC(10, 2) DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS total NUMERIC(10, 2) DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS discount_code_applied TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS carrier TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS estimated_delivery TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS timeline JSONB DEFAULT '[]'::jsonb;


-- =========================================================================
-- ROW LEVEL SECURITY (RLS) & POLICIES
-- =========================================================================

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Allow public read access to products, reviews, orders, users
DROP POLICY IF EXISTS "Allow public read access to products" ON public.products;
CREATE POLICY "Allow public read access to products" ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow service role full access to products" ON public.products;
CREATE POLICY "Allow service role full access to products" ON public.products FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public access to reviews" ON public.reviews;
CREATE POLICY "Allow public access to reviews" ON public.reviews FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public access to users" ON public.users;
CREATE POLICY "Allow public access to users" ON public.users FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public access to orders" ON public.orders;
CREATE POLICY "Allow public access to orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);

-- =========================================================================
-- INITIAL SEED DATA FOR PRODUCTS
-- =========================================================================

INSERT INTO public.products (
  id, name, slug, category, price, original_price, rating, reviews_count, description,
  details, sizes, colors, images, is_new, is_featured, in_stock, stock_count, tags, sku
) VALUES 
(
  'sf-h01',
  'SHADOW FAITH Oversized Eye & Bandana Zip Hoodie',
  'shadow-faith-oversized-eye-bandana-zip-hoodie',
  'Hoodies',
  2499,
  2999,
  5.0,
  64,
  'Limited Drop 008 oversized zip hoodie from SHADOW FAITH™. Features a custom zip-up hood with integrated Eye of Faith balaclava mask, hidden smile graphic, bandana "68" lion collage chest print, and bold gothic Shadow Faith back print.',
  '{"materials": ["100% Heavyweight Cotton", "520 GSM Fleece", "Integrated Rib Balaclava Mask"], "care": ["Hand wash cold inside out", "Hang dry in shade", "Do not tumble dry"], "fit": "Extreme oversized boxy fit with dropped shoulders and built-in face zip mask.", "origin": "SHADOW FAITH Drop 008. Limited Edition."}'::jsonb,
  '["S", "M", "L", "XL", "XXL"]'::jsonb,
  '[{"name": "Pitch Black", "hex": "#0a0a0a"}]'::jsonb,
  '["/images/shadow_faith_hoodie_cover.jpg", "/images/shadow_faith_hoodie_cover_1786876812461.jpg", "/images/shadow_faith_hoodie_cover_1787131828575.jpg"]'::jsonb,
  true, true, true, 15,
  '["Heavyweight", "Zip Hoodie", "Balaclava", "Shadow Faith", "Gothic", "Limited Drop"]'::jsonb,
  'SF-HDY-008'
),
(
  'prx-t04',
  'PRAX "Define Your Edge" Heavyweight Boxy Tee',
  'prax-define-your-edge-heavyweight-boxy-tee',
  'T-Shirts',
  999,
  1299,
  4.9,
  89,
  'Signature PRAX Studio heavy cotton tee featuring sharp left-chest "PRAX DEFINE YOUR EDGE" typography and custom woven authentic patch on lower right hem.',
  '{"materials": ["100% Combed Heavy Cotton", "340 GSM Luxury Jersey", "High-density Screenprint"], "care": ["Machine wash cold inside out", "Tumble dry low"], "fit": "Boxy streetwear cut with drop shoulder and thick collar.", "origin": "PRAX Studio ESTD. 2024. Built Different."}'::jsonb,
  '["XS", "S", "M", "L", "XL", "XXL"]'::jsonb,
  '[{"name": "Jet Black", "hex": "#0d0d0d"}]'::jsonb,
  '["/images/prax_boxy_tee_cover.jpg", "/images/prax_boxy_tee_cover_1786876846700.jpg", "/images/prax_boxy_tee_cover_1787131864952.jpg"]'::jsonb,
  true, true, true, 35,
  '["Essential", "Boxy Tee", "PRAX Studio", "Heavyweight"]'::jsonb,
  'PRX-TEE-004'
),
(
  'hh-h01',
  'HIP HOP "Legends Never Die" Holographic Leather Hoodie',
  'hip-hop-legends-never-die-holographic-leather-hoodie',
  'Hoodies',
  3499,
  3999,
  5.0,
  42,
  'Statement piece from the Hip-Hop Culture Drop 001. Crafted with soft vegan leather sleeves and a full back holographic graffiti mural featuring turntable graphics, DJ skull, boombox, and spray paint art.',
  '{"materials": ["80% Premium Cotton Fleece", "20% Vegan Leather Sleeves", "Holographic Ink Print"], "care": ["Specialist leather clean or wipe down sleeves gently", "Hand wash cold"], "fit": "Comfort fit designed for everyday hustle and movement.", "origin": "Street Culture Drop 001. Worldwide Shipping."}'::jsonb,
  '["S", "M", "L", "XL", "XXL"]'::jsonb,
  '[{"name": "Graffiti Black", "hex": "#111111"}]'::jsonb,
  '["/images/hiphop_leather_hoodie_cover.jpg", "/images/hiphop_leather_hoodie_cover_1786876861442.jpg", "/images/hiphop_leather_hoodie_cover_1787131895312.jpg"]'::jsonb,
  true, true, true, 10,
  '["Leather Sleeve", "Holographic", "Graffiti", "Hip Hop", "Limited Drop"]'::jsonb,
  'HH-HDY-001'
),
(
  'sf-j01',
  'SHADOW FAITH "Faith in the Shadows" Graphic Varsity Jacket',
  'shadow-faith-faith-in-the-shadows-graphic-varsity-jacket',
  'Jackets',
  3999,
  4499,
  4.9,
  37,
  'Bold graphic varsity bomber jacket from SHADOW FAITH™. Features premium contrast leather sleeves, vibrant teal/red alien back artwork, custom interior lining, snap closure, and signature pendant accent.',
  '{"materials": ["Heavyweight Wool Body", "Genuine Leather Sleeves", "Quilted Satin Lining"], "care": ["Specialist dry clean only"], "fit": "Oversized structured silhouette with ribbed collar and waist.", "origin": "SHADOW FAITH EST. 2024. Lost in Thought. Found in Style."}'::jsonb,
  '["S", "M", "L", "XL", "XXL"]'::jsonb,
  '[{"name": "Black & Teal", "hex": "#0e0e0e"}]'::jsonb,
  '["/images/shadow_faith_varsity_cover.jpg", "/images/shadow_faith_varsity_cover_1786876880347.jpg", "/images/shadow_faith_varsity_cover_1787131926054.jpg"]'::jsonb,
  true, true, true, 8,
  '["Outerwear", "Varsity Jacket", "Graphic Print", "Shadow Faith", "Limited Drop"]'::jsonb,
  'SF-JCK-001'
),
(
  'sf-p01',
  'SHADOW FAITH Gothic Cross Embroidered Sweatpants',
  'shadow-faith-gothic-cross-embroidered-sweatpants',
  'Pants',
  1999,
  2299,
  4.8,
  53,
  'Heavyweight washed black fleece sweatpants with bold white gothic cross embroidery on the legs and circular SHADOW FAITH™ emblem patch on the back pocket.',
  '{"materials": ["100% Heavyweight Washed Fleece Cotton", "480 GSM Fabric", "Applique Cross Embroidery"], "care": ["Machine wash cold inside out", "Tumble dry low"], "fit": "Relaxed straight-leg street drape with elastic drawstring waistband.", "origin": "SHADOW FAITH EST. 2024."}'::jsonb,
  '["S", "M", "L", "XL", "XXL"]'::jsonb,
  '[{"name": "Washed Charcoal", "hex": "#1c1c1c"}]'::jsonb,
  '["/images/shadow_faith_sweatpants_cover.jpg", "/images/shadow_faith_sweatpants_cover_1786876897181.jpg", "/images/shadow_faith_sweatpants_cover_1787131948859.jpg"]'::jsonb,
  true, true, true, 18,
  '["Sweatpants", "Gothic Cross", "Embroidered", "Shadow Faith", "Heavyweight"]'::jsonb,
  'SF-PNT-001'
),
(
  'sf-a01',
  'SHADOW FAITH Heavy Stainless Cross Pendant Chain',
  'shadow-faith-heavy-stainless-cross-pendant-chain',
  'Accessories',
  1299,
  1599,
  4.9,
  31,
  'Solid 316L surgical-grade stainless steel gothic cross pendant chain with oxidized dark vintage finish. Laser-engraved SHADOW FAITH™ emblem on back.',
  '{"materials": ["316L Surgical Grade Stainless Steel", "Antiqued Silver Finish", "Hypoallergenic"], "care": ["Wipe clean with microfiber cloth", "Keep away from harsh chemicals"], "fit": "60cm box chain with custom claw clasp.", "origin": "SHADOW FAITH Accessories Drop 001."}'::jsonb,
  '["M", "L"]'::jsonb,
  '[{"name": "Antique Silver", "hex": "#888888"}]'::jsonb,
  '["/images/shadow_faith_varsity_cover.jpg", "/images/shadow_faith_varsity_cover_1786876880347.jpg"]'::jsonb,
  true, true, true, 25,
  '["Jewelry", "Cross Chain", "Stainless Steel", "Shadow Faith", "Accessories"]'::jsonb,
  'SF-ACC-001'
),
(
  'prx-t05',
  'PRAX "Architectural Geometry" Vintage Acid Tee',
  'prax-architectural-geometry-vintage-acid-tee',
  'T-Shirts',
  1199,
  1499,
  4.8,
  47,
  'Heavy acid wash oversized tee featuring monochrome architectural brutalist line graphics and PRAX Studio silicone chest patch.',
  '{"materials": ["100% Acid-Washed Cotton", "320 GSM French Terry Cotton", "Silicone Badge"], "care": ["Machine wash cold inside out", "Hang dry"], "fit": "Oversized boxy streetwear drape.", "origin": "PRAX Studio ESTD. 2024."}'::jsonb,
  '["S", "M", "L", "XL"]'::jsonb,
  '[{"name": "Acid Washed Black", "hex": "#222222"}]'::jsonb,
  '["/images/prax_boxy_tee_cover.jpg", "/images/prax_boxy_tee_cover_1786876846700.jpg"]'::jsonb,
  false, true, true, 20,
  '["Acid Wash", "Boxy Tee", "Brutalist", "PRAX Studio"]'::jsonb,
  'PRX-TEE-005'
),
(
  'prx-a02',
  'PRAX Distressed Tactical Balaclava Beanie Cap',
  'prax-distressed-tactical-balaclava-beanie-cap',
  'Accessories',
  899,
  1199,
  5.0,
  19,
  'Convertible dual-mode ribbed knit beanie balaclava with distressed hem detailing and embroidered white PRAX box logo.',
  '{"materials": ["100% Soft Acrylic Rib Knit", "Dual-Layer Thermal Insulation"], "care": ["Hand wash cold", "Lay flat to dry"], "fit": "Stretch one-size fits all foldover balaclava construction.", "origin": "PRAX Studio Winter Drop."}'::jsonb,
  '["M"]'::jsonb,
  '[{"name": "Pitch Black", "hex": "#0a0a0a"}]'::jsonb,
  '["/images/shadow_faith_hoodie_cover.jpg", "/images/shadow_faith_hoodie_cover_1786876812461.jpg"]'::jsonb,
  true, true, true, 40,
  '["Balaclava", "Beanie", "Tactical", "PRAX Studio", "Accessories"]'::jsonb,
  'PRX-ACC-002'
) ON CONFLICT (id) DO NOTHING;

-- Initial User Seed
INSERT INTO public.users (id, email, password, name, phone, avatar, addresses, payment_methods, created_at)
VALUES (
  'usr-01',
  'mr.praxlabs@gmail.com',
  'password123',
  'Prax Collector',
  '+1 (555) 019-2834',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  '[{"id": "addr-01", "fullName": "Prax Collector", "addressLine1": "742 Fashion Avenue, Suite 12", "city": "New York", "state": "NY", "postalCode": "10018", "country": "United States", "phone": "+1 (555) 019-2834", "isDefault": true}]'::jsonb,
  '[{"id": "pm-01", "type": "card", "cardBrand": "Visa", "last4": "4242", "expMonth": "12", "expYear": "28", "isDefault": true}]'::jsonb,
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Initial Reviews Seed
INSERT INTO public.reviews (id, product_id, user_name, rating, title, comment, date, verified)
VALUES 
('rev-01', 'sf-h01', 'Kaito T.', 5, 'The built-in balaclava mask is genius', 'The 520 GSM fleece weight is insane. The integrated face mask zips up smoothly and the bandana print quality is unmatched. Pure heat.', '2026-08-14', true),
('rev-02', 'prx-t04', 'Marcus V.', 5, 'Clean boxy drape with immaculate stitching', 'Heavyweight 340 GSM fabric holds its boxy structure all day. The neck collar doesn’t stretch out and the lower PRAX tag is a nice touch.', '2026-08-12', true),
('rev-03', 'hh-h01', 'Elena R.', 5, 'Leather sleeves and holographic detail pop so hard', 'The holographic graffiti back print catches light like crazy. Leather sleeves feel soft and authentic. Worth every penny.', '2026-08-11', true),
('rev-04', 'sf-j01', 'Julian S.', 5, 'Showstopper jacket', 'Turns heads instantly. The inner lining and back graphic details show the craftsmanship. Easily the sickest drop of 2026.', '2026-08-09', true)
ON CONFLICT (id) DO NOTHING;
