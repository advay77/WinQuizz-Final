-- Add wallet_balance column to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS wallet_balance INTEGER DEFAULT 100;

-- Update existing users to have wallet balance
UPDATE public.profiles
SET wallet_balance = 100
WHERE wallet_balance IS NULL;

-- Add comment to explain the column
COMMENT ON COLUMN public.profiles.wallet_balance IS 'User wallet balance in coins for quiz entry fees';

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_wallet_balance
ON public.profiles(wallet_balance);
