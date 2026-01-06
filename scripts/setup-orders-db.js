#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  console.log('🚀 Setting up orders database...\n');

  const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20260101_create_orders_table.sql');
  const sql = fs.readFileSync(migrationPath, 'utf8');

  console.log('📄 Reading migration file...');
  console.log('📊 Executing SQL...\n');

  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      // Try direct execution if RPC doesn't work
      console.log('⚠️  RPC method not available, please run migration manually:\n');
      console.log('Option 1: Supabase Dashboard');
      console.log('  1. Go to https://supabase.com/dashboard/project/' + supabaseUrl.split('//')[1].split('.')[0]);
      console.log('  2. Click "SQL Editor" in the left sidebar');
      console.log('  3. Copy and paste the contents of:');
      console.log('     supabase/migrations/20260101_create_orders_table.sql');
      console.log('  4. Click "Run" button\n');

      console.log('Option 2: Copy SQL below and run in Supabase SQL Editor:\n');
      console.log('─'.repeat(80));
      console.log(sql);
      console.log('─'.repeat(80));

      process.exit(1);
    }

    console.log('✅ Migration completed successfully!\n');
    console.log('Created tables:');
    console.log('  • orders');
    console.log('  • order_items\n');
    console.log('✨ Your orders system is now ready to use!');

  } catch (err) {
    console.error('❌ Error running migration:', err.message);
    console.log('\n📝 Please run the migration manually using the Supabase Dashboard:\n');
    console.log('  1. Go to: https://supabase.com/dashboard/project/' + supabaseUrl.split('//')[1].split('.')[0]);
    console.log('  2. Click "SQL Editor"');
    console.log('  3. Copy contents from: supabase/migrations/20260101_create_orders_table.sql');
    console.log('  4. Paste and click "Run"\n');
    process.exit(1);
  }
}

runMigration();
