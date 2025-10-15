-- =====================================================
-- Admin Panel Database Migration
-- Run this in your Supabase SQL Editor
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

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Migration completed successfully!';
  RAISE NOTICE 'Tables created: quizzes, user_quiz_scores';
  RAISE NOTICE 'RLS policies applied';
  RAISE NOTICE 'Indexes created for performance';
END $$;
