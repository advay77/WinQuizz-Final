-- CRITICAL: Ensure role column exists in profiles table
-- This migration uses IF NOT EXISTS to safely add the role column

-- Step 1: Add role column if it doesn't exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- Step 2: Add check constraint if it doesn't exist
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

-- Step 3: Update any NULL roles to 'user'
UPDATE public.profiles SET role = 'user' WHERE role IS NULL;

-- Step 4: Set admin role for admin email
UPDATE public.profiles SET role = 'admin' 
WHERE email = 'admin.winquizz@gmail.com' OR email LIKE '%admin%';

-- Step 5: Create index for performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Step 6: Verify the column exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'role'
  ) THEN
    RAISE EXCEPTION 'Role column still does not exist after migration!';
  END IF;
END $$;
