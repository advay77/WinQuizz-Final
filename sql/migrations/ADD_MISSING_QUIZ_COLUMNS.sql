-- Add missing columns to quizzes table
-- This fixes the "entry_fee column not found" error

-- Add entry_fee column (for coin-based pricing)
ALTER TABLE public.quizzes ADD COLUMN IF NOT EXISTS entry_fee INTEGER DEFAULT 0;

-- Add time_limit_minutes column
ALTER TABLE public.quizzes ADD COLUMN IF NOT EXISTS time_limit_minutes INTEGER DEFAULT 15;

-- Add max_participants column
ALTER TABLE public.quizzes ADD COLUMN IF NOT EXISTS max_participants INTEGER DEFAULT NULL;

-- Add current_participants column
ALTER TABLE public.quizzes ADD COLUMN IF NOT EXISTS current_participants INTEGER DEFAULT 0;

-- Update existing records to have reasonable defaults
UPDATE public.quizzes SET entry_fee = 0 WHERE entry_fee IS NULL;
UPDATE public.quizzes SET time_limit_minutes = 15 WHERE time_limit_minutes IS NULL;
UPDATE public.quizzes SET current_participants = 0 WHERE current_participants IS NULL;

-- Add comments for clarity
COMMENT ON COLUMN public.quizzes.entry_fee IS 'Entry fee in coins (0 = free)';
COMMENT ON COLUMN public.quizzes.time_limit_minutes IS 'Time limit for quiz completion in minutes';
COMMENT ON COLUMN public.quizzes.max_participants IS 'Maximum number of participants (NULL = unlimited)';
COMMENT ON COLUMN public.quizzes.current_participants IS 'Current number of participants';

-- Verify the columns were added
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'quizzes'
  AND table_schema = 'public'
  AND column_name IN ('entry_fee', 'time_limit_minutes', 'max_participants', 'current_participants')
ORDER BY ordinal_position;
