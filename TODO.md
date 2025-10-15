# TODO List for WinQuizz Pro Clone Updates

## Database Roles Setup
- [ ] Apply migration `supabase/migrations/20251014163140_add_role_to_profiles.sql` manually via Supabase dashboard (CLI auth required)

## Demo Quizzes in Dashboard
- [x] Add "Demo Quizzes" section to Dashboard.tsx with static demo games
- [x] Ensure demo quizzes don't affect user progress
- [x] Style demo quizzes appropriately (e.g., different appearance from live quizzes)

## Navbar Enhancements
- [x] Update Navbar.tsx to include user dropdown menu
- [x] Add Info & Settings page link
- [x] Add 24*7 Contact link
- [x] Add Wallet Balance display
- [x] Add KYC verification status (Phone, Email, Documents)
- [ ] Create Info/Settings page component if needed
- [ ] Create Contact page component if needed
- [x] Update profile interface to include wallet balance if not present

## Testing
- [x] Test demo quizzes functionality
- [x] Test navbar dropdown and links
- [x] Verify KYC status display
- [x] Check wallet balance display
