-- TEST DATABASE SETUP
-- Run this to verify everything is working

-- Test 1: Check if tables exist and have correct structure
SELECT
  schemaname,
  tablename,
  (SELECT count(*) FROM information_schema.columns WHERE table_name = t.tablename) as column_count
FROM information_schema.tables t
WHERE schemaname = 'public'
  AND tablename IN ('quizzes', 'quiz_questions', 'user_quiz_scores', 'quiz_participants', 'profiles')
ORDER BY tablename;

-- Test 2: Check if current user is admin
SELECT
  u.email,
  p.role,
  p.email_verified,
  p.phone_verified
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.id = auth.uid();

-- Test 3: Try to insert a test quiz (this should work if everything is set up correctly)
DO $$
DECLARE
    test_quiz_id UUID;
    current_user_id UUID;
BEGIN
    SELECT auth.uid() INTO current_user_id;

    -- Insert test quiz
    INSERT INTO public.quizzes (
        title,
        description,
        time_limit_minutes,
        entry_fee,
        start_time,
        end_time,
        total_questions,
        max_participants,
        created_by,
        status
    ) VALUES (
        'Test Quiz - Database Check',
        'This is a test quiz to verify database setup',
        15,
        0,
        NOW(),
        NOW() + INTERVAL '1 hour',
        1,
        10,
        current_user_id,
        'active'
    ) RETURNING id INTO test_quiz_id;

    -- Insert test question
    INSERT INTO quiz_questions (
        quiz_id,
        question,
        option_a,
        option_b,
        option_c,
        option_d,
        correct_answer,
        is_active
    ) VALUES (
        test_quiz_id,
        'What is 2 + 2?',
        '3',
        '4',
        '5',
        '6',
        'B',
        true
    );

    RAISE NOTICE 'Test quiz created successfully with ID: %', test_quiz_id;

    -- Clean up test data
    DELETE FROM quiz_questions WHERE quiz_id = test_quiz_id;
    DELETE FROM public.quizzes WHERE id = test_quiz_id;

    RAISE NOTICE 'Test cleanup completed successfully';

EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Test failed: %', SQLERRM;
END $$;

-- Test 4: Check for any constraint violations or issues
SELECT
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_schema = 'public'
  AND tc.table_name IN ('quizzes', 'quiz_questions', 'user_quiz_scores', 'quiz_participants')
ORDER BY tc.table_name, tc.constraint_name;
