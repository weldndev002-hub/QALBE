-- Hapus semua policy sebelumnya yang membatasi pembacaan
DROP POLICY IF EXISTS "Admins can view all memberships" ON public.user_memberships;
DROP POLICY IF EXISTS "User read own membership" ON public.user_memberships;
DROP POLICY IF EXISTS "Public read user_memberships" ON public.user_memberships;

-- Buat policy baru: Semua orang (termasuk Admin yang menggunakan akun Mock/Anonim) 
-- BISA membaca data paket membership (karena data tier_id tidak bersifat rahasia)
CREATE POLICY "Public read user_memberships"
  ON public.user_memberships FOR SELECT
  USING (true);

-- Lakukan hal yang sama untuk history
DROP POLICY IF EXISTS "Admins can view all history" ON public.membership_history;
DROP POLICY IF EXISTS "User read own history" ON public.membership_history;
DROP POLICY IF EXISTS "Public read history" ON public.membership_history;

CREATE POLICY "Public read history"
  ON public.membership_history FOR SELECT
  USING (true);
