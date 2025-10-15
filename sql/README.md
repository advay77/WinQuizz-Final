# SQL Scripts Organization

This folder contains all SQL scripts organized by purpose and execution order.

## 📁 Folder Structure

### 🏗️ `migrations/` - Database Structure Changes
Scripts that create or modify database tables and relationships.

**Files:**
- `CREATE_QUIZ_QUESTIONS_TABLE.sql` - Creates the quiz_questions table with sample questions
- `ADD_MISSING_QUIZ_COLUMNS.sql` - Adds missing columns (entry_fee, time_limit_minutes, etc.) to quizzes table
- `CREATE_WALLET_SYSTEM.sql` - Creates user wallet system for coin-based quiz fees
- `ADD_PRIZE_SYSTEM.sql` - Adds prize system for quiz winners (1st, 2nd, 3rd place)
- `ADD_PARTICIPANT_LIMITS.sql` - Adds participant tracking features to quizzes table

### 🔧 `fixes/` - Problem Fixes
Scripts that fix existing issues, permissions, or data problems.

**Files:**
- `DISABLE_RLS_FIX.sql` - Disables Row Level Security for development
- `COMPREHENSIVE_FIX_ALL.sql` - Fixes all database issues and permissions
- `REPLACE_RUPEES_WITH_COINS.sql` - Converts rupee-based pricing to coin-based system

### ⚙️ `setup/` - Initial Setup & Testing
Scripts for initial setup, user management, and testing.

**Files:**
- `PROMOTE_TO_ADMIN.sql` - Promotes current user to admin role
- `TEST_DATABASE_SETUP.sql` - Tests that database setup is working correctly

## 🚀 Execution Order

### For New/Fresh Database:
```sql
1. migrations/CREATE_QUIZ_QUESTIONS_TABLE.sql
2. migrations/ADD_MISSING_QUIZ_COLUMNS.sql
3. migrations/CREATE_WALLET_SYSTEM.sql
4. migrations/ADD_PRIZE_SYSTEM.sql
5. migrations/ADD_PARTICIPANT_LIMITS.sql
6. fixes/COMPREHENSIVE_FIX_ALL.sql
7. setup/PROMOTE_TO_ADMIN.sql
8. setup/TEST_DATABASE_SETUP.sql
```

### For Existing Database with Issues:
```sql
1. migrations/CREATE_WALLET_SYSTEM.sql
2. migrations/ADD_PRIZE_SYSTEM.sql
3. fixes/COMPREHENSIVE_FIX_ALL.sql
4. setup/PROMOTE_TO_ADMIN.sql
5. setup/TEST_DATABASE_SETUP.sql
```

## 📋 Script Purposes

| Script | Purpose | When to Run |
|--------|---------|-------------|
| `CREATE_QUIZ_QUESTIONS_TABLE.sql` | Creates quiz_questions table | First time setup |
| `ADD_MISSING_QUIZ_COLUMNS.sql` | Adds missing columns to quizzes | When getting "column not found" errors |
| `CREATE_WALLET_SYSTEM.sql` | Creates user wallet for coins | Before using paid quizzes |
| `ADD_PRIZE_SYSTEM.sql` | Adds prize system for winners | After wallet system |
| `ADD_PARTICIPANT_LIMITS.sql` | Adds participant tracking | After basic tables exist |
| `COMPREHENSIVE_FIX_ALL.sql` | Fixes all permissions & constraints | When having auth/access issues |
| `REPLACE_RUPEES_WITH_COINS.sql` | Converts pricing to coins | After basic setup |
| `PROMOTE_TO_ADMIN.sql` | Makes you an admin | When getting permission errors |
| `TEST_DATABASE_SETUP.sql` | Verifies everything works | After any changes |

## 🔍 Troubleshooting

If you get errors:
1. Check browser console (F12) for detailed error messages
2. Run `TEST_DATABASE_SETUP.sql` to verify database state
3. Check if you're properly logged in as admin
4. Ensure all migrations ran successfully

## 📝 Notes

- Always run scripts in the order specified above
- Some scripts depend on others (e.g., fixes need tables to exist)
- If you get permission errors, run `PROMOTE_TO_ADMIN.sql` first
- The comprehensive fix script handles most common issues

## 💰 Coin/Wallet System

The wallet system allows users to pay entry fees for quizzes:

- **New users** get 100 coins automatically
- **Free quizzes** (entry_fee = 0) don't require coins
- **Paid quizzes** deduct coins from user's wallet before starting
- **Insufficient balance** prevents quiz from starting with clear error message

**Features:**
- ✅ Automatic wallet creation for new users
- ✅ Balance checking before quiz start
- ✅ Coin deduction for paid quizzes
- ✅ Clear error messages for insufficient balance
- ✅ Wallet balance display on quiz start screen

## 🏆 Prize System

The prize system rewards top performers in quizzes:

- **Admin Setup**: Set 1st, 2nd, and 3rd place prizes when creating quizzes
- **Automatic Distribution**: Prizes automatically distributed to top 3 performers
- **Wallet Integration**: Prize coins added directly to winners' wallets
- **Admin Oversight**: View and modify results in Admin panel
- **Visual Display**: Prizes shown on quiz cards and creation forms

**Prize Features:**
- ✅ Set prizes during quiz creation
- ✅ Automatic prize calculation and distribution
- ✅ Prize display in Admin panel and quiz cards
- ✅ Integration with existing wallet system
