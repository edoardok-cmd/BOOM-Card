from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import datetime
import uuid

app = FastAPI(title="BOOM Card Pre-Phase 1 Backend", version="1.0.0")

# Configure CORS for port 3002
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3002", "http://127.0.0.1:3002"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mock database with pre-registered users
users = {
    "user1": {
        "id": "user1",
        "name": "Edoardo K",
        "email": "edoardok@gmail.com",
        "phone": "+359888111111",
        "password": "Test123!",
        "membershipType": "premium",
        "membershipExpiry": (datetime.datetime.now() + datetime.timedelta(days=365)).isoformat(),
        "discountsUsed": 5,
        "totalSavings": 150.75
    },
    "user2": {
        "id": "user2",
        "name": "Radoslav Tashev",
        "email": "radoslav.tashev@gmail.com",
        "phone": "+359888222222",
        "password": "Test123!",
        "membershipType": "premium",
        "membershipExpiry": (datetime.datetime.now() + datetime.timedelta(days=365)).isoformat(),
        "discountsUsed": 8,
        "totalSavings": 225.50
    }
}
sessions = {}

class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    phone: Optional[str] = None

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    phone: Optional[str] = None
    membershipType: str = "standard"
    membershipExpiry: str
    discountsUsed: int = 0
    totalSavings: float = 0.0

@app.get("/")
def read_root():
    return {"message": "BOOM Card Pre-Phase 1 Backend Running on Port 8002"}

@app.post("/api/auth/register")
def register(request: RegisterRequest):
    if request.email in [u["email"] for u in users.values()]:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    user = {
        "id": user_id,
        "name": request.name,
        "email": request.email,
        "phone": request.phone,
        "password": request.password,
        "membershipType": "standard",
        "membershipExpiry": (datetime.datetime.now() + datetime.timedelta(days=365)).isoformat(),
        "discountsUsed": 0,
        "totalSavings": 0.0
    }
    users[user_id] = user
    
    # Create session
    session_token = str(uuid.uuid4())
    sessions[session_token] = user_id
    
    return {
        "user": UserResponse(**user),
        "token": session_token
    }

@app.post("/api/auth/login")
def login(request: LoginRequest):
    for user in users.values():
        if user["email"] == request.email and user["password"] == request.password:
            session_token = str(uuid.uuid4())
            sessions[session_token] = user["id"]
            
            # Split name into firstName and lastName for frontend compatibility
            name_parts = user["name"].split(" ", 1)
            first_name = name_parts[0]
            last_name = name_parts[1] if len(name_parts) > 1 else ""
            
            return {
                "data": {
                    "user": {
                        "id": user["id"],
                        "email": user["email"],
                        "firstName": first_name,
                        "lastName": last_name,
                        "membershipType": user["membershipType"],
                        "phone": user.get("phone", ""),
                        "membershipExpiry": user["membershipExpiry"],
                        "discountsUsed": user["discountsUsed"],
                        "totalSavings": user["totalSavings"]
                    },
                    "token": session_token,
                    "tokens": {
                        "accessToken": session_token,
                        "refreshToken": session_token + "-refresh"
                    }
                }
            }
    
    raise HTTPException(status_code=401, detail="Invalid credentials")

@app.post("/api/auth/logout")
def logout():
    return {"message": "Logged out successfully"}

@app.get("/api/user/profile")
def get_profile():
    # Mock user profile
    return UserResponse(
        id="1",
        name="Test User",
        email="test@boomcard.bg",
        phone="+359888123456",
        membershipType="premium",
        membershipExpiry=(datetime.datetime.now() + datetime.timedelta(days=180)).isoformat(),
        discountsUsed=15,
        totalSavings=250.50
    )

@app.get("/api/auth/profile")
def get_auth_profile():
    # Return the currently logged in user's profile
    # For now, return a mock user that matches our test users
    return {
        "user": {
            "id": "user1",
            "email": "edoardok@gmail.com",
            "firstName": "Edoardo",
            "lastName": "K",
            "name": "Edoardo K",
            "phone": "+359888111111",
            "membershipType": "premium",
            "membershipExpiry": (datetime.datetime.now() + datetime.timedelta(days=365)).isoformat(),
            "discountsUsed": 5,
            "totalSavings": 150.75,
            "joinedDate": "2024-03-10",
            "membershipStatus": "active",
            "avatarUrl": None,
            "preferences": {
                "notifications": True,
                "newsletter": True,
                "language": "bg"
            }
        }
    }

