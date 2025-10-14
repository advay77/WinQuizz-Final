-- Add role column to profiles table
ALTER TABLE profiles ADD COLUMN role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin'));

-- Update existing admin user to have admin role
UPDATE profiles SET role = 'admin' WHERE email = 'admin.winquizz@gmail.com';

-- Create index for role column for better performance
CREATE INDEX idx_profiles_role ON profiles(role);
