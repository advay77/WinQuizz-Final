-- Replace entry_fee with coin system
-- Rename entry_fee column to coins_required

-- Step 1: Add new coins_required column
ALTER TABLE public.quizzes ADD COLUMN IF NOT EXISTS coins_required INTEGER DEFAULT 0;

-- Step 2: Copy existing entry_fee data to coins_required (assuming 1 rupee = 1 coin for now)
UPDATE public.quizzes SET coins_required = entry_fee WHERE entry_fee IS NOT NULL;

-- Step 3: Drop the old entry_fee column
ALTER TABLE public.quizzes DROP COLUMN IF EXISTS entry_fee;

-- Step 4: Rename coins_required to entry_fee (so the column name matches the interface)
ALTER TABLE public.quizzes RENAME COLUMN coins_required TO entry_fee;

-- Step 5: Add a comment to clarify this is now coins
COMMENT ON COLUMN public.quizzes.entry_fee IS 'Entry fee in coins (not rupees)';

-- Step 6: Update any existing records to have a reasonable coin value if they were 0
UPDATE public.quizzes SET entry_fee = 10 WHERE entry_fee = 0;
