-- Create leaderboard tables for tracking quiz results and rankings

-- Table for storing quiz leaderboard entries
CREATE TABLE IF NOT EXISTS quiz_leaderboard (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  percentage DECIMAL(5,2) NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  rank INTEGER,

  -- Ensure unique user per quiz
  UNIQUE(quiz_id, user_id)
);

-- Table for storing overall user rankings across all quizzes
CREATE TABLE IF NOT EXISTS user_rankings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  total_score INTEGER DEFAULT 0,
  quizzes_completed INTEGER DEFAULT 0,
  average_score DECIMAL(5,2) DEFAULT 0,
  best_score INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for leaderboard tables
ALTER TABLE quiz_leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_rankings ENABLE ROW LEVEL SECURITY;

-- Policies for quiz_leaderboard
CREATE POLICY "Users can view leaderboard entries"
  ON quiz_leaderboard FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own leaderboard entries"
  ON quiz_leaderboard FOR INSERT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all leaderboard entries"
  ON quiz_leaderboard FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Policies for user_rankings
CREATE POLICY "Users can view own rankings"
  ON user_rankings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own rankings"
  ON user_rankings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own rankings"
  ON user_rankings FOR INSERT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all rankings"
  ON user_rankings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Function to update leaderboard after quiz completion
CREATE OR REPLACE FUNCTION update_quiz_leaderboard()
RETURNS TRIGGER AS $$
DECLARE
  quiz_score INTEGER;
  total_questions INTEGER;
  percentage DECIMAL(10,2);
BEGIN
  -- Calculate score and percentage
  quiz_score := NEW.score;
  total_questions := NEW.total_questions;
  percentage := (quiz_score::DECIMAL / total_questions::DECIMAL) * 100;

  -- Insert or update leaderboard entry
  INSERT INTO quiz_leaderboard (quiz_id, user_id, score, total_questions, percentage, completed_at)
  VALUES (NEW.quiz_id, NEW.user_id, quiz_score, total_questions, percentage, NEW.completed_at)
  ON CONFLICT (quiz_id, user_id)
  DO UPDATE SET
    score = EXCLUDED.score,
    total_questions = EXCLUDED.total_questions,
    percentage = EXCLUDED.percentage,
    completed_at = EXCLUDED.completed_at;

  -- Update or insert user rankings
  INSERT INTO user_rankings (user_id, total_score, quizzes_completed, average_score, best_score)
  VALUES (NEW.user_id, quiz_score, 1, percentage, quiz_score)
  ON CONFLICT (user_id)
  DO UPDATE SET
    total_score = user_rankings.total_score + quiz_score,
    quizzes_completed = user_rankings.quizzes_completed + 1,
    average_score = (user_rankings.total_score + quiz_score)::DECIMAL / (user_rankings.quizzes_completed + 1)::DECIMAL,
    best_score = GREATEST(user_rankings.best_score, quiz_score),
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update leaderboard when quiz scores are inserted/updated
DROP TRIGGER IF EXISTS on_quiz_score_update_leaderboard ON public.user_quiz_scores;
CREATE TRIGGER on_quiz_score_update_leaderboard
  AFTER INSERT OR UPDATE ON public.user_quiz_scores
  FOR EACH ROW EXECUTE FUNCTION update_quiz_leaderboard();

-- Function to recalculate rankings for a specific quiz
CREATE OR REPLACE FUNCTION recalculate_quiz_rankings(quiz_id_param UUID)
RETURNS VOID AS $$
BEGIN
  -- Update ranks for the specified quiz
  UPDATE quiz_leaderboard
  SET rank = sub.rank
  FROM (
    SELECT
      id,
      ROW_NUMBER() OVER (ORDER BY percentage DESC, completed_at ASC) as rank
    FROM quiz_leaderboard
    WHERE quiz_id = quiz_id_param
  ) sub
  WHERE quiz_leaderboard.id = sub.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to recalculate all rankings
CREATE OR REPLACE FUNCTION recalculate_all_rankings()
RETURNS VOID AS $$
DECLARE
  quiz_record RECORD;
BEGIN
  -- Loop through all quizzes and recalculate rankings
  FOR quiz_record IN SELECT DISTINCT quiz_id FROM quiz_leaderboard LOOP
    PERFORM recalculate_quiz_rankings(quiz_record.quiz_id);
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_quiz_leaderboard_quiz_id ON quiz_leaderboard(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_leaderboard_user_id ON quiz_leaderboard(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_leaderboard_percentage ON quiz_leaderboard(percentage DESC);
CREATE INDEX IF NOT EXISTS idx_user_rankings_average_score ON user_rankings(average_score DESC);

-- Initialize rankings for existing quiz scores
SELECT update_quiz_leaderboard() FROM user_quiz_scores;
