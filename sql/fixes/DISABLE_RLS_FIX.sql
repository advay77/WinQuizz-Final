-- ============================================
-- DISABLE RLS - Since you're using EmailJS for auth
-- ============================================

-- Step 1: Disable RLS on profiles table
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop all existing policies (they're causing recursion)
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update user roles" ON public.profiles;

-- Step 3: Grant full access to authenticated users
GRANT ALL ON public.profiles TO authenticated, anon;
GRANT USAGE ON SCHEMA public TO authenticated, anon;

-- Step 4: Remove trigger (not needed)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Step 5: Verify RLS is disabled
SELECT 
  tablename,
  rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'profiles';

-- Should show: rowsecurity = false

-- ============================================
-- Now profiles table is open for direct access
-- No RLS, no policies, no trigger
-- Your code can freely insert/update profiles
-- ============================================
