-- 1. Sinkronisasi nama dan email dari auth.users ke public.profiles
UPDATE public.profiles p
SET 
  email = u.email,
  full_name = COALESCE(u.raw_user_meta_data->>'full_name', p.full_name)
FROM auth.users u
WHERE p.id = u.id;

-- 2. Buat fungsi trigger untuk UPDATE user
CREATE OR REPLACE FUNCTION public.handle_update_user()
RETURNS trigger AS $$
BEGIN
  UPDATE public.profiles
  SET 
    email = new.email,
    full_name = COALESCE(new.raw_user_meta_data->>'full_name', full_name)
  WHERE id = new.id;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Pasang trigger AFTER UPDATE di auth.users
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_update_user();
