import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const SUPABASE_URL = 'https://usqsjbzcrdwvutccqnbm.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzcXNqYnpjcmR3dnV0Y2NxbmJtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDQxMzQwNSwiZXhwIjoyMDc1OTg5NDA1fQ.kQIR2Y9RZaSYc-jx1xvlYQciotwifKQIKE91s7mWCLM';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

console.log('🚀 Adding role column to profiles table...\n');

// Read the SQL file
const sql = fs.readFileSync('./PASTE_THIS_IN_SUPABASE.sql', 'utf8');

// Split into individual statements
const statements = sql
  .split(';')
  .map(s => s.trim())
  .filter(s => s && !s.startsWith('--') && s !== '');

async function runSQL() {
  try {
    // First, let's check if the table exists
    console.log('📋 Checking profiles table...');
    const { data: existingProfiles, error: checkError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    if (checkError) {
      console.error('❌ Error accessing profiles table:', checkError.message);
      console.log('\n📝 Please run the SQL manually:');
      console.log('1. Go to: https://supabase.com/dashboard/project/usqsjbzcrdwvutccqnbm/sql/new');
      console.log('2. Copy the contents of PASTE_THIS_IN_SUPABASE.sql');
      console.log('3. Paste and click RUN');
      return;
    }

    console.log('✅ Profiles table found\n');

    // Check if role column already exists
    if (existingProfiles && existingProfiles[0] && 'role' in existingProfiles[0]) {
      console.log('✅ Role column already exists!');
      console.log('Sample data:', existingProfiles[0]);
      return;
    }

    console.log('⚠️  Role column does not exist. Adding it now...\n');
    console.log('📝 Please run the SQL manually:');
    console.log('1. Go to: https://supabase.com/dashboard/project/usqsjbzcrdwvutccqnbm/sql/new');
    console.log('2. Copy the contents of PASTE_THIS_IN_SUPABASE.sql');
    console.log('3. Paste and click RUN\n');
    
    console.log('The SQL file contains:');
    console.log('- Add role column with default value "user"');
    console.log('- Update existing users to have "user" role');
    console.log('- Set admin role for admin emails');
    console.log('- Add constraint for valid roles');
    console.log('- Create performance index');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

runSQL();
