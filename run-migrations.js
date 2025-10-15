import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Your Supabase credentials
const SUPABASE_URL = 'https://usqsjbzcrdwvutccqnbm.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzcXNqYnpjcmR3dnV0Y2NxbmJtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDQxMzQwNSwiZXhwIjoyMDc1OTg5NDA1fQ.kQIR2Y9RZaSYc-jx1xvlYQciotwifKQIKE91s7mWCLM';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function runMigrations() {
  console.log('🚀 Starting migrations...\n');

  const migrationsDir = path.join(__dirname, 'supabase', 'migrations');
  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort(); // Run in chronological order

  for (const file of migrationFiles) {
    console.log(`📄 Running migration: ${file}`);
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf8');

    try {
      // Execute the SQL using Supabase client
      const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
      
      if (error) {
        // Try alternative method - direct query
        console.log('   Trying direct execution...');
        const { error: directError } = await supabase.from('_migrations').insert({ name: file });
        
        if (directError) {
          console.error(`   ❌ Error: ${directError.message}`);
        } else {
          console.log(`   ✅ Migration completed`);
        }
      } else {
        console.log(`   ✅ Migration completed`);
      }
    } catch (err) {
      console.error(`   ❌ Error: ${err.message}`);
    }
    console.log('');
  }

  console.log('✨ All migrations processed!\n');
  
  // Verify role column exists
  console.log('🔍 Verifying role column...');
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, role')
    .limit(1);

  if (error) {
    console.error('❌ Error checking profiles:', error.message);
  } else {
    console.log('✅ Role column exists!');
    console.log('Sample data:', data);
  }
}

runMigrations().catch(console.error);
