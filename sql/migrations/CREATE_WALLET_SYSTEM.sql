-- Create user wallet table for coin system
CREATE TABLE IF NOT EXISTS user_wallets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  coins INTEGER DEFAULT 100, -- Starting coins for new users
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for user_wallets
ALTER TABLE user_wallets ENABLE ROW LEVEL SECURITY;

-- Policies for user_wallets table
CREATE POLICY "Users can view own wallet"
  ON user_wallets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own wallet"
  ON user_wallets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all wallets"
  ON user_wallets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Function to initialize wallet for new users
CREATE OR REPLACE FUNCTION initialize_user_wallet()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_wallets (user_id, coins)
  VALUES (NEW.id, 100)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to initialize wallet for new users
DROP TRIGGER IF EXISTS on_auth_user_created_wallet ON auth.users;
CREATE TRIGGER on_auth_user_created_wallet
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION initialize_user_wallet();

-- Insert wallets for existing users (if any don't have them)
INSERT INTO user_wallets (user_id, coins)
SELECT id, 100 FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_wallets)
ON CONFLICT (user_id) DO NOTHING;

-- Function to deduct coins from wallet
CREATE OR REPLACE FUNCTION deduct_quiz_coins(quiz_fee INTEGER, user_id_param UUID)
RETURNS BOOLEAN AS $$
DECLARE
  current_coins INTEGER;
BEGIN
  -- Get current coin balance
  SELECT coins INTO current_coins FROM user_wallets WHERE user_id = user_id_param;

  -- Check if user has enough coins
  IF current_coins < quiz_fee THEN
    RETURN FALSE;
  END IF;

  -- Deduct coins
  UPDATE user_wallets
  SET coins = coins - quiz_fee, updated_at = NOW()
  WHERE user_id = user_id_param;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add coins to wallet (for admin use)
CREATE OR REPLACE FUNCTION add_user_coins(coins_to_add INTEGER, user_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE user_wallets
  SET coins = coins + coins_to_add, updated_at = NOW()
  WHERE user_id = user_id_param;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
