-- ============================================================
-- QALBIE — Supabase Database Schema
-- Jalankan di: Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Tabel fitur-fitur yang tersedia
CREATE TABLE IF NOT EXISTS features (
  id          SERIAL PRIMARY KEY,
  key         TEXT UNIQUE NOT NULL,          -- e.g. 'chat_ai_basic'
  label       TEXT NOT NULL,                 -- e.g. 'Chat AI Basic'
  description TEXT,
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabel paket membership
CREATE TABLE IF NOT EXISTS membership_tiers (
  id            SERIAL PRIMARY KEY,
  name          TEXT NOT NULL,               -- e.g. 'Free', 'Basic', 'Pro'
  slug          TEXT UNIQUE NOT NULL,        -- e.g. 'free', 'basic'
  level         INTEGER NOT NULL DEFAULT 0,  -- urutan (0=free, 1=basic, 2=pro, 3=premium)
  description   TEXT,
  features      TEXT[],                      -- array of feature labels
  price_monthly INTEGER NOT NULL DEFAULT 0,  -- dalam Rupiah
  price_yearly  INTEGER NOT NULL DEFAULT 0,
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabel membership aktif user
CREATE TABLE IF NOT EXISTS user_memberships (
  id         SERIAL PRIMARY KEY,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tier_id    INTEGER NOT NULL REFERENCES membership_tiers(id),
  status     TEXT NOT NULL DEFAULT 'active', -- active, expired, cancelled
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  notes      TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id)                           -- satu user hanya punya 1 membership aktif
);

-- 4. Riwayat perubahan membership
CREATE TABLE IF NOT EXISTS membership_history (
  id           SERIAL PRIMARY KEY,
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  from_tier_id INTEGER REFERENCES membership_tiers(id),
  to_tier_id   INTEGER REFERENCES membership_tiers(id),
  change_type  TEXT NOT NULL,  -- 'upgrade', 'downgrade', 'renewal', 'cancel'
  reason       TEXT,
  payment_ref  TEXT,           -- Duitku merchantOrderId
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── Row Level Security (RLS) ──────────────────────────────────────────────────

ALTER TABLE membership_tiers  ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_memberships  ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE features           ENABLE ROW LEVEL SECURITY;

-- Semua user bisa baca membership_tiers & features (public catalog)
CREATE POLICY "Public read membership_tiers"
  ON membership_tiers FOR SELECT USING (true);

CREATE POLICY "Public read features"
  ON features FOR SELECT USING (true);

-- User hanya bisa baca membership milik sendiri
CREATE POLICY "User read own membership"
  ON user_memberships FOR SELECT
  USING (auth.uid() = user_id);

-- Hanya service role (Worker via anon key tidak bisa) yang bisa insert/update membership
-- Worker menggunakan SUPABASE_SERVICE_ROLE_KEY (lebih aman) untuk update dari callback
-- Untuk sementara, aktifkan insert untuk anon (akan diperbaiki dengan service role):
CREATE POLICY "Service insert user_memberships"
  ON user_memberships FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service update user_memberships"
  ON user_memberships FOR UPDATE
  USING (true);

-- User bisa baca history sendiri
CREATE POLICY "User read own history"
  ON membership_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service insert history"
  ON membership_history FOR INSERT
  WITH CHECK (true);

-- ── Data awal paket membership ─────────────────────────────────────────────────

INSERT INTO membership_tiers (name, slug, level, description, features, price_monthly, price_yearly, is_active)
VALUES
  ('Free',    'free',    0, 'Akses dasar gratis untuk mulai perjalanan sehatmu',
   ARRAY['Akses Basic Chat AI', 'Mood Tracker dasar', '5 sesi audio terapi/bulan'],
   0, 0, true),

  ('Basic',   'basic',   1, 'Fitur premium dasar untuk kesehatan mental sehari-hari',
   ARRAY['Akses Audio Terapi Basic', 'Chat AI 50 sesi/hari', 'Laporan Mood Tracker Mingguan', 'Stress Meter'],
   29000, 290000, true),

  ('Pro',     'pro',     2, 'Akses lengkap untuk perjalanan healing yang lebih dalam',
   ARRAY['Akses Audio Terapi Premium (100+ konten)', 'Chat AI 200 sesi/hari', 'Laporan Mood Tracker Bulanan', 'Stress Meter Lanjutan', 'Artikel Premium Tanpa Batas'],
   49000, 490000, true),

  ('Premium', 'premium', 3, 'Paket terlengkap dengan semua fitur eksklusif Qalbie',
   ARRAY['Semua Fitur Pro', 'Sesi Konsultasi 1-on-1 (2x/bulan)', 'Prioritas Dukungan 24/7', 'Akses Konten Eksklusif', 'Early Access Fitur Baru'],
   99000, 990000, true)

ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  features = EXCLUDED.features,
  price_monthly = EXCLUDED.price_monthly,
  price_yearly = EXCLUDED.price_yearly,
  updated_at = NOW();
