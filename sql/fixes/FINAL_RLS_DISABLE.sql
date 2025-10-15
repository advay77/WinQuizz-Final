-- ============================================
-- FINAL RLS DISABLE - Run this in Supabase
-- ============================================

-- Disable RLS on profiles table completely
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies (they cause recursion)
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update user roles" ON public.profiles;

-- Grant full access to authenticated users
GRANT ALL ON public.profiles TO authenticated, anon;
GRANT USAGE ON SCHEMA public TO authenticated, anon;

-- Remove trigger (not needed)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Verify RLS is disabled
SELECT
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'profiles';

-- Should show: rowsecurity = false

-- ============================================
-- Profiles table is now completely open
-- No RLS, no policies, no trigger
-- Admin panel will work perfectly
-- ============================================
