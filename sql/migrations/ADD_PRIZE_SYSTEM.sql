-- Add prize system to quizzes table
ALTER TABLE public.quizzes ADD COLUMN IF NOT EXISTS prize_first INTEGER DEFAULT 0;
ALTER TABLE public.quizzes ADD COLUMN IF NOT EXISTS prize_second INTEGER DEFAULT 0;
ALTER TABLE public.quizzes ADD COLUMN IF NOT EXISTS prize_third INTEGER DEFAULT 0;

-- Add comments for clarity
COMMENT ON COLUMN public.quizzes.prize_first IS 'Prize in coins for 1st position';
COMMENT ON COLUMN public.quizzes.prize_second IS 'Prize in coins for 2nd position';
COMMENT ON COLUMN public.quizzes.prize_third IS 'Prize in coins for 3rd position';

-- Create quiz_results table to track winners and prize distribution
CREATE TABLE IF NOT EXISTS quiz_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  final_score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  percentage DECIMAL(5,2) NOT NULL,
  position INTEGER, -- 1st, 2nd, 3rd place
  prize_earned INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(quiz_id, user_id)
);

-- Enable RLS for quiz_results
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;

-- Policies for quiz_results table
CREATE POLICY "Users can view own results"
  ON quiz_results FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own results"
  ON quiz_results FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all results"
  ON quiz_results FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update all results"
  ON quiz_results FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_quiz_results_quiz_id ON quiz_results(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_user_id ON quiz_results(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_position ON quiz_results(position);

-- Function to calculate and distribute prizes
CREATE OR REPLACE FUNCTION calculate_quiz_prizes(target_quiz_id UUID)
RETURNS TABLE (
  user_id UUID,
  final_score INTEGER,
  position INTEGER,
  prize_earned INTEGER
) AS $$
DECLARE
  quiz_record RECORD;
  first_prize INTEGER;
  second_prize INTEGER;
  third_prize INTEGER;
BEGIN
  -- Get quiz prize information
  SELECT prize_first, prize_second, prize_third INTO first_prize, second_prize, third_prize
  FROM quizzes WHERE id = target_quiz_id;

  -- Return top 3 results with calculated prizes
  RETURN QUERY
  WITH ranked_results AS (
    SELECT
      qr.user_id,
      qr.final_score,
      ROW_NUMBER() OVER (ORDER BY qr.percentage DESC, qr.completed_at ASC) as rank_position
    FROM quiz_results qr
    WHERE qr.quiz_id = target_quiz_id
    ORDER BY qr.percentage DESC, qr.completed_at ASC
  )
  SELECT
    rr.user_id,
    rr.final_score,
    rr.rank_position,
    CASE
      WHEN rr.rank_position = 1 THEN first_prize
      WHEN rr.rank_position = 2 THEN second_prize
      WHEN rr.rank_position = 3 THEN third_prize
      ELSE 0
    END as prize
  FROM ranked_results rr
  WHERE rr.rank_position <= 3;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to distribute prizes to winners
CREATE OR REPLACE FUNCTION distribute_quiz_prizes(target_quiz_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  prize_result RECORD;
BEGIN
  -- Calculate prizes and get winners
  FOR prize_result IN SELECT * FROM calculate_quiz_prizes(target_quiz_id) LOOP
    -- Update quiz result with prize earned
    UPDATE quiz_results
    SET prize_earned = prize_result.prize
    WHERE quiz_id = target_quiz_id AND user_id = prize_result.user_id;

    -- Add prize to user's wallet
    IF prize_result.prize > 0 THEN
      UPDATE user_wallets
      SET coins = coins + prize_result.prize, updated_at = NOW()
      WHERE user_id = prize_result.user_id;
    END IF;
  END LOOP;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
