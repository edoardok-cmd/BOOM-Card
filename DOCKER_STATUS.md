# BOOM Card - Docker Services Status

## 🚀 Services Running

### ✅ Database Services
- **PostgreSQL**: Running on port `5434` (Container: boom-postgres)
- **Redis**: Running on port `6381` (Container: boom-redis)

### 📝 Connection Information

#### PostgreSQL
```
Host: localhost
Port: 5434
Database: boom_card
Username: boom_user
Password: boom_secure_password
```

Connection string:
```
postgresql://boom_user:boom_secure_password@localhost:5434/boom_card
```

#### Redis
```
Host: localhost
Port: 6381
Password: boom_redis_password
```

Connection string:
```
redis://:boom_redis_password@localhost:6381
```

## 🛠️ Docker Commands

### Check service status
```bash
docker compose ps
```

### View logs
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f postgres
docker compose logs -f redis
```

### Stop services
```bash
docker compose down
```

### Start all services
```bash
docker compose up -d
```

### Access PostgreSQL
```bash
docker exec -it boom-postgres psql -U boom_user -d boom_card
```

### Access Redis CLI
```bash
docker exec -it boom-redis redis-cli -a boom_redis_password
```

## ⚠️ Important Notes

1. **Port Conflicts**: The default ports were changed due to conflicts:
   - PostgreSQL: 5432 → 5434
   - Redis: 6379 → 6381

2. **Other Services**: Frontend, backend, and API gateway services need to be started manually or built first since they require local code.

3. **Environment Variables**: Update your application's `.env` files to use the new ports.

## 🚦 Next Steps

1. Run database migrations:
   ```bash
   cd database && node migrate.js
   ```

2. Start the application services:
   ```bash
   cd backend && npm install && npm run dev
   cd frontend && npm install && npm run dev
   ```

3. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - API Documentation: http://localhost:3001/docs