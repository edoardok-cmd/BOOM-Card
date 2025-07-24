#!/usr/bin/env node

/**
 * Helper script to set up .env.production with your credentials
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const envPath = path.join(__dirname, '../.env.production');

console.log('🚀 BOOM Card Production Environment Setup\n');

async function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setupEnv() {
  console.log('📋 Let\'s get your database credentials:\n');
  
  // Supabase
  console.log('1️⃣  SUPABASE (PostgreSQL)');
  console.log('   Go to: Supabase Dashboard > Settings > Database');
  console.log('   Look for: Connection string > URI\n');
  
  const supabaseRef = await question('Enter your Supabase project reference (the xxxxx part in db.xxxxx.supabase.co): ');
  const supabasePassword = await question('Enter your Supabase database password: ');
  
  const databaseUrl = `postgresql://postgres:${supabasePassword}@db.${supabaseRef}.supabase.co:5432/postgres`;
  
  // Upstash
  console.log('\n2️⃣  UPSTASH (Redis)');
  console.log('   Go to: Upstash Console > Your Database > Details');
  console.log('   Look for: Redis URL (starts with redis://)\n');
  
  const redisUrl = await question('Paste your complete Redis URL: ');
  
  // Frontend URL
  console.log('\n3️⃣  FRONTEND URL');
  const netlifyDomain = await question('Enter your Netlify domain (e.g., amazing-site-123.netlify.app): ');
  const frontendUrl = `https://${netlifyDomain}`;
  
  // Generate secrets
  console.log('\n🔐 Generating secure secrets...\n');
  
  const jwtSecret = crypto.randomBytes(64).toString('hex');
  const jwtRefreshSecret = crypto.randomBytes(64).toString('hex');
  const sessionSecret = crypto.randomBytes(32).toString('hex');
  const encryptionKey = crypto.randomBytes(16).toString('hex');
  
  // Read existing env file
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  // Replace placeholders
  envContent = envContent
    .replace('DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres', `DATABASE_URL=${databaseUrl}`)
    .replace('REDIS_URL=redis://default:[PASSWORD]@[ENDPOINT].upstash.io:[PORT]', `REDIS_URL=${redisUrl}`)
    .replace('FRONTEND_URL=https://your-app.netlify.app', `FRONTEND_URL=${frontendUrl}`)
    .replace('CORS_ORIGINS=https://your-app.netlify.app,http://localhost:3000', `CORS_ORIGINS=${frontendUrl},http://localhost:3000,http://localhost:3001`)
    .replace('JWT_SECRET=', `JWT_SECRET=${jwtSecret}`)
    .replace('JWT_REFRESH_SECRET=', `JWT_REFRESH_SECRET=${jwtRefreshSecret}`)
    .replace('SESSION_SECRET=', `SESSION_SECRET=${sessionSecret}`)
    .replace('ENCRYPTION_KEY=', `ENCRYPTION_KEY=${encryptionKey}`);
  
  // Write updated file
  fs.writeFileSync(envPath, envContent);
  
  console.log('✅ .env.production has been created with your credentials!\n');
  console.log('📝 Summary:');
  console.log(`   - Database: Supabase (${supabaseRef})`);
  console.log(`   - Cache: Upstash Redis`);
  console.log(`   - Frontend: ${frontendUrl}`);
  console.log(`   - Secrets: Generated securely`);
  
  console.log('\n🔒 Security Notes:');
  console.log('   - Never commit .env.production to git');
  console.log('   - Keep a backup of your secrets in a password manager');
  console.log('   - These secrets are unique to your production environment');
  
  console.log('\n📋 Next Steps:');
  console.log('   1. Run: node scripts/test-db-connection.js');
  console.log('   2. Run: node scripts/test-redis-connection.js');
  console.log('   3. Run: node scripts/migrate-database.js');
  console.log('   4. Deploy backend to Railway/Render with these environment variables');
  
  rl.close();
}

setupEnv().catch(console.error);