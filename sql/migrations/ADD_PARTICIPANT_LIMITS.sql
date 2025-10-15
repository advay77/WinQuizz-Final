-- Add participant limit and tracking for admin-created quizzes

-- Add participant limit to quizzes table
ALTER TABLE public.quizzes ADD COLUMN IF NOT EXISTS max_participants INTEGER DEFAULT NULL;
ALTER TABLE public.quizzes ADD COLUMN IF NOT EXISTS current_participants INTEGER DEFAULT 0;

-- Create quiz_participants table to track participants
CREATE TABLE IF NOT EXISTS public.quiz_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(quiz_id, user_id)
);

-- Enable RLS for quiz_participants
ALTER TABLE public.quiz_participants ENABLE ROW LEVEL SECURITY;

-- Policies for quiz_participants
CREATE POLICY "Users can view their own participation"
  ON public.quiz_participants FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all participants"
  ON public.quiz_participants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Users can join quizzes"
  ON public.quiz_participants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Update existing quizzes to have no participant limit by default (NULL means unlimited)
UPDATE public.quizzes SET max_participants = NULL WHERE max_participants IS NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_quiz_participants_quiz_id ON public.quiz_participants(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_participants_user_id ON public.quiz_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_max_participants ON public.quizzes(max_participants);
CREATE INDEX IF NOT EXISTS idx_quizzes_current_participants ON public.quizzes(current_participants);
