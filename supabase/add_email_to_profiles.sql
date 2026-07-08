-- 1. Tambahkan kolom email ke tabel profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- 2. Update fungsi trigger agar menyimpan email otomatis saat daftar
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Buat Profil dengan email
  INSERT INTO public.profiles (id, full_name, avatar_url, email)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url',
    new.email
  );
  
  -- Berikan role default 'user'
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'user');
  
  -- Berikan Paket Free secara otomatis (Tier ID: 1)
  INSERT INTO public.user_memberships (user_id, tier_id, status)
  VALUES (new.id, 1, 'active');
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Sinkronisasi Darurat: Update email user lama yang sudah terdaftar
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id AND p.email IS NULL;
