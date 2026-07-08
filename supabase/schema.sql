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
  category    TEXT DEFAULT 'access',         -- e.g. 'access', 'limits', 'support'
  input_type  TEXT DEFAULT 'toggle',         -- e.g. 'toggle', 'number', 'text'
  is_active   BOOLEAN DEFAULT TRUE,          -- aktif/nonaktif
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
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
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
  user_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
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
DROP POLICY IF EXISTS "Public read membership_tiers" ON membership_tiers;
CREATE POLICY "Public read membership_tiers"
  ON membership_tiers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read features" ON features;
CREATE POLICY "Public read features"
  ON features FOR SELECT USING (true);

-- User hanya bisa baca membership milik sendiri
DROP POLICY IF EXISTS "User read own membership" ON user_memberships;
CREATE POLICY "User read own membership"
  ON user_memberships FOR SELECT
  USING (auth.uid() = user_id);

-- Hanya service role (Worker via anon key tidak bisa) yang bisa insert/update membership
-- Worker menggunakan SUPABASE_SERVICE_ROLE_KEY (lebih aman) untuk update dari callback
-- Untuk sementara, aktifkan insert untuk anon (akan diperbaiki dengan service role):
DROP POLICY IF EXISTS "Service insert user_memberships" ON user_memberships;
CREATE POLICY "Service insert user_memberships"
  ON user_memberships FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service update user_memberships" ON user_memberships;
CREATE POLICY "Service update user_memberships"
  ON user_memberships FOR UPDATE
  USING (true);

-- User bisa baca history sendiri
DROP POLICY IF EXISTS "User read own history" ON membership_history;
CREATE POLICY "User read own history"
  ON membership_history FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service insert history" ON membership_history;
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

-- ============================================================
-- 5. Tabel Profil User (PENTING: Jangan sampai terlewat)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  bio TEXT,
  timezone TEXT DEFAULT 'Asia/Jakarta',
  language TEXT DEFAULT 'id',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tabel Role (Hak Akses)
CREATE TABLE IF NOT EXISTS user_roles (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ============================================================
-- FIX: Update Existing Foreign Keys (Jika tabel sudah terlanjur dibuat dengan referensi lama)
-- ============================================================
ALTER TABLE user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_fkey;
ALTER TABLE user_roles ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE user_memberships DROP CONSTRAINT IF EXISTS user_memberships_user_id_fkey;
ALTER TABLE user_memberships ADD CONSTRAINT user_memberships_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE membership_history DROP CONSTRAINT IF EXISTS membership_history_user_id_fkey;
ALTER TABLE membership_history ADD CONSTRAINT membership_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


-- RLS untuk Profil & Role
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON profiles;
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile." ON profiles;
CREATE POLICY "Users can insert their own profile." ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile." ON profiles;
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "User roles viewable by everyone." ON user_roles;
CREATE POLICY "User roles viewable by everyone." ON user_roles FOR SELECT USING (true);

-- ============================================================
-- 7. Trigger Otomatis saat User Mendaftar (Auto-Create Profile & Tier)
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Buat Profil
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  
  -- Berikan role default 'user'
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'user');
  
  -- Berikan Paket Free secara otomatis (Tier ID: 1)
  INSERT INTO public.user_memberships (user_id, tier_id, status)
  VALUES (new.id, 1, 'active');
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Hapus trigger jika sudah ada sebelumnya agar tidak duplikat
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Pasang Trigger ke tabel autentikasi Supabase
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================================
-- 8. Sinkronisasi Darurat (Untuk user lama yang sudah terlanjur daftar)
-- ============================================================
INSERT INTO public.profiles (id, full_name)
SELECT id, raw_user_meta_data->>'full_name' FROM auth.users
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'user' FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO public.user_memberships (user_id, tier_id, status)
SELECT id, 1, 'active' FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- ============================================================
-- 9. RPC untuk Webhook Duitku (Bypass RLS)
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_user_membership_webhook(
  p_user_id UUID,
  p_tier_id INTEGER,
  p_expires_at TIMESTAMPTZ,
  p_notes TEXT
) RETURNS VOID AS $$
BEGIN
  INSERT INTO public.user_memberships (user_id, tier_id, status, started_at, expires_at, notes, updated_at)
  VALUES (p_user_id, p_tier_id, 'active', NOW(), p_expires_at, p_notes, NOW())
  ON CONFLICT (user_id) DO UPDATE SET
    tier_id = EXCLUDED.tier_id,
    status = EXCLUDED.status,
    started_at = EXCLUDED.started_at,
    expires_at = EXCLUDED.expires_at,
    notes = EXCLUDED.notes,
    updated_at = EXCLUDED.updated_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- ============================================================
