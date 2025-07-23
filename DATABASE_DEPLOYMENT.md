# BOOM Card Database Deployment Guide

This guide will help you set up free PostgreSQL and Redis databases for the BOOM Card platform.

## 🚀 Quick Start

Run the automated setup script:

```bash
cd database
./setup-free-databases.sh
```

## 📊 Database Providers Comparison

### PostgreSQL Options

| Provider | Free Tier | Pros | Cons | Best For |
|----------|-----------|------|------|----------|
| **Supabase** | 500MB storage<br>Unlimited API requests | • Great dashboard<br>• Built-in auth<br>• Realtime subscriptions | • 500MB limit<br>• Shared instance | **Recommended** |
| **Neon** | 3GB storage<br>Autoscaling | • Generous storage<br>• Serverless<br>• Branching | • Cold starts<br>• Beta features | Large datasets |
| **ElephantSQL** | 20MB storage<br>5 connections | • Simple setup<br>• Reliable | • Tiny storage<br>• Very limited | Testing only |

### Redis Options

| Provider | Free Tier | Pros | Cons | Best For |
|----------|-----------|------|------|----------|
| **Upstash** | 10K commands/day<br>256MB storage | • Serverless<br>• Global replication<br>• REST API | • Daily limit<br>• Pay-per-use | **Recommended** |
| **Redis Cloud** | 30MB storage<br>30 connections | • Persistent<br>• No daily limits | • Small storage<br>• Single region | Consistent usage |

## 🔧 Step-by-Step Setup

### 1. PostgreSQL Setup (Supabase)

1. **Create Account**
   - Go to [supabase.com](https://supabase.com)
   - Sign up with GitHub/Email
   
2. **Create Project**
   - Click "New Project"
   - Choose project name: `boom-card-db`
   - Set a strong database password
   - Select region closest to your users
   - Click "Create Project" (takes ~2 minutes)

3. **Get Connection String**
   - Go to Settings → Database
   - Copy "URI" under Connection String
   - It looks like: `postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres`

4. **Configure Connection Pooling** (Important!)
   - Use "Connection Pooling" URL for production
   - Go to Settings → Database → Connection Pooling
   - Copy the "Connection string" (port 6543)

### 2. Redis Setup (Upstash)

1. **Create Account**
   - Go to [upstash.com](https://upstash.com)
   - Sign up with GitHub/Google/Email

2. **Create Database**
   - Click "Create Database"
   - Name: `boom-card-redis`
   - Type: Regional (not Global)
   - Region: Same as your PostgreSQL
   - Click "Create"

3. **Get Connection Details**
   - Copy "Redis URL" from dashboard
   - For serverless: Copy REST URL and token

### 3. Environment Configuration

Create `.env` file in the backend directory:

```bash
# PostgreSQL (Supabase)
DATABASE_URL="postgresql://postgres:[password]@db.[project-ref].supabase.co:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"

# Redis (Upstash)
REDIS_URL="redis://default:[password]@[endpoint].upstash.io:[port]"
UPSTASH_REDIS_REST_URL="https://[endpoint].upstash.io"
UPSTASH_REDIS_REST_TOKEN="[token]"

# Connection Settings
DB_POOL_MAX=10
DB_SSL_ENABLED=true
REDIS_TLS_ENABLED=true
```

### 4. Run Database Migrations

```bash
cd backend

# Install dependencies
npm install

# Run migrations
npm run db:migrate

# Or use the migration script
cd ../database
node migrate.js up
```

### 5. Seed Initial Data (Optional)

```bash
cd backend
npm run db:seed
```

## 🔒 Security Best Practices

### Connection Security
- ✅ Always use SSL/TLS connections
- ✅ Use connection pooling for production
- ✅ Rotate passwords regularly
- ✅ Use environment variables for credentials

### Database Security
```sql
-- Create application user with limited permissions
CREATE USER boom_app WITH PASSWORD 'strong_password';
GRANT CONNECT ON DATABASE postgres TO boom_app;
GRANT USAGE ON SCHEMA public TO boom_app;
GRANT CREATE ON SCHEMA public TO boom_app;

-- Grant table permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO boom_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO boom_app;
```

### Backup Strategy
- Supabase: Daily automatic backups (7 days retention on free tier)
- Manual backup: `pg_dump $DATABASE_URL > backup.sql`

## 🚨 Common Issues & Solutions

### Issue: Connection Timeout
```javascript
// Add to database config
connectionTimeoutMillis: 60000, // 60 seconds
statement_timeout: 60000,
```

### Issue: SSL Certificate Error
```javascript
// For development only
ssl: {
  rejectUnauthorized: false
}
```

### Issue: Too Many Connections
```javascript
// Reduce pool size
max: 5, // Free tier limit
idleTimeoutMillis: 10000, // Release connections faster
```

### Issue: Upstash Command Limit
- Use caching strategically
- Implement request batching
- Consider Redis Cloud for unlimited commands

## 📈 Monitoring

### Database Metrics
- Supabase: Built-in dashboard at app.supabase.com
- Custom monitoring: Add to your app
```javascript
// Log slow queries
client.on('query', (e) => {
  if (e.duration > 1000) {
    console.warn('Slow query:', e.query, e.duration + 'ms');
  }
});
```

### Redis Metrics
- Upstash: Dashboard at console.upstash.com
- Monitor command usage to avoid limits

## 🔄 Scaling Considerations

When you outgrow the free tier:

### PostgreSQL Scaling Path
1. Supabase Pro ($25/month): 8GB storage, better performance
2. Neon Pro ($19/month): 10GB storage, autoscaling
3. Self-hosted: DigitalOcean/AWS RDS

### Redis Scaling Path
1. Upstash Pay-as-you-go: $0.2 per 100K commands
2. Redis Cloud Pro: $71/month for 500MB
3. Self-hosted: DigitalOcean/AWS ElastiCache

## 🛠️ Useful Commands

```bash
# Check database connection
psql $DATABASE_URL -c "SELECT version();"

# Check Redis connection
redis-cli -u $REDIS_URL ping

# Database size
psql $DATABASE_URL -c "SELECT pg_database_size('postgres');"

# Active connections
psql $DATABASE_URL -c "SELECT count(*) FROM pg_stat_activity;"

# Run specific migration
node database/migrate.js run 001_initial_schema.sql

# Migration status
node database/migrate.js status
```

## 📚 Additional Resources

- [Supabase Docs](https://supabase.com/docs)
- [Neon Docs](https://neon.tech/docs)
- [Upstash Docs](https://docs.upstash.com)
- [Redis Cloud Docs](https://docs.redis.com/latest/rc/)
- [PostgreSQL Optimization](https://wiki.postgresql.org/wiki/Performance_Optimization)

---

💡 **Pro Tip**: Start with Supabase + Upstash for the best free tier experience. Both provide generous limits and excellent developer experience.