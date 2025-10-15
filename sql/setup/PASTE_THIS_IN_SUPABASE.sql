-- ============================================
-- COPY AND PASTE THIS INTO SUPABASE SQL EDITOR
-- Go to: https://supabase.com/dashboard/project/usqsjbzcrdwvutccqnbm/sql/new
-- ============================================

-- Step 1: Add role column to profiles table
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
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'profiles_role_check'
  ) THEN
    ALTER TABLE public.profiles 
    ADD CONSTRAINT profiles_role_check 
    CHECK (role IN ('user', 'admin'));
  END IF;
END $$;

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
-- The query above will show all users with their roles
-- ============================================