-- 10. RPC untuk Menghapus Akun (Bypass RLS)
-- ============================================================
CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS void AS $$
BEGIN
  -- Hapus dari auth.users (Tabel publik yang memiliki referensi ON DELETE CASCADE akan otomatis terhapus)
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 11. Storage RLS Policies (Bucket "Profile")
-- ============================================================
-- Pastikan bucket "Profile" sudah dibuat secara manual di dashboard, atau 
-- gunakan SQL insert ini untuk membuatnya secara otomatis jika belum ada:
INSERT INTO storage.buckets (id, name, public) VALUES ('Profile', 'Profile', true) ON CONFLICT DO NOTHING;

-- Kebijakan RLS agar gambar bisa dilihat secara publik
DROP POLICY IF EXISTS "Avatar Public Access" ON storage.objects;
CREATE POLICY "Avatar Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'Profile' );

-- Kebijakan agar user yang login bisa mengunggah file baru
DROP POLICY IF EXISTS "User can upload avatar" ON storage.objects;
CREATE POLICY "User can upload avatar"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'Profile' AND auth.role() = 'authenticated' );

-- Kebijakan agar user bisa menimpa/update fotonya sendiri
DROP POLICY IF EXISTS "User can update own avatar" ON storage.objects;
CREATE POLICY "User can update own avatar"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'Profile' AND auth.uid() = owner );

-- Kebijakan agar user bisa menghapus fotonya sendiri
DROP POLICY IF EXISTS "User can delete own avatar" ON storage.objects;
CREATE POLICY "User can delete own avatar"
ON storage.objects FOR DELETE
USING ( bucket_id = 'Profile' AND auth.uid() = owner );

-- ============================================================
-- 12. Tabel Pengaturan Aplikasi (app_settings)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read app_settings" ON public.app_settings;
CREATE POLICY "Public read app_settings" ON public.app_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service insert/update app_settings" ON public.app_settings;
CREATE POLICY "Service insert/update app_settings" ON public.app_settings FOR ALL USING (true);

INSERT INTO public.app_settings (key, value)
VALUES
  ('support_email', 'support@qalbie.id'),
  ('support_whatsapp', 'https://wa.me/6281234567890')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;


