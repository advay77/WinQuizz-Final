# TODO: Implement Dual Verification for Login/Sign Up

## Current Status
- Auth.tsx allows separate email or phone sign up
- Verify.tsx handles OTP verification for both email and phone
- Dashboard checks both email_verified and phone_verified flags

## Required Changes
- [x] Modify Auth.tsx sign up form to require both email and phone
- [x] Update sign up logic to store both email and phone in profile
- [x] Ensure Verify.tsx can verify both after sign up
- [x] Test complete flow: sign up -> verify both -> dashboard
- [x] Ensure login only allows access if both are verified

## Files to Edit
- [x] src/pages/Auth.tsx
- [x] src/pages/Verify.tsx (minor adjustments if needed)
- [x] src/pages/Dashboard.tsx (already correct)

## Testing Steps
- [x] Sign up with both email and phone
- [x] Verify email via OTP
- [x] Verify phone via OTP
- [x] Access dashboard
- [x] Try login without verification - should redirect to verify
