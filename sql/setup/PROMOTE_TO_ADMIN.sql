-- PROMOTE CURRENT USER TO ADMIN
-- Run this if you're getting admin privilege errors

-- First, check if the current user exists in profiles
DO $$
DECLARE
    current_user_id UUID;
    user_email TEXT;
BEGIN
    -- Get current user
    SELECT auth.uid() INTO current_user_id;

    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'No authenticated user found';
    END IF;

    -- Get user email for reference
    SELECT email INTO user_email FROM auth.users WHERE id = current_user_id;

    -- Check if profile exists
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = current_user_id) THEN
        -- Create profile if it doesn't exist
        INSERT INTO public.profiles (id, email, role, email_verified, phone_verified)
        VALUES (current_user_id, user_email, 'admin', true, true);
        RAISE NOTICE 'Created admin profile for user: %', user_email;
    ELSE
        -- Update existing profile to admin
        UPDATE public.profiles
        SET role = 'admin', email_verified = true, phone_verified = true
        WHERE id = current_user_id;
        RAISE NOTICE 'Promoted user % to admin role', user_email;
    END IF;

    RAISE NOTICE 'User % is now an admin!', user_email;
END $$;

-- Verify the promotion worked
SELECT
    p.email,
    p.role,
    p.email_verified,
    p.phone_verified
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.role = 'admin';
