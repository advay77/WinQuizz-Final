-- Seed file to ensure role column exists and is populated
-- This can be run manually if migrations don't apply

-- Add role column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- Update existing profiles to have 'user' role
UPDATE public.profiles SET role = 'user' WHERE role IS NULL;

-- Set admin role for specific users
UPDATE public.profiles SET role = 'admin' 
WHERE email IN ('admin.winquizz@gmail.com', 'admin@gmail.com', 'triggergmail.com');

-- Create index for role column
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Verify the change
SELECT 
  id, 
  email, 
  full_name, 
  role,
  created_at
FROM public.profiles
ORDER BY created_at DESC;
