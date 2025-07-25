# BOOM Card - Separate Backends Setup

## ✅ Backend Services Running

### 1. Original Backend (Simplified)
- **Port**: 8004
- **URL**: http://localhost:8004
- **Features**: Basic API endpoints, mock data, simple authentication
- **Frontend Port**: 3003
- **Status**: ✅ Running

### 2. Fixed Backend (Full Featured)
- **Port**: 8006  
- **URL**: http://localhost:8006
- **Features**: 
  - AI-powered recommendations
  - Real-time analytics
  - Enhanced security
  - Full database simulation
  - Transaction tracking
  - Review system
- **Frontend Port**: 3001
- **Status**: ✅ Running

## API Endpoints Comparison

### Original Backend (Port 8004)
- `GET /` - Root endpoint
- `GET /api/health` - Health check
- `POST /api/auth/login` - Simple login
- `GET /api/partners` - Get partners list
- `GET /api/user/profile` - Get user profile
- `GET /api/stats` - Get statistics

### Fixed Backend (Port 8006)
All original endpoints plus:
- `GET /api/partners/{partner_id}` - Get partner details
- `POST /api/auth/logout` - Logout
- `POST /api/transactions` - Create transaction
- `POST /api/reviews` - Create review
- `GET /api/recommendations` - AI recommendations
- `GET /api/search` - Search functionality

## Frontend Configuration

### Original Version (Port 3003)
```env
NEXT_PUBLIC_API_URL=http://localhost:8004/api
NEXT_PUBLIC_APP_NAME=BOOM Card Original
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### Fixed Version (Port 3001)
```env
NEXT_PUBLIC_API_URL=http://localhost:8006/api
NEXT_PUBLIC_APP_NAME=BOOM Card Fixed
NEXT_PUBLIC_APP_VERSION=2.0.0
```

## Quick Start Commands

### Start Original Version:
```bash
# Backend (already running on 8004)
python3 backend_original_simple.py

# Frontend
cd frontend
cp .env.original .env.local
npm run dev -- -p 3003
```

### Start Fixed Version:
```bash
# Backend (already running on 8006)
python3 backend_fixed_full.py

# Frontend
cd frontend
cp .env.fixed .env.local
npm run dev -- -p 3001
```

## Architecture Differences

### Original (Simplified)
- Minimal dependencies
- Mock data only
- Basic CORS configuration
- Simple authentication
- No database persistence

### Fixed (Full Featured)
- Complete API implementation
- In-memory database simulation
- Advanced filtering and sorting
- Token-based authentication
- Transaction and review tracking
- AI-powered recommendations

## Verification

Test both backends:
```bash
# Original
curl http://localhost:8004/api/health

# Fixed
curl http://localhost:8006/api/health
```

Both should return healthy status with their respective service names.