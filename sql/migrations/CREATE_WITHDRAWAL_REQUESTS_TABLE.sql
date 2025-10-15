-- Create withdrawal requests table for handling user withdrawal requests
-- This table stores withdrawal requests that require admin approval

CREATE TABLE IF NOT EXISTS public.withdrawal_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    payment_method VARCHAR(50) NOT NULL,
    payment_details TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
    admin_notes TEXT,
    reviewed_by UUID REFERENCES public.profiles(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    processed_at TIMESTAMP WITH TIME ZONE,
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Ensure minimum withdrawal amount
    CONSTRAINT minimum_withdrawal CHECK (amount >= 100.00)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_user_id ON public.withdrawal_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_status ON public.withdrawal_requests(status);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_requested_at ON public.withdrawal_requests(requested_at);

-- Add RLS policies for security
ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;

-- Users can view and insert their own withdrawal requests
CREATE POLICY "Users can view own withdrawal requests" ON public.withdrawal_requests
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own withdrawal requests" ON public.withdrawal_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Only admins can update withdrawal requests (review/approve/reject)
CREATE POLICY "Admins can update withdrawal requests" ON public.withdrawal_requests
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_withdrawal_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_withdrawal_updated_at_trigger ON public.withdrawal_requests;
CREATE TRIGGER update_withdrawal_updated_at_trigger
    BEFORE UPDATE ON public.withdrawal_requests
    FOR EACH ROW EXECUTE FUNCTION update_withdrawal_updated_at();

-- Function to check if withdrawal amount is valid (user has sufficient balance and KYC approved)
CREATE OR REPLACE FUNCTION validate_withdrawal_request()
RETURNS TRIGGER AS $$
DECLARE
    user_balance DECIMAL(10,2);
    user_kyc_approved BOOLEAN;
BEGIN
    -- Get user's wallet balance
    SELECT wallet_balance INTO user_balance
    FROM public.profiles
    WHERE id = NEW.user_id;

    -- Check if user has sufficient balance
    IF user_balance < NEW.amount THEN
        RAISE EXCEPTION 'Insufficient wallet balance for withdrawal';
    END IF;

    -- Check if user has approved KYC
    SELECT EXISTS(
        SELECT 1 FROM public.kyc_documents
        WHERE user_id = NEW.user_id AND status = 'approved'
    ) INTO user_kyc_approved;

    IF NOT user_kyc_approved THEN
        RAISE EXCEPTION 'KYC verification required for withdrawals';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to validate withdrawal requests
DROP TRIGGER IF EXISTS validate_withdrawal_request_trigger ON public.withdrawal_requests;
CREATE TRIGGER validate_withdrawal_request_trigger
    BEFORE INSERT ON public.withdrawal_requests
    FOR EACH ROW EXECUTE FUNCTION validate_withdrawal_request();

-- Function to deduct amount from wallet when withdrawal is completed
CREATE OR REPLACE FUNCTION process_withdrawal_completion()
RETURNS TRIGGER AS $$
BEGIN
    -- If status changed to 'completed', deduct from wallet
    IF OLD.status != 'completed' AND NEW.status = 'completed' THEN
        UPDATE public.profiles
        SET wallet_balance = wallet_balance - NEW.amount
        WHERE id = NEW.user_id;

        NEW.processed_at = NOW();
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to process withdrawal completion
DROP TRIGGER IF EXISTS process_withdrawal_completion_trigger ON public.withdrawal_requests;
CREATE TRIGGER process_withdrawal_completion_trigger
    AFTER UPDATE ON public.withdrawal_requests
    FOR EACH ROW EXECUTE FUNCTION process_withdrawal_completion();

-- Comments for documentation
COMMENT ON TABLE public.withdrawal_requests IS 'Stores user withdrawal requests that require admin approval';
COMMENT ON COLUMN public.withdrawal_requests.payment_method IS 'Payment method: bank_transfer, upi, paytm, phonepe, google_pay';
COMMENT ON COLUMN public.withdrawal_requests.status IS 'Withdrawal status: pending, approved, rejected, completed';