@app.get("/api/partners")
def get_partners(category: Optional[str] = None, location: Optional[str] = None):
    partners = [
        {
            "id": "1",
            "name": "Restaurant Sofia",
            "category": "restaurants",
            "discount": "25%",
            "location": "Sofia",
            "image": "/images/restaurant1.jpg",
            "rating": 4.8,
            "description": "Fine dining experience"
        },
        {
            "id": "2",
            "name": "Grand Hotel Plovdiv",
            "category": "hotels",
            "discount": "30%",
            "location": "Plovdiv",
            "image": "/images/hotel1.jpg",
            "rating": 4.9,
            "description": "Luxury accommodation"
        },
        {
            "id": "3",
            "name": "Spa Paradise Varna",
            "category": "spa",
            "discount": "35%",
            "location": "Varna",
            "image": "/images/spa1.jpg",
            "rating": 4.7,
            "description": "Wellness and relaxation"
        }
    ]
    
    if category:
        partners = [p for p in partners if p["category"] == category]
    if location:
        partners = [p for p in partners if p["location"] == location]
    
    return partners

@app.get("/api/categories")
def get_categories():
    return [
        {"id": "restaurants", "name": "Restaurants", "count": 125},
        {"id": "hotels", "name": "Hotels", "count": 48},
        {"id": "spa", "name": "Spa & Wellness", "count": 67},
        {"id": "entertainment", "name": "Entertainment", "count": 93}
    ]

@app.get("/api/partners/categories")
def get_partner_categories():
    return [
        {"id": "restaurants", "name": "Fine Dining", "count": 125, "icon": "🍽️"},
        {"id": "hotels", "name": "Hotels & Resorts", "count": 48, "icon": "🏨"},
        {"id": "spa", "name": "Spa & Wellness", "count": 67, "icon": "💆"},
        {"id": "entertainment", "name": "Entertainment", "count": 93, "icon": "🎬"}
    ]

@app.get("/api/partners/cities")
def get_partner_cities():
    return [
        {"id": "sofia", "name": "Sofia", "count": 142},
        {"id": "plovdiv", "name": "Plovdiv", "count": 87},
        {"id": "varna", "name": "Varna", "count": 76},
        {"id": "burgas", "name": "Burgas", "count": 70}
    ]

@app.get("/api/partners/featured")
def get_featured_partners():
    return [
        {
            "id": "1",
            "name": "Restaurant Sofia Premium",
            "category": "restaurants",
            "discount": "30%",
            "location": "Sofia",
            "image": "/images/restaurant1.jpg",
            "rating": 4.9,
            "featured": True,
            "description": "Award-winning fine dining experience"
        },
        {
            "id": "2",
            "name": "Grand Hotel Plovdiv",
            "category": "hotels",
            "discount": "35%",
            "location": "Plovdiv",
            "image": "/images/hotel1.jpg",
            "rating": 4.8,
            "featured": True,
            "description": "5-star luxury accommodation"
        },
        {
            "id": "3",
            "name": "Spa Paradise Varna",
            "category": "spa",
            "discount": "40%",
            "location": "Varna",
            "image": "/images/spa1.jpg",
            "rating": 4.9,
            "featured": True,
            "description": "Premium wellness retreat"
        }
    ]

@app.get("/api/discounts/active")
def get_active_discounts():
    return [
        {
            "id": "1",
            "partnerId": "1",
            "partnerName": "Restaurant Sofia",
            "discount": "25%",
            "validUntil": (datetime.datetime.now() + datetime.timedelta(days=30)).isoformat(),
            "code": "BOOM25"
        }
    ]

@app.get("/api/stats")
def get_stats():
    return {
        "totalUsers": 5247,
        "totalPartners": 375,
        "averageSavings": 127.50,
        "totalDiscountsUsed": 28451
    }

@app.get("/api/qr/membership")
def get_qr_membership():
    return {
        "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
        "memberId": "BOOM-2024-0001",
        "membershipType": "premium",
        "validUntil": (datetime.datetime.now() + datetime.timedelta(days=365)).isoformat()
    }

