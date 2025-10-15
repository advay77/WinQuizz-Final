# 🎨 Lovable Cloud Database Setup

## 📋 Overview

Since you're using **Lovable Cloud's database**, you need to apply the database changes through Lovable's interface. Here's how to set up the admin panel tables.

---

## 🚀 Setup Instructions for Lovable Cloud

### Step 1: Access Lovable Database

1. Go to your Lovable project dashboard
2. Click on **"Database"** or **"Supabase"** in the left sidebar
3. This will open your Lovable-managed Supabase instance

### Step 2: Open SQL Editor

1. In the Lovable Supabase interface, find **"SQL Editor"** in the left menu
2. Click **"New Query"**

### Step 3: Run the Migration

Copy and paste this SQL into the editor:

```sql
-- =====================================================
-- Admin Panel Database Migration for Lovable Cloud
-- =====================================================

-- Create quizzes table
CREATE TABLE IF NOT EXISTS public.quizzes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'cancelled')),
  total_questions INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) NOT NULL
);

-- Create user_quiz_scores table
CREATE TABLE IF NOT EXISTS public.user_quiz_scores (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL DEFAULT 0,
  time_taken_seconds INTEGER,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, quiz_id)
);

-- Enable Row Level Security
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_quiz_scores ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read access for all users" ON public.quizzes;
DROP POLICY IF EXISTS "Enable insert for admins only" ON public.quizzes;
DROP POLICY IF EXISTS "Enable update for admins only" ON public.quizzes;
DROP POLICY IF EXISTS "Enable delete for admins only" ON public.quizzes;
DROP POLICY IF EXISTS "Enable read access for own scores" ON public.user_quiz_scores;
DROP POLICY IF EXISTS "Enable read access for admins to all scores" ON public.user_quiz_scores;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.user_quiz_scores;
DROP POLICY IF EXISTS "Enable update for own scores" ON public.user_quiz_scores;

-- RLS Policies for quizzes table
CREATE POLICY "Enable read access for all users" 
ON public.quizzes 
FOR SELECT 
USING (true);

CREATE POLICY "Enable insert for admins only"
ON public.quizzes
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  )
);

CREATE POLICY "Enable update for admins only"
ON public.quizzes
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  )
);

CREATE POLICY "Enable delete for admins only"
ON public.quizzes
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  )
);

-- RLS Policies for user_quiz_scores table
CREATE POLICY "Enable read access for own scores" 
ON public.user_quiz_scores 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Enable read access for admins to all scores"
ON public.user_quiz_scores
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  )
);

CREATE POLICY "Enable insert for authenticated users"
ON public.user_quiz_scores
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update for own scores"
ON public.user_quiz_scores
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_quizzes_status ON public.quizzes(status);
CREATE INDEX IF NOT EXISTS idx_quizzes_created_by ON public.quizzes(created_by);
CREATE INDEX IF NOT EXISTS idx_user_quiz_scores_user_id ON public.user_quiz_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_user_quiz_scores_quiz_id ON public.user_quiz_scores(quiz_id);
CREATE INDEX IF NOT EXISTS idx_user_quiz_scores_completed_at ON public.user_quiz_scores(completed_at);

-- Ensure profiles table has role column (if not already present)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'role'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN role TEXT DEFAULT 'user';
  END IF;
END $$;

-- Update existing profiles to have 'user' role if null
UPDATE public.profiles SET role = 'user' WHERE role IS NULL;

-- Grant necessary permissions
GRANT ALL ON public.quizzes TO authenticated;
GRANT ALL ON public.user_quiz_scores TO authenticated;
```

4. Click **"Run"** or **"Execute"** to run the migration

### Step 4: Verify Tables Created

1. In Lovable's Supabase interface, go to **"Table Editor"**
2. You should see two new tables:
   - `quizzes`
   - `user_quiz_scores`

### Step 5: Create Your First Admin User

Run this query in the SQL Editor (replace with your email):

```sql
-- Replace 'your-email@example.com' with your actual email
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```

### Step 6: Verify Admin Role

