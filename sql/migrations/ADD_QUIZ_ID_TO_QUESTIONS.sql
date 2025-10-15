-- Add quiz_id field to quiz_questions table for admin-created quiz questions

-- Add quiz_id column to link questions to specific quizzes
ALTER TABLE quiz_questions ADD COLUMN IF NOT EXISTS quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_id ON quiz_questions(quiz_id);

-- Update RLS policies to allow quiz-specific question access
DROP POLICY IF EXISTS "Admins can manage all questions" ON quiz_questions;
DROP POLICY IF EXISTS "Users can read active questions" ON quiz_questions;

-- Allow admins to manage questions for their quizzes
CREATE POLICY "Admins can manage quiz questions" ON quiz_questions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.quizzes q
      JOIN public.profiles p ON p.id = auth.uid()
      WHERE (q.id = quiz_questions.quiz_id OR quiz_questions.quiz_id IS NULL)
      AND p.role = 'admin'
    )
  );

-- Allow users to read questions for active quizzes they're participating in
CREATE POLICY "Users can read quiz questions" ON quiz_questions
  FOR SELECT USING (
    is_active = TRUE AND (
      quiz_id IS NULL OR
      EXISTS (
        SELECT 1 FROM public.quiz_participants qp
        WHERE qp.quiz_id = quiz_questions.quiz_id AND qp.user_id = auth.uid()
      )
    )
  );
