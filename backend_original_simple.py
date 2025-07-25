#!/usr/bin/env python3
"""
Simplified backend for the original BOOM Card version (port 3003)
This is a minimal backend without AI features, just basic API endpoints
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import uvicorn
from datetime import datetime

app = FastAPI(title="BOOM Card Original Backend", version="1.0.0")

# Configure CORS for the original frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3003", "http://127.0.0.1:3003"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simple data models
class User(BaseModel):
    id: str
    name: str
    email: str
    membership_type: str = "basic"

class Partner(BaseModel):
    id: str
    name: str
    category: str
    discount: str
    description: str

# Mock data
mock_users = {
    "demo": User(id="1", name="Demo User", email="demo@boomcard.bg", membership_type="premium")
}

mock_partners = [
    Partner(id="1", name="Restaurant Sofia", category="Fine Dining", discount="20%", description="Elegant dining experience"),
    Partner(id="2", name="Grand Hotel Bulgaria", category="Luxury Hotels", discount="15%", description="5-star accommodation"),
    Partner(id="3", name="Spa Wellness Center", category="Wellness & Spa", discount="25%", description="Premium spa services"),
    Partner(id="4", name="Cinema City", category="Entertainment", discount="30%", description="Latest movies and events"),
]

@app.get("/")
async def root():
    return {
        "message": "BOOM Card Original Backend (Simplified)",
        "version": "1.0.0",
        "port": 8004
    }

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "boom-card-original"
    }

@app.post("/api/auth/login")
async def login(email: str, password: str):
    # Simplified auth - just return demo user
    if email == "demo@boomcard.bg":
        return {
            "user": mock_users["demo"],
            "token": "demo-token-original"
        }
    raise HTTPException(status_code=401, detail="Invalid credentials")

@app.get("/api/partners")
async def get_partners(category: Optional[str] = None):
    if category:
        filtered = [p for p in mock_partners if p.category == category]
        return {"partners": filtered}
    return {"partners": mock_partners}

@app.get("/api/user/profile")
async def get_profile():
    return {"user": mock_users["demo"]}

@app.get("/api/stats")
async def get_stats():
    return {
        "total_users": "5,000+",
        "total_partners": "375+",
        "average_savings": "25%",
        "user_rating": "4.8"
    }

if __name__ == "__main__":
    print("🚀 Starting BOOM Card Original Backend on http://localhost:8004")
    uvicorn.run(app, host="0.0.0.0", port=8004)