-- Force add role column to profiles table (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'role'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin'));
    
    -- Update existing profiles to have 'user' role
    UPDATE public.profiles SET role = 'user' WHERE role IS NULL;
    
    -- Create index for role column for better performance
    CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
    
    -- Update admin user if exists
    UPDATE public.profiles SET role = 'admin' WHERE email = 'admin.winquizz@gmail.com';
  END IF;
END $$;

-- Ensure RLS policies exist for admin access
DO $$
BEGIN
  -- Drop existing policies if they exist to recreate them
  DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
  DROP POLICY IF EXISTS "Admins can update user roles" ON public.profiles;
  
  -- Create admin view policy
  CREATE POLICY "Admins can view all profiles"
    ON public.profiles FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid() AND p.role = 'admin'
      )
    );
  
  -- Create admin update policy
  CREATE POLICY "Admins can update user roles"
    ON public.profiles FOR UPDATE
    USING (
      EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid() AND p.role = 'admin'
      )
    );
END $$;
