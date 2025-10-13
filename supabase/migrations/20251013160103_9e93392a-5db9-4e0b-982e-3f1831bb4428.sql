-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  phone TEXT,
  full_name TEXT,
  email_verified BOOLEAN DEFAULT FALSE,
  phone_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create games table
CREATE TABLE public.games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  prize_amount DECIMAL(10, 2),
  prize_description TEXT,
  total_questions INTEGER DEFAULT 10,
  time_limit_minutes INTEGER DEFAULT 15,
  entry_fee DECIMAL(10, 2) DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'upcoming')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for games
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

-- Allow everyone to view active games
CREATE POLICY "Anyone can view active games"
  ON public.games FOR SELECT
  USING (status = 'active' OR status = 'upcoming');

-- Create user_game_progress table
CREATE TABLE public.user_game_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  game_id UUID REFERENCES public.games(id) ON DELETE CASCADE NOT NULL,
  score INTEGER DEFAULT 0,
  total_questions INTEGER,
  correct_answers INTEGER DEFAULT 0,
  time_taken_seconds INTEGER,
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, game_id)
);

-- Enable RLS
ALTER TABLE public.user_game_progress ENABLE ROW LEVEL SECURITY;

-- Policies for user_game_progress
CREATE POLICY "Users can view own progress"
  ON public.user_game_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON public.user_game_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON public.user_game_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, phone, email_verified, phone_verified)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.phone,
    NEW.email_confirmed_at IS NOT NULL,
    NEW.phone_confirmed_at IS NOT NULL
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Insert sample games
INSERT INTO public.games (title, description, prize_amount, prize_description, total_questions, time_limit_minutes, entry_fee, status) VALUES
('General Knowledge Challenge', 'Test your general knowledge across various topics', 50000.00, 'Cash Prize ₹50,000', 15, 20, 50.00, 'active'),
('Sports Trivia Master', 'Prove your sports knowledge and win big!', 100000.00, 'Cash Prize ₹1,00,000', 20, 25, 100.00, 'active'),
('Bollywood Quiz Bonanza', 'How well do you know Bollywood?', 25000.00, 'Premium Smartphone', 12, 15, 25.00, 'active'),
('Science & Technology', 'Challenge yourself with science questions', 75000.00, 'Gaming Laptop', 18, 30, 75.00, 'upcoming'),
('History & Geography', 'Test your knowledge of world history', 150000.00, 'Brand New Car', 25, 40, 150.00, 'upcoming');