Check if your user is now an admin:

```sql
SELECT id, email, role, full_name 
FROM public.profiles 
WHERE email = 'your-email@example.com';
```

You should see `role = 'admin'` in the results.

---

## 🔍 Alternative: Using Lovable's Table Editor

If you prefer a visual interface:

### Create Quizzes Table

1. Go to **Table Editor** in Lovable's Supabase
2. Click **"New Table"**
3. Name: `quizzes`
4. Add columns:
   - `id` - uuid, primary key, default: uuid_generate_v4()
   - `title` - text, required
   - `description` - text, nullable
   - `start_time` - timestamptz, nullable
   - `end_time` - timestamptz, nullable
   - `status` - text, default: 'draft'
   - `total_questions` - int4, default: 10
   - `created_at` - timestamptz, default: now()
   - `created_by` - uuid, foreign key to auth.users(id)
5. Enable RLS
6. Add policies (see SQL above)

### Create User Quiz Scores Table

1. Click **"New Table"**
2. Name: `user_quiz_scores`
3. Add columns:
   - `id` - uuid, primary key, default: uuid_generate_v4()
   - `user_id` - uuid, foreign key to auth.users(id)
   - `quiz_id` - uuid, foreign key to quizzes(id)
   - `score` - int4, default: 0
   - `total_questions` - int4, required
   - `correct_answers` - int4, default: 0
   - `time_taken_seconds` - int4, nullable
   - `completed_at` - timestamptz, nullable
   - `created_at` - timestamptz, default: now()
4. Add unique constraint on (user_id, quiz_id)
5. Enable RLS
6. Add policies (see SQL above)

---

## 🎯 Quick Verification

After running the migration, verify everything works:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('quizzes', 'user_quiz_scores');

-- Check if role column exists in profiles
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'profiles' 
AND column_name = 'role';

-- Check your admin status
SELECT email, role 
FROM public.profiles 
WHERE role = 'admin';
```

---

## 🔧 Lovable-Specific Notes

### Database Access
- Lovable provides a managed Supabase instance
- Access it through: Lovable Dashboard → Database/Supabase
- All Supabase features are available

### Environment Variables
- Lovable automatically manages your Supabase connection
- No need to update `.env` files
- The integration is already configured

### Deployment
- Changes to database are immediately live
- No separate deployment needed for database changes
- Frontend changes deploy through Lovable's normal process

---

## ✅ Testing Your Setup

1. **Login to your app** with your admin email
2. **Navigate to** `/admin`
3. **You should see:**
   - Dashboard with statistics
   - Users tab with role management
   - Quizzes tab with create button
   - Scores tab (empty initially)
   - Questions tab
   - KYC tab

4. **Test creating a quiz:**
   - Go to Quizzes tab
   - Click "New Quiz"
   - Fill in details
   - Click "Create Quiz"
   - Should appear in the table

5. **Test role management:**
   - Go to Users tab
   - Find a user
   - Change their role
   - Should update immediately

---

## 🐛 Troubleshooting

### "Table already exists" error
- This is fine! It means the table was already created
- The `IF NOT EXISTS` clause prevents errors

### Can't access /admin
- Verify your email in the profiles table
- Make sure `role = 'admin'`
- Try logging out and back in

### Tables not showing in Table Editor
- Refresh the page
- Check the SQL Editor for any error messages
- Verify the SQL ran successfully

### RLS policies not working
- Make sure you ran the entire SQL script
- Check that RLS is enabled on both tables
- Verify policies exist in Table Editor → Policies

---

## 📞 Need Help?

If you encounter issues:
1. Check Lovable's console for errors
2. Verify database connection in Lovable settings
3. Make sure you're logged in as an admin user
4. Check browser console for JavaScript errors

---

## 🎉 You're Done!

Once the SQL runs successfully, your admin panel is fully functional and connected to Lovable Cloud's database!

**Next Steps:**
1. Create some test quizzes
2. Assign admin roles to other users
3. Test the quiz lifecycle (start/end)
4. Monitor quiz scores

Enjoy your new admin panel! 🚀
