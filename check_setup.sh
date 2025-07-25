#!/bin/bash

echo "🔍 Checking BOOM Card Setup"
echo "=========================="

# Check backends
echo -e "\n📡 Checking Backends:"
if curl -s http://localhost:8004/api/health > /dev/null; then
    echo "✅ Original Backend (8004) - Running"
else
    echo "❌ Original Backend (8004) - Not running"
fi

if curl -s http://localhost:8006/api/health > /dev/null; then
    echo "✅ Fixed Backend (8006) - Running"
else
    echo "❌ Fixed Backend (8006) - Not running"
fi

# Check environment files
echo -e "\n📄 Checking Environment Files:"
if [ -f "frontend/.env.original" ]; then
    echo "✅ .env.original exists"
else
    echo "❌ .env.original missing"
fi

if [ -f "frontend/.env.fixed" ]; then
    echo "✅ .env.fixed exists"
else
    echo "❌ .env.fixed missing"
fi

# Check critical files
echo -e "\n📁 Checking Critical Files:"
if [ -f "frontend/src/contexts/LanguageContext.js" ]; then
    echo "✅ LanguageContext.js exists"
else
    echo "❌ LanguageContext.js missing"
fi

if [ -f "frontend/src/contexts/AuthContext.js" ]; then
    echo "✅ AuthContext.js exists"
else
    echo "❌ AuthContext.js missing"
fi

if [ -f "frontend/src/pages/_app.js" ]; then
    echo "✅ _app.js exists"
else
    echo "❌ _app.js missing"
fi

echo -e "\n🚀 Next Steps:"
echo "1. Start fixed frontend: cd frontend && cp .env.fixed .env.local && npm run dev -- -p 3001"
echo "2. Start original frontend: cd frontend && cp .env.original .env.local && npm run dev -- -p 3003"