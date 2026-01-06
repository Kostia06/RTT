import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import postgres from 'postgres';
import 'dotenv/config';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

// Extract connection details from Supabase URL
const projectRef = supabaseUrl.replace('https://', '').split('.')[0];
const connectionString = `postgresql://postgres.${projectRef}:${supabaseServiceKey}@aws-0-us-west-1.pooler.supabase.com:6543/postgres`;

console.log('🚀 Running product insertion migration...\n');

try {
  // Connect using postgres
  const sql = postgres(connectionString, {
    ssl: 'require',
  });

  // Read migration file
  const migrationSQL = readFileSync('./supabase/migrations/20260102_insert_products.sql', 'utf8');

  // Execute the migration
  await sql.unsafe(migrationSQL);

  console.log('✅ Migration completed successfully!');
  console.log('\n📦 Products inserted:');
  console.log('   - 8 products (6 noodles + 2 sauces)');
  console.log('   - 3 product groups');
  console.log('   - 18 product variants (3 variants per noodle)');
  console.log('   - Related product relationships');
  console.log('\n🎉 Your shop is ready!');

  await sql.end();

} catch (err) {
  console.error('❌ Error:', err.message);
  process.exit(1);
}
