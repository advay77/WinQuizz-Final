-- Create KYC Documents table for storing user ID proof uploads
-- This table stores front and back photos of ID documents for KYC verification

CREATE TABLE IF NOT EXISTS public.kyc_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL CHECK (document_type IN ('aadhar', 'passport', 'driving_license', 'voter_id', 'pan_card')),
    front_photo_url TEXT NOT NULL,
    back_photo_url TEXT,
    document_number VARCHAR(100),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_notes TEXT,
    reviewed_by UUID REFERENCES public.profiles(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Ensure one active KYC request per user at a time
    CONSTRAINT unique_active_kyc_per_user EXCLUDE (user_id WITH =) WHERE (status = 'pending')
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_kyc_documents_user_id ON public.kyc_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_documents_status ON public.kyc_documents(status);
CREATE INDEX IF NOT EXISTS idx_kyc_documents_submitted_at ON public.kyc_documents(submitted_at);

-- Add RLS policies for security
ALTER TABLE public.kyc_documents ENABLE ROW LEVEL SECURITY;

-- Users can view and insert their own KYC documents
CREATE POLICY "Users can view own KYC documents" ON public.kyc_documents
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own KYC documents" ON public.kyc_documents
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Only admins can update KYC documents (review/approve/reject)
CREATE POLICY "Admins can update KYC documents" ON public.kyc_documents
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_kyc_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_kyc_updated_at_trigger ON public.kyc_documents;
CREATE TRIGGER update_kyc_updated_at_trigger
    BEFORE UPDATE ON public.kyc_documents
    FOR EACH ROW EXECUTE FUNCTION update_kyc_updated_at();

-- Function to check if user has approved KYC
CREATE OR REPLACE FUNCTION has_approved_kyc(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.kyc_documents
        WHERE user_id = user_uuid AND status = 'approved'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add KYC status to profiles table for easy checking
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS kyc_status VARCHAR(20) DEFAULT 'not_submitted' CHECK (kyc_status IN ('not_submitted', 'pending', 'approved', 'rejected'));

-- Function to update profile KYC status based on latest KYC document status
CREATE OR REPLACE FUNCTION update_profile_kyc_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the profile's KYC status based on the latest KYC document
    UPDATE public.profiles
    SET kyc_status = (
        SELECT COALESCE(
            (SELECT status FROM public.kyc_documents WHERE user_id = NEW.user_id ORDER BY submitted_at DESC LIMIT 1),
            'not_submitted'
        )
    )
    WHERE id = NEW.user_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update profile KYC status when KYC document status changes
DROP TRIGGER IF EXISTS update_profile_kyc_status_trigger ON public.kyc_documents;
CREATE TRIGGER update_profile_kyc_status_trigger
    AFTER INSERT OR UPDATE ON public.kyc_documents
    FOR EACH ROW EXECUTE FUNCTION update_profile_kyc_status();

-- Create storage bucket for KYC documents (if using Supabase Storage)
INSERT INTO storage.buckets (id, name, public)
VALUES ('kyc-documents', 'kyc-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for KYC documents
CREATE POLICY "Users can upload their own KYC documents" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'kyc-documents' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can view their own KYC documents" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'kyc-documents' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Admins can view all KYC documents" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'kyc-documents' AND
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Comments for documentation
COMMENT ON TABLE public.kyc_documents IS 'Stores KYC document uploads for user verification';
COMMENT ON COLUMN public.kyc_documents.document_type IS 'Type of ID document: aadhar, passport, driving_license, voter_id, pan_card';
COMMENT ON COLUMN public.kyc_documents.status IS 'KYC verification status: pending, approved, rejected';
COMMENT ON COLUMN public.profiles.kyc_status IS 'User KYC status derived from latest KYC document';
