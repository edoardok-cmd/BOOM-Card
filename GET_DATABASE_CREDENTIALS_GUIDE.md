# How to Get Your Database Credentials

## 🔵 Supabase (PostgreSQL)

1. **Login to Supabase**: https://app.supabase.com

2. **Go to your project** (boom-card)

3. **Navigate to**: Settings (gear icon) → Database

4. **Find these values**:
   - Under "Connection string" section
   - Click on "URI" tab
   - You'll see something like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.abcdefghijklmnop.supabase.co:5432/postgres
   ```

5. **What you need**:
   - **Project Reference**: The `abcdefghijklmnop` part (between `db.` and `.supabase.co`)
   - **Password**: The password you created when setting up the project

## 🔴 Upstash (Redis)

1. **Login to Upstash**: https://console.upstash.com

2. **Click on your database** (boom-card-redis)

3. **In the Details tab**, find:
   - **REDIS URL** (click "Copy" button)
   - It looks like:
   ```
   redis://default:AX1YAAIncDEwOTk2Y2E4ZjI5NGY0OGE4N2U@eu1-social-giraffe-12345.upstash.io:12345
   ```

4. **Copy the entire URL** - it includes everything you need

## 🚀 Quick Setup

Run this command in your backend directory:

```bash
cd backend
node scripts/setup-env-production.js
```

The script will:
1. Ask for your Supabase project reference
2. Ask for your Supabase password
3. Ask for your complete Upstash Redis URL
4. Ask for your Netlify domain
5. Generate all required secrets automatically
6. Create a complete .env.production file

## 🔍 Where to Find Values

### Supabase Connection String Location:
![](https://supabase.com/docs/img/guides/database/connection-string.png)
- Settings → Database → Connection string → URI tab

### Upstash Redis URL Location:
- Main database page → Details section → REDIS URL (with copy button)

## 📝 Manual Setup (Alternative)

If you prefer to set up manually:

1. Open `backend/.env.production`
2. Replace these placeholders:
   - `[YOUR-PASSWORD]` → Your Supabase password
   - `[PROJECT-REF]` → Your Supabase project reference
   - `redis://default:[PASSWORD]@[ENDPOINT].upstash.io:[PORT]` → Your complete Redis URL
   - `your-app.netlify.app` → Your actual Netlify domain

3. Generate secrets by running:
   ```bash
   # Generate JWT_SECRET
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   
   # Generate JWT_REFRESH_SECRET (run again for different value)
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   
   # Generate SESSION_SECRET
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   
   # Generate ENCRYPTION_KEY
   node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
   ```

## ✅ Verify Your Setup

After creating .env.production, test your connections:

```bash
# Test PostgreSQL
node scripts/test-db-connection.js

# Test Redis
node scripts/test-redis-connection.js
```

Both should show "✅ Successfully connected"!