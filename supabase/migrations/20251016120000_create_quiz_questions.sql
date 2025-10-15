-- Create quiz_questions table for admin-managed questions
CREATE TABLE quiz_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN ('general_knowledge', 'science_tech', 'entertainment', 'sports', 'history', 'geography', 'arts', 'business')),
  question TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer TEXT NOT NULL CHECK (correct_answer IN ('A', 'B', 'C', 'D')),
  explanation TEXT,
  difficulty TEXT DEFAULT 'easy' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX idx_quiz_questions_category ON quiz_questions(category);
CREATE INDEX idx_quiz_questions_difficulty ON quiz_questions(difficulty);
CREATE INDEX idx_quiz_questions_active ON quiz_questions(is_active);

-- Enable Row Level Security
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;

-- Create policies for quiz_questions
-- Allow admins to manage all questions
CREATE POLICY "Admins can manage all questions" ON quiz_questions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Allow all authenticated users to read active questions
CREATE POLICY "Users can read active questions" ON quiz_questions
  FOR SELECT USING (is_active = TRUE);

-- Create quiz_sessions table for tracking quiz attempts
CREATE TABLE quiz_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  quiz_type TEXT NOT NULL CHECK (quiz_type IN ('demo_general_knowledge', 'demo_science_tech', 'demo_entertainment', 'live')),
  game_id UUID REFERENCES games(id), -- NULL for demo quizzes
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL DEFAULT 0,
  score_percentage DECIMAL(5,2) NOT NULL,
  time_taken_seconds INTEGER NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  answers JSONB -- Store detailed answers for review
);

-- Create index for better performance
CREATE INDEX idx_quiz_sessions_user_id ON quiz_sessions(user_id);
CREATE INDEX idx_quiz_sessions_quiz_type ON quiz_sessions(quiz_type);
CREATE INDEX idx_quiz_sessions_completed_at ON quiz_sessions(completed_at);

-- Enable Row Level Security
ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for quiz_sessions
-- Users can only see their own quiz sessions
CREATE POLICY "Users can view their own quiz sessions" ON quiz_sessions
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own quiz sessions
CREATE POLICY "Users can create their own quiz sessions" ON quiz_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins can view all quiz sessions
CREATE POLICY "Admins can view all quiz sessions" ON quiz_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Insert some sample questions for demo purposes
INSERT INTO quiz_questions (category, question, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty) VALUES
-- General Knowledge
('general_knowledge', 'What is the capital of India?', 'Mumbai', 'Delhi', 'Kolkata', 'Chennai', 'B', 'Delhi is the capital city of India.', 'easy'),
('general_knowledge', 'Which planet is known as the Red Planet?', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'B', 'Mars is known as the Red Planet due to its reddish appearance.', 'easy'),
('general_knowledge', 'Who wrote the Indian national anthem?', 'Rabindranath Tagore', 'Mahatma Gandhi', 'Sardar Vallabhbhai Patel', 'Jawaharlal Nehru', 'A', 'Rabindranath Tagore wrote the Indian national anthem, Jana Gana Mana.', 'easy'),
('general_knowledge', 'What is the largest ocean in the world?', 'Atlantic Ocean', 'Indian Ocean', 'Arctic Ocean', 'Pacific Ocean', 'D', 'The Pacific Ocean is the largest ocean in the world.', 'easy'),
('general_knowledge', 'Which is the longest river in India?', 'Ganges', 'Yamuna', 'Brahmaputra', 'Godavari', 'A', 'The Ganges is the longest river in India.', 'easy'),

-- Science & Technology
('science_tech', 'What is the chemical symbol for water?', 'H2O', 'CO2', 'O2', 'NaCl', 'A', 'H2O is the chemical formula for water.', 'easy'),
('science_tech', 'Which vitamin is produced when skin is exposed to sunlight?', 'Vitamin A', 'Vitamin B', 'Vitamin C', 'Vitamin D', 'D', 'Vitamin D is produced when skin is exposed to sunlight.', 'easy'),
('science_tech', 'What is the powerhouse of the cell?', 'Nucleus', 'Ribosome', 'Mitochondria', 'Endoplasmic Reticulum', 'C', 'Mitochondria is known as the powerhouse of the cell.', 'easy'),
('science_tech', 'Which programming language is known as the mother of all languages?', 'Python', 'Java', 'C', 'Assembly', 'C', 'C is often called the mother of all programming languages.', 'medium'),
('science_tech', 'What does CPU stand for?', 'Central Processing Unit', 'Computer Processing Unit', 'Central Program Unit', 'Computer Program Unit', 'A', 'CPU stands for Central Processing Unit.', 'easy'),

-- Entertainment
('entertainment', 'Which movie won the Oscar for Best Picture in 2023?', 'Oppenheimer', 'Everything Everywhere All at Once', 'The Banshees of Inisherin', 'Top Gun: Maverick', 'A', 'Oppenheimer won the Oscar for Best Picture in 2023.', 'medium'),
('entertainment', 'Who played the character of Iron Man in the Marvel Cinematic Universe?', 'Chris Evans', 'Robert Downey Jr.', 'Chris Hemsworth', 'Mark Ruffalo', 'B', 'Robert Downey Jr. played Iron Man in the Marvel Cinematic Universe.', 'easy'),
('entertainment', 'Which singer is known as the "Queen of Pop"?', 'Britney Spears', 'Madonna', 'Lady Gaga', 'Beyoncé', 'B', 'Madonna is known as the Queen of Pop.', 'easy'),
('entertainment', 'What is the highest-grossing film of all time (unadjusted for inflation)?', 'Titanic', 'Avatar', 'Avengers: Endgame', 'Star Wars: The Force Awakens', 'B', 'Avatar is the highest-grossing film of all time.', 'medium'),
('entertainment', 'Which TV show features the character Walter White?', 'The Sopranos', 'Breaking Bad', 'The Wire', 'Game of Thrones', 'B', 'Walter White is a character in Breaking Bad.', 'easy');
