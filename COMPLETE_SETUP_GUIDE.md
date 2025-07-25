# BOOM Card Complete Setup Guide

## Current Status

✅ **Backends Running:**
- Original Backend: http://localhost:8004 ✅
- Fixed Backend: http://localhost:8006 ✅

## Frontend Setup Commands

### Terminal 1: Fixed Version (Port 3001)
```bash
cd /Users/administrator/ai-automation-platform/user_projects/admin/proj_20250724_140011_4d773584/imported/BOOM\ Card_20250722_085243/frontend
cp .env.fixed .env.local
npm run dev -- -p 3001
```

### Terminal 2: Original Version (Port 3003)
```bash
cd /Users/administrator/ai-automation-platform/user_projects/admin/proj_20250724_140011_4d773584/imported/BOOM\ Card_20250722_085243/frontend
cp .env.original .env.local
npm run dev -- -p 3003
```

## URLs After Setup

1. **AI-Automation Platform**: http://localhost:3000
2. **BOOM Card Fixed Version**: http://localhost:3001
3. **BOOM Card Original Version**: http://localhost:3003

## Backend API Endpoints

### Original Backend (8004)
- Health: http://localhost:8004/api/health
- Partners: http://localhost:8004/api/partners
- Stats: http://localhost:8004/api/stats

### Fixed Backend (8006)
- Health: http://localhost:8006/api/health
- Partners: http://localhost:8006/api/partners
- Recommendations: http://localhost:8006/api/recommendations
- Search: http://localhost:8006/api/search?q=restaurant

## Troubleshooting

### If you see AuthContext errors:
The _app.js file should include both context providers:
```javascript
import { AuthProvider } from '../contexts/AuthContext';
import { LanguageProvider } from '../contexts/LanguageContext';
```

### If you see "page not found":
- For original version, navigate to: http://localhost:3003/original
- For fixed version, the main page should work: http://localhost:3001

### To test backends directly:
```bash
# Original backend
curl http://localhost:8004/api/health

# Fixed backend  
curl http://localhost:8006/api/health
```

## Key Differences

### Original Version (Port 3003)
- Simplified display page
- Basic mock data from backend
- Shows version comparison info

### Fixed Version (Port 3001)
- Full application with all features
- AI-powered recommendations
- Complete user authentication
- Transaction tracking

## Quick Test

After starting both frontends, you should be able to:
1. Visit http://localhost:3001 - See the fixed BOOM Card application
2. Visit http://localhost:3003/original - See the original version info page
3. Compare both versions side by side