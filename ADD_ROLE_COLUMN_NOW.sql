-- ============================================
-- EMERGENCY FIX: Add role column to profiles
-- Run this directly in Lovable Cloud SQL Editor
-- ============================================

-- Step 1: Add the role column
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- Step 2: Update all existing users to have 'user' role
UPDATE public.profiles 
SET role = 'user' 
WHERE role IS NULL;

-- Step 3: Set admin role for admin users
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'admin.winquizz@gmail.com';

UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'triggergmail.com';

-- Step 4: Add constraint to ensure only valid roles
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('user', 'admin'));

-- Step 5: Create index for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_role 
ON public.profiles(role);

-- Step 6: Verify the changes
SELECT 
  id,
  email,
  full_name,
  role,
  created_at
FROM public.profiles
ORDER BY created_at DESC;

-- ============================================
-- Expected Result: All profiles should now have a role column
-- ============================================