@app.get("/api/users/activity")
def get_user_activity(limit: int = 10):
    activities = []
    for i in range(min(limit, 5)):
        activities.append({
            "id": str(i + 1),
            "type": ["discount_used", "partner_visit", "points_earned"][i % 3],
            "description": ["Used 25% discount at Restaurant Sofia", "Visited Grand Hotel Plovdiv", "Earned 50 points"][i % 3],
            "timestamp": (datetime.datetime.now() - datetime.timedelta(days=i)).isoformat(),
            "points": 50 if i % 3 == 2 else 0
        })
    return activities

@app.get("/api/users/favorites")
def get_user_favorites(limit: int = 8):
    favorites = []
    partners = ["Restaurant Sofia", "Grand Hotel Plovdiv", "Spa Paradise Varna", "Cinema City"]
    for i in range(min(limit, 4)):
        favorites.append({
            "id": str(i + 1),
            "partnerId": str(i + 1),
            "partnerName": partners[i],
            "category": ["restaurants", "hotels", "spa", "entertainment"][i],
            "discount": f"{20 + i * 5}%",
            "lastVisited": (datetime.datetime.now() - datetime.timedelta(days=i * 7)).isoformat()
        })
    return favorites

@app.get("/api/users/achievements")
def get_user_achievements():
    return [
        {
            "id": "1",
            "name": "First Timer",
            "description": "Made your first purchase with BOOM Card",
            "icon": "🎉",
            "unlockedAt": (datetime.datetime.now() - datetime.timedelta(days=30)).isoformat(),
            "progress": 100
        },
        {
            "id": "2",
            "name": "Frequent Visitor",
            "description": "Visit 10 different partners",
            "icon": "🏃",
            "unlockedAt": None,
            "progress": 70
        },
        {
            "id": "3",
            "name": "Big Saver",
            "description": "Save over 500 BGN",
            "icon": "💰",
            "unlockedAt": None,
            "progress": 30
        }
    ]

@app.get("/api/users/stats")
def get_user_stats():
    return {
        "totalSavings": 150.75,
        "visitsThisMonth": 5,
        "pointsBalance": 250,
        "memberSince": "2024-03-10",
        "averageDiscount": 22.5,
        "favoriteCategory": "Fine Dining"
    }

@app.get("/api/subscriptions/me")
def get_my_subscription():
    return {
        "id": "sub_1",
        "planId": "premium",
        "planName": "Premium",
        "status": "active",
        "startDate": datetime.datetime.now().isoformat(),
        "endDate": (datetime.datetime.now() + datetime.timedelta(days=365)).isoformat(),
        "autoRenew": True,
        "price": 19.99,
        "currency": "BGN",
        "features": [
            "Access to all 375+ partners",
            "Up to 40% discounts",
            "Priority booking",
            "24/7 Premium support"
        ]
    }

@app.get("/api/users/connected-accounts")
def get_connected_accounts():
    return [
        {
            "id": "1",
            "provider": "google",
            "email": "edoardok@gmail.com",
            "connected": True,
            "connectedAt": (datetime.datetime.now() - datetime.timedelta(days=30)).isoformat()
        },
        {
            "id": "2",
            "provider": "facebook",
            "connected": False
        },
        {
            "id": "3",
            "provider": "apple",
            "connected": False
        }
    ]

@app.get("/api/subscriptions/plans")
def get_subscription_plans():
    return [
        {
            "id": "basic",
            "name": "Basic",
            "price": 9.99,
            "currency": "BGN",
            "features": [
                "Access to 100+ partners",
                "Up to 20% discounts",
                "Monthly newsletter",
                "Basic support"
            ],
            "highlighted": False
        },
        {
            "id": "premium",
            "name": "Premium",
            "price": 19.99,
            "currency": "BGN",
            "features": [
                "Access to all 375+ partners",
                "Up to 40% discounts",
                "Priority booking",
                "24/7 Premium support",
                "Exclusive events access"
            ],
            "highlighted": True
        },
        {
            "id": "vip",
            "name": "VIP",
            "price": 49.99,
            "currency": "BGN",
            "features": [
                "Everything in Premium",
                "Up to 50% discounts",
                "Personal concierge",
                "Private events",
                "Luxury gift package"
            ],
            "highlighted": False
        }
    ]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)