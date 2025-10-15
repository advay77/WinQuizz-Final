-- Add wallet_balance and documents_verified columns to profiles table
ALTER TABLE profiles
ADD COLUMN wallet_balance DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN documents_verified BOOLEAN DEFAULT FALSE;
