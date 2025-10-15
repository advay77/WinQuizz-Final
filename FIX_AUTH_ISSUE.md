# Fix Auth 400 Error - Step by Step

## Problem
Getting `400 Bad Request` when trying to sign up or login because Supabase email auth is not configured properly.

## Solution

### Step 1: Disable Email Confirmation (CRITICAL)
1. Go to: https://supabase.com/dashboard/project/usqsjbzcrdwvutccqnbm/auth/providers
2. Click on **Email** provider
3. Find **"Confirm email"** toggle
4. **Turn it OFF** (disable it)
5. Click **Save**

This is critical because you're using custom EmailJS verification, not Supabase's built-in email confirmation.

### Step 2: Configure Auth Settings
1. Go to: https://supabase.com/dashboard/project/usqsjbzcrdwvutccqnbm/auth/url-configuration
2. Set **Site URL** to: `http://localhost:5173`
3. Add **Redirect URLs**:
   - `http://localhost:5173/verify`
   - `http://localhost:5173/dashboard`
   - `http://localhost:5173/auth`
4. Click **Save**

### Step 3: Verify Database Trigger
Run this SQL in Supabase SQL Editor to check if the trigger exists:

```sql
-- Check if trigger exists
SELECT 
  trigger_name, 
  event_manipulation, 
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- Check if function exists
SELECT 
  routine_name,
  routine_definition
FROM information_schema.routines
WHERE routine_name = 'handle_new_user';
```

If the trigger doesn't exist, run the COMPLETE_DATABASE_SETUP.sql again.

### Step 4: Test Auth Flow

1. **Sign Up**:
   - Email: `test@example.com`
   - Password: `password123`
   - Phone: `+911234567890`
   - Full Name: `Test User`

2. After signup, you should be redirected to `/verify`

3. On verify page:
   - Click "Send Code" for email
   - Enter the 6-digit code from console logs
   - Click "Send Code" for phone
   - Enter the 6-digit code from console logs

4. After both verifications, you'll be redirected to dashboard

## Common Issues

### Issue: "User already registered"
- The user exists but can't login
- **Solution**: Go to Supabase Dashboard → Authentication → Users → Delete the test user and try again

### Issue: "Invalid login credentials"
- Email confirmation is still enabled
- **Solution**: Go back to Step 1 and disable email confirmation

### Issue: "Profile not found"
- The trigger didn't create the profile
- **Solution**: Run COMPLETE_DATABASE_SETUP.sql again to recreate the trigger

## Verification Checklist

- [ ] Email confirmation is DISABLED in Supabase
- [ ] Site URL is set to `http://localhost:5173`
- [ ] Redirect URLs are configured
- [ ] Database trigger `on_auth_user_created` exists
- [ ] Function `handle_new_user` exists
- [ ] Dev server is running (`npm run dev`)
- [ ] Console shows no CORS errors

## Still Having Issues?

Check the browser console for the exact error message and look for:
- `Signup error:` - Shows the actual Supabase error
- `Profile update error:` - Shows if profile creation failed
- `Login error:` - Shows authentication issues

The console logs will tell you exactly what's wrong.