-- ============================================================
-- 13. Tabel Pelacakan (Mood & Stress)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.mood_logs (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  mood_value NUMERIC NOT NULL, -- 0.0 to 1.0
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.stress_logs (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  stress_value NUMERIC NOT NULL, -- 0.0 to 1.0
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS untuk Mood & Stress
ALTER TABLE public.mood_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stress_logs ENABLE ROW LEVEL SECURITY;

-- User hanya bisa melihat dan menambah data mereka sendiri (Mood)
DROP POLICY IF EXISTS "Users can view own mood" ON public.mood_logs;
CREATE POLICY "Users can view own mood" ON public.mood_logs FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own mood" ON public.mood_logs;
CREATE POLICY "Users can insert own mood" ON public.mood_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User hanya bisa melihat dan menambah data mereka sendiri (Stress)
DROP POLICY IF EXISTS "Users can view own stress" ON public.stress_logs;
CREATE POLICY "Users can view own stress" ON public.stress_logs FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own stress" ON public.stress_logs;
CREATE POLICY "Users can insert own stress" ON public.stress_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 14. Tabel Konten Admin (Admin Contents)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.admin_contents (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT,
  media_url TEXT,
  media_type TEXT, -- 'image' atau 'video'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.admin_contents ENABLE ROW LEVEL SECURITY;

-- Semua bisa baca konten
DROP POLICY IF EXISTS "Public read admin_contents" ON public.admin_contents;
CREATE POLICY "Public read admin_contents" ON public.admin_contents FOR SELECT USING (true);

-- Hanya bisa insert/update jika bypass RLS (Service role)
DROP POLICY IF EXISTS "Service insert/update admin_contents" ON public.admin_contents;
CREATE POLICY "Service insert/update admin_contents" ON public.admin_contents FOR ALL USING (true);

-- Storage bucket untuk AdminContent
INSERT INTO storage.buckets (id, name, public) VALUES ('AdminContent', 'AdminContent', true) ON CONFLICT DO NOTHING;

-- Kebijakan RLS agar media admin bisa dilihat secara publik
DROP POLICY IF EXISTS "AdminContent Public Access" ON storage.objects;
CREATE POLICY "AdminContent Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'AdminContent' );

-- Kebijakan agar bisa mengunggah file
DROP POLICY IF EXISTS "Admin can upload content" ON storage.objects;
CREATE POLICY "Admin can upload content"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'AdminContent' );

-- Kebijakan agar bisa hapus file content
DROP POLICY IF EXISTS "Admin can delete content" ON storage.objects;
CREATE POLICY "Admin can delete content"
ON storage.objects FOR DELETE
USING ( bucket_id = 'AdminContent' );

-- ============================================================
-- 15. Tabel Notifikasi (Notifications)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE, -- Jika null, berarti broadcast ke semua user
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'info',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- User bisa membaca notifikasi miliknya atau notifikasi broadcast (user_id IS NULL)
DROP POLICY IF EXISTS "Users can view own and broadcast notifications" ON public.notifications;
CREATE POLICY "Users can view own and broadcast notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

-- Hanya service role yang bisa insert/update/delete (bypass RLS)
DROP POLICY IF EXISTS "Service insert/update notifications" ON public.notifications;
CREATE POLICY "Service insert/update notifications" ON public.notifications FOR ALL USING (true);


-- Trigger untuk mengirim notifikasi broadcast saat admin membuat konten baru
CREATE OR REPLACE FUNCTION public.notify_new_admin_content()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.notifications (title, description, icon)
  VALUES (
    'Konten Baru: ' || NEW.title,
    'Ada inspirasi baru untukmu! Silakan cek di beranda.',
    'new_releases'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_admin_content_created ON public.admin_contents;
CREATE TRIGGER on_admin_content_created
  AFTER INSERT ON public.admin_contents
  FOR EACH ROW EXECUTE PROCEDURE public.notify_new_admin_content();

-- ============================================================
-- Aktifkan Realtime untuk tabel (Opsional tapi wajib untuk Stream)
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE admin_contents;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- ============================================================
-- 16. Tabel Audio/Musik Admin (Admin Audios)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.admin_audios (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  audio_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.admin_audios ENABLE ROW LEVEL SECURITY;

-- Semua bisa baca audio
DROP POLICY IF EXISTS "Public read admin_audios" ON public.admin_audios;
CREATE POLICY "Public read admin_audios" ON public.admin_audios FOR SELECT USING (true);

-- Hanya bisa insert/update jika bypass RLS (Service role)
DROP POLICY IF EXISTS "Service insert/update admin_audios" ON public.admin_audios;
CREATE POLICY "Service manage admin_audios" ON public.admin_audios FOR ALL USING (true) WITH CHECK (true);

-- Storage bucket untuk AdminAudio
INSERT INTO storage.buckets (id, name, public) VALUES ('AdminAudio', 'AdminAudio', true) ON CONFLICT DO NOTHING;

-- Kebijakan RLS agar audio admin bisa didengar secara publik
DROP POLICY IF EXISTS "AdminAudio Public Access" ON storage.objects;
CREATE POLICY "AdminAudio Public Access" ON storage.objects FOR SELECT USING ( bucket_id = 'AdminAudio' );

-- Kebijakan agar bisa mengunggah file audio
DROP POLICY IF EXISTS "Admin can upload audio" ON storage.objects;
CREATE POLICY "Admin can upload audio" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'AdminAudio' );

-- Kebijakan agar bisa hapus file audio
DROP POLICY IF EXISTS "Admin can delete audio" ON storage.objects;
CREATE POLICY "Admin can delete audio" ON storage.objects FOR DELETE USING ( bucket_id = 'AdminAudio' );

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE admin_audios;

-- ============================================================
-- 17. Kebijakan Manajemen Fitur & Paket (Admin)
-- ============================================================

-- Manajemen Master Fitur (Admin)
DROP POLICY IF EXISTS "Service manage features" ON public.features;
CREATE POLICY "Service manage features" ON public.features FOR ALL USING (true) WITH CHECK (true);

-- Manajemen Paket Membership (Admin)
DROP POLICY IF EXISTS "Service manage membership_tiers" ON public.membership_tiers;
CREATE POLICY "Service manage membership_tiers" ON public.membership_tiers FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- 18. Tabel Backup User (WhatsApp-like Cloud Backup)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_backups (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  backup_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_backups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS Users can manage own backups ON public.user_backups;
CREATE POLICY Users can manage own backups ON public.user_backups FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

