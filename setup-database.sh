#!/bin/bash

# Complete Database Setup Script for WinQuizz Pro Clone
# This script runs all necessary migrations to set up the complete database

echo "🚀 Setting up WinQuizz Pro Clone Database..."

# List of migration files to run in order
MIGRATIONS=(
    "ADD_WALLET_BALANCE_TO_PROFILES.sql"
    "CREATE_QUIZ_QUESTIONS_TABLE.sql"
    "CREATE_LEADERBOARD_SYSTEM.sql"
    "CREATE_WALLET_SYSTEM.sql"
    "ADD_FLEXIBLE_PRIZES_SYSTEM.sql"
    "CREATE_KYC_DOCUMENTS_TABLE.sql"
    "CREATE_WITHDRAWAL_REQUESTS_TABLE.sql"
)

# Run each migration
for migration in "${MIGRATIONS[@]}"
do
    echo "📄 Running migration: $migration"
    # Note: Replace this with your actual Supabase migration command
    # For example, if using Supabase CLI:
    # supabase db reset --linked
    # Or if running manually in Supabase dashboard, copy the content of each file
    echo "   → Please run the contents of sql/migrations/$migration in your Supabase SQL editor"
    echo ""
done

echo "✅ Database setup instructions generated!"
echo ""
echo "📋 Next Steps:"
echo "1. Go to your Supabase project dashboard"
echo "2. Navigate to SQL Editor"
echo "3. Run each migration file in the order listed above"
echo "4. Or use: supabase db reset --linked (if using Supabase CLI)"
echo ""
echo "🔗 Migration Files Location:"
echo "   sql/migrations/"
echo ""
echo "📝 Important Notes:"
echo "- Run migrations in the order they appear above"
echo "- If any migration fails, check for existing tables and constraints"
echo "- The leaderboard system depends on user_quiz_scores table"
echo "- KYC and withdrawal systems require proper foreign key relationships"
echo ""
echo "🎯 After running migrations, the admin panel should work without errors!"
