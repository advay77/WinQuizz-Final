-- Add flexible prizes system to quizzes table
-- This migration replaces the rigid prize_first, prize_second, prize_third columns
-- with a flexible prizes JSONB column that can store unlimited prizes of any type

-- First, drop the old rigid prize columns (if they exist)
ALTER TABLE public.quizzes
DROP COLUMN IF EXISTS prize_first,
DROP COLUMN IF EXISTS prize_second,
DROP COLUMN IF EXISTS prize_third;

-- Add the new flexible prizes column
ALTER TABLE public.quizzes
ADD COLUMN IF NOT EXISTS prizes JSONB DEFAULT '[]'::jsonb;

-- Add a comment to explain the prizes structure
COMMENT ON COLUMN public.quizzes.prizes IS 'Flexible prize structure as JSONB array. Each prize object should have: position (number), prize_name (string), prize_value (number|null), prize_description (string)';

-- Create an index for better query performance on prizes
CREATE INDEX IF NOT EXISTS idx_quizzes_prizes ON public.quizzes USING GIN (prizes);

-- Update existing quizzes to have a default prize structure if they don't have prizes
UPDATE public.quizzes
SET prizes = '[{"position": 1, "prize_name": "1st Place", "prize_value": 100, "prize_description": "Winner takes all"}]'
WHERE prizes = '[]'::jsonb OR prizes IS NULL;

-- Create a function to validate prize structure
CREATE OR REPLACE FUNCTION validate_quiz_prizes()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure prizes is a valid JSON array
  IF NEW.prizes IS NOT NULL AND NOT jsonb_typeof(NEW.prizes) = 'array' THEN
    RAISE EXCEPTION 'prizes must be a JSON array';
  END IF;

  -- Ensure each prize has required fields
  IF NEW.prizes IS NOT NULL THEN
    FOR i IN 0 .. jsonb_array_length(NEW.prizes) - 1 LOOP
      IF NOT (NEW.prizes->i ? 'position' AND NEW.prizes->i ? 'prize_name' AND NEW.prizes->i ? 'prize_description') THEN
        RAISE EXCEPTION 'Each prize must have position, prize_name, and prize_description fields';
      END IF;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to validate prizes on insert/update
DROP TRIGGER IF EXISTS validate_quiz_prizes_trigger ON public.quizzes;
CREATE TRIGGER validate_quiz_prizes_trigger
  BEFORE INSERT OR UPDATE ON public.quizzes
  FOR EACH ROW EXECUTE FUNCTION validate_quiz_prizes();

-- Create a function to migrate existing prize data (if any old columns exist)
-- This is a safety function in case old data needs to be migrated
CREATE OR REPLACE FUNCTION migrate_old_prize_data()
RETURNS VOID AS $$
DECLARE
  quiz_record RECORD;
BEGIN
  -- This function can be used if old prize columns existed and need migration
  -- For now, it just ensures all quizzes have the new prizes structure
  UPDATE public.quizzes
  SET prizes = prizes || '[]'::jsonb
  WHERE jsonb_array_length(prizes) = 0;
END;
$$ LANGUAGE plpgsql;

-- Run the migration function
SELECT migrate_old_prize_data();
