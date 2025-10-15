-- Add role column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- Update existing profiles to have 'user' role if null
UPDATE public.profiles SET role = 'user' WHERE role IS NULL;

-- Create quizzes table
CREATE TABLE public.quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'cancelled')),
  total_questions INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) NOT NULL
);

-- Enable RLS for quizzes
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

-- Policies for quizzes table
CREATE POLICY "Anyone can view quizzes"
  ON public.quizzes FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert quizzes"
  ON public.quizzes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update quizzes"
  ON public.quizzes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete quizzes"
  ON public.quizzes FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Create user_quiz_scores table
CREATE TABLE public.user_quiz_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE NOT NULL,
  score INTEGER DEFAULT 0,
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER DEFAULT 0,
  time_taken_seconds INTEGER,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, quiz_id)
);

-- Enable RLS for user_quiz_scores
ALTER TABLE public.user_quiz_scores ENABLE ROW LEVEL SECURITY;

-- Policies for user_quiz_scores table
CREATE POLICY "Users can view own scores"
  ON public.user_quiz_scores FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all scores"
  ON public.user_quiz_scores FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Users can insert own scores"
  ON public.user_quiz_scores FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scores"
  ON public.user_quiz_scores FOR UPDATE
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_quizzes_status ON public.quizzes(status);
CREATE INDEX IF NOT EXISTS idx_quizzes_created_by ON public.quizzes(created_by);
CREATE INDEX IF NOT EXISTS idx_user_quiz_scores_user_id ON public.user_quiz_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_user_quiz_scores_quiz_id ON public.user_quiz_scores(quiz_id);
CREATE INDEX IF NOT EXISTS idx_user_quiz_scores_completed_at ON public.user_quiz_scores(completed_at);

-- Update profiles RLS policies to allow admins to view all users
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Allow admins to update user roles
CREATE POLICY "Admins can update user roles"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );
