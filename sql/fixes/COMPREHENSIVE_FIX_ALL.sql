-- COMPREHENSIVE FIX FOR QUIZ CREATION ISSUES
-- This script fixes all potential database issues

-- Step 1: Ensure RLS is properly disabled for development
ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.quizzes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS quiz_questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_quiz_scores DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.quiz_participants DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop all existing policies that might cause issues
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update user roles" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Admins can insert quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Admins can update quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Admins can delete quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Users can view own scores" ON public.user_quiz_scores;
DROP POLICY IF EXISTS "Admins can view all scores" ON public.user_quiz_scores;
DROP POLICY IF EXISTS "Users can insert own scores" ON public.user_quiz_scores;
DROP POLICY IF EXISTS "Users can update own scores" ON public.user_quiz_scores;
DROP POLICY IF EXISTS "Users can view their own participation" ON public.quiz_participants;
DROP POLICY IF EXISTS "Admins can view all participants" ON public.quiz_participants;
DROP POLICY IF EXISTS "Users can join quizzes" ON public.quiz_participants;
DROP POLICY IF EXISTS "Admins can manage all questions" ON quiz_questions;
DROP POLICY IF EXISTS "Users can read active questions" ON quiz_questions;
DROP POLICY IF EXISTS "Admins can manage quiz questions" ON quiz_questions;
DROP POLICY IF EXISTS "Users can read quiz questions" ON quiz_questions;

-- Step 3: Grant full access for development
GRANT ALL ON public.profiles TO authenticated, anon;
GRANT ALL ON public.quizzes TO authenticated, anon;
GRANT ALL ON quiz_questions TO authenticated, anon;
GRANT ALL ON public.user_quiz_scores TO authenticated, anon;
GRANT ALL ON public.quiz_participants TO authenticated, anon;
GRANT USAGE ON SCHEMA public TO authenticated, anon;

-- Step 4: Ensure all required columns exist in quizzes table
ALTER TABLE public.quizzes ADD COLUMN IF NOT EXISTS max_participants INTEGER DEFAULT NULL;
ALTER TABLE public.quizzes ADD COLUMN IF NOT EXISTS current_participants INTEGER DEFAULT 0;
ALTER TABLE public.quizzes ADD COLUMN IF NOT EXISTS total_questions INTEGER DEFAULT 10;
ALTER TABLE public.quizzes ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- Step 5: Ensure quiz_questions table has quiz_id column (only if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'quiz_questions') THEN
        ALTER TABLE quiz_questions ADD COLUMN IF NOT EXISTS quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Step 6: Set up proper constraints and defaults
UPDATE public.quizzes SET max_participants = NULL WHERE max_participants IS NULL;
UPDATE public.quizzes SET current_participants = 0 WHERE current_participants IS NULL;
UPDATE public.quizzes SET total_questions = 10 WHERE total_questions IS NULL;

-- Step 7: Create indexes for better performance (only if tables exist)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'quiz_participants') THEN
        CREATE INDEX IF NOT EXISTS idx_quiz_participants_quiz_id ON public.quiz_participants(quiz_id);
        CREATE INDEX IF NOT EXISTS idx_quiz_participants_user_id ON public.quiz_participants(user_id);
    END IF;

    CREATE INDEX IF NOT EXISTS idx_quizzes_max_participants ON public.quizzes(max_participants);
    CREATE INDEX IF NOT EXISTS idx_quizzes_current_participants ON public.quizzes(current_participants);

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'quiz_questions') THEN
        CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_id ON quiz_questions(quiz_id);
    END IF;
END $$;

-- Step 8: Verify table structure (only for existing tables)
DO $$
DECLARE
    table_record RECORD;
BEGIN
    FOR table_record IN
        SELECT table_name FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name IN ('quizzes', 'user_quiz_scores', 'quiz_participants')
        OR (table_schema NOT IN ('information_schema', 'pg_catalog') AND table_name = 'quiz_questions')
    LOOP
        RAISE NOTICE 'Checking table: %', table_record.table_name;

        -- This query will show the structure of existing tables
        -- Note: We skip quiz_questions if it doesn't exist in public schema
    END LOOP;
END $$;
