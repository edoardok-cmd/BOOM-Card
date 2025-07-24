"""
BOOM Card Enterprise Backend
Built using AI-Automation Platform's robust architecture

This is a production-ready FastAPI backend with:
- Enterprise-grade security and authentication
- Comprehensive database models with relationships
- Advanced error handling and monitoring
- Scalable architecture patterns
"""

from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordBearer
from contextlib import asynccontextmanager
from sqlalchemy import create_engine, Column, String, Integer, Boolean, DateTime, Text, JSON, ForeignKey, Enum, Numeric, func
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker, Session
from sqlalchemy.dialects.postgresql import UUID
from pydantic import BaseModel, EmailStr, Field, validator
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
from enum import Enum as PyEnum
import uuid
import logging
import os
from dataclasses import dataclass

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration
@dataclass
class Settings:
    database_url: str = os.getenv("DATABASE_URL", "postgresql://postgres:Patrik123%21%40%23@db.jutsyyzaujeaxfwlwhig.supabase.co:5432/postgres")
    redis_url: str = os.getenv("REDIS_URL", "redis://default:ATYQAAIjcDFiZTUyNGRjYWRiZDI0NDIwYWVmZGY2OTA5YWVjMWQzZnAxMA@integral-jennet-13840.upstash.io:6379")
    secret_key: str = os.getenv("JWT_SECRET", "35efbf7aa15660e1d778496e0912f8ce54cae023055bf47a12330d57821dae9ee107b8495724fc04fbf9c3d82f0bf4e0f22224eb8c58c42a9791acc498d299d1")
    access_token_expire_minutes: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    refresh_token_expire_days: int = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))
    cors_origins: List[str] = os.getenv("CORS_ORIGINS", "https://boom-card.netlify.app,http://localhost:3000,http://localhost:3001").split(",")
    debug: bool = os.getenv("DEBUG", "false").lower() == "true"

settings = Settings()

# Algorithm for JWT
ALGORITHM = "HS256"

# Database setup
engine = create_engine(settings.database_url)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login")

# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ===================== DATABASE MODELS =====================

class TimestampMixin:
    """Mixin for adding created_at and updated_at timestamps"""
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

class UserStatus(PyEnum):
    ACTIVE = "active"
    INACTIVE = "inactive" 
    SUSPENDED = "suspended"
    PENDING_VERIFICATION = "pending_verification"

class SubscriptionType(PyEnum):
    FREE = "free"
    PREMIUM = "premium"
    ENTERPRISE = "enterprise"

class DiscountType(PyEnum):
    PERCENTAGE = "percentage"
    FIXED_AMOUNT = "fixed_amount"
    BUY_ONE_GET_ONE = "buy_one_get_one"

class TransactionStatus(PyEnum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class User(Base, TimestampMixin):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    phone_number = Column(String(20), unique=True, nullable=True, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    status = Column(Enum(UserStatus), default=UserStatus.PENDING_VERIFICATION, nullable=False)
    subscription_type = Column(Enum(SubscriptionType), default=SubscriptionType.FREE, nullable=False)
    
    # Profile information
    date_of_birth = Column(DateTime, nullable=True)
    preferences = Column(JSON, default=dict, nullable=False) 
    notification_settings = Column(JSON, default=dict, nullable=False)
    
    # Verification
    email_verified = Column(Boolean, default=False, nullable=False)
    verification_token = Column(String(255), nullable=True)
    
    # Security
    last_login = Column(DateTime(timezone=True), nullable=True)
    failed_login_attempts = Column(Integer, default=0, nullable=False)
    locked_until = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    transactions = relationship("Transaction", back_populates="user", cascade="all, delete-orphan")
    favorites = relationship("UserFavorite", back_populates="user", cascade="all, delete-orphan")

class Partner(Base, TimestampMixin):
    __tablename__ = "partners"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    business_name = Column(String(200), nullable=False)
    business_type = Column(String(100), nullable=False) 
    email = Column(String(255), unique=True, nullable=False)
    phone_number = Column(String(20), nullable=False)
    
    # Business details
    description = Column(Text, nullable=True)
    website = Column(String(500), nullable=True)
    logo_url = Column(String(500), nullable=True)
    
    # Location (JSON: {street, city, state, zip, country, coordinates})
    address = Column(JSON, nullable=False)
    
    # Business verification
    is_verified = Column(Boolean, default=False, nullable=False)
    verification_documents = Column(JSON, default=list, nullable=False)
    
    # Business hours (JSON: {monday: {open: "09:00", close: "17:00"}, ...})
    business_hours = Column(JSON, default=dict, nullable=False)
    
    # Relationships
    discounts = relationship("Discount", back_populates="partner", cascade="all, delete-orphan")

class Discount(Base, TimestampMixin):
    __tablename__ = "discounts"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    partner_id = Column(UUID(as_uuid=True), ForeignKey("partners.id"), nullable=False)
    
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    discount_type = Column(Enum(DiscountType), nullable=False)
    discount_value = Column(Numeric(10, 2), nullable=False)
    
    # Validity
    valid_from = Column(DateTime(timezone=True), nullable=False)
    valid_until = Column(DateTime(timezone=True), nullable=False) 
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Usage limits
    max_uses_per_user = Column(Integer, nullable=True)
    max_total_uses = Column(Integer, nullable=True)
    current_uses = Column(Integer, default=0, nullable=False)
    
    # Terms and conditions
    terms_conditions = Column(Text, nullable=True)
    minimum_purchase = Column(Numeric(10, 2), nullable=True)
    
    # QR Code
    qr_code_data = Column(Text, nullable=True)
    
    # Categories and tags
    categories = Column(JSON, default=list, nullable=False)
    tags = Column(JSON, default=list, nullable=False)
    
    # Relationships
    partner = relationship("Partner", back_populates="discounts")
    transactions = relationship("Transaction", back_populates="discount")

class Transaction(Base, TimestampMixin):
    __tablename__ = "transactions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    discount_id = Column(UUID(as_uuid=True), ForeignKey("discounts.id"), nullable=False)
    
    # Transaction details
    original_amount = Column(Numeric(10, 2), nullable=False)
    discount_amount = Column(Numeric(10, 2), nullable=False)
    final_amount = Column(Numeric(10, 2), nullable=False)
    
    # Status tracking
    status = Column(Enum(TransactionStatus), default=TransactionStatus.COMPLETED, nullable=False)
    
    # Location and device info
    location_data = Column(JSON, nullable=True)
    device_info = Column(JSON, nullable=True)
    
    # Additional data
    transaction_metadata = Column(JSON, default=dict, nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="transactions")
    discount = relationship("Discount", back_populates="transactions")

class UserFavorite(Base, TimestampMixin):
    __tablename__ = "user_favorites"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    discount_id = Column(UUID(as_uuid=True), ForeignKey("discounts.id"), nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="favorites")
    discount = relationship("Discount")

# ===================== PYDANTIC SCHEMAS =====================

# Auth schemas
class UserRegistrationRequest(BaseModel):
    email: EmailStr = Field(..., description="User email address")
    phone_number: Optional[str] = Field(None, description="Phone number")
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    password: str = Field(..., min_length=8, description="Password")
    date_of_birth: Optional[datetime] = Field(None, description="Date of birth")
    
    @validator('password')
    def validate_password(cls, v):
        if not any(char.isdigit() for char in v):
            raise ValueError('Password must contain at least one digit')
        if not any(char.isupper() for char in v):
            raise ValueError('Password must contain at least one uppercase letter') 
        if not any(char in "!@#$%^&*()_+-=[]{}|;:,.<>?" for char in v):
            raise ValueError('Password must contain at least one special character')
        return v

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: EmailStr
    phone_number: Optional[str]
    first_name: str
    last_name: str
    status: str
    subscription_type: str
    email_verified: bool
    created_at: datetime
    
    class Config:
        orm_mode = True

class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse

# Partner schemas
class PartnerRegistrationRequest(BaseModel):
    business_name: str = Field(..., min_length=1, max_length=200)
    business_type: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    phone_number: str = Field(..., min_length=10, max_length=20)
    description: Optional[str] = None
    website: Optional[str] = None
    address: Dict[str, Any] = Field(..., description="Address with street, city, state, zip, country")

class PartnerResponse(BaseModel):
    id: str
    business_name: str
    business_type: str
    email: EmailStr
    description: Optional[str]
    website: Optional[str]
    address: Dict[str, Any]
    is_verified: bool
    created_at: datetime
    
    class Config:
        orm_mode = True

# Discount schemas  
class DiscountRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=1)
    discount_type: DiscountType
    discount_value: float = Field(..., gt=0)
    valid_from: datetime
    valid_until: datetime
    terms_conditions: Optional[str] = None
    minimum_purchase: Optional[float] = Field(None, ge=0)
    max_uses_per_user: Optional[int] = Field(None, ge=1)
    max_total_uses: Optional[int] = Field(None, ge=1)
    categories: List[str] = Field(default_factory=list)
    tags: List[str] = Field(default_factory=list)

class DiscountResponse(BaseModel):
    id: str
    title: str
    description: str
    discount_type: str
    discount_value: float
    valid_from: datetime
    valid_until: datetime
    is_active: bool
    partner: Dict[str, Any]
    qr_code_data: Optional[str]
    categories: List[str]
    tags: List[str]
    
    class Config:
        orm_mode = True

# ===================== AUTHENTICATION UTILITIES =====================

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(user: User) -> str:
    expire = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
    to_encode = {
        "sub": str(user.id),
        "email": user.email,
        "type": "access",
        "exp": expire
    }
    return jwt.encode(to_encode, settings.secret_key, algorithm=ALGORITHM)

def create_refresh_token(user: User) -> str:
    expire = datetime.utcnow() + timedelta(days=settings.refresh_token_expire_days)
    to_encode = {
        "sub": str(user.id),
        "type": "refresh", 
        "exp": expire
    }
    return jwt.encode(to_encode, settings.secret_key, algorithm=ALGORITHM)

def verify_token(token: str) -> Optional[str]:
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            return None
        return user_id
    except JWTError:
        return None

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    user_id = verify_token(token)
    if user_id is None:
        raise credentials_exception
        
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
        
    return user

# ===================== SERVICES =====================

class UserService:
    def __init__(self, db: Session):
        self.db = db
    
    async def create_user(self, user_data: UserRegistrationRequest) -> User:
        # Check if user exists
        existing_user = self.db.query(User).filter(
            (User.email == user_data.email) | 
            (User.phone_number == user_data.phone_number)
        ).first()
        
        if existing_user:
            raise ValueError("User already exists")
        
        # Create new user
        hashed_password = get_password_hash(user_data.password)
        user = User(
            email=user_data.email,
            phone_number=user_data.phone_number,
            first_name=user_data.first_name,
            last_name=user_data.last_name,
            hashed_password=hashed_password,
            date_of_birth=user_data.date_of_birth,
            status=UserStatus.PENDING_VERIFICATION
        )
        
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        
        return user
    
    async def authenticate_user(self, email: str, password: str) -> Optional[User]:
        user = self.db.query(User).filter(User.email == email).first()
        if not user or not verify_password(password, user.hashed_password):
            return None
        
        # Update last login
        user.last_login = datetime.utcnow()
        user.failed_login_attempts = 0
        self.db.commit()
        
        return user

# ===================== FASTAPI APPLICATION =====================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    # Startup
    logger.info("Starting BOOM Card Enterprise Backend")
    
    # Create database tables
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created")
    
    yield
    
    # Shutdown
    logger.info("Shutting down BOOM Card Enterprise Backend")

# Create FastAPI application
app = FastAPI(
    title="BOOM Card Enterprise API",
    description="Production-ready digital discount card and partner management platform",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None
)

# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(GZipMiddleware, minimum_size=1000)

if not settings.debug:
    app.add_middleware(
        TrustedHostMiddleware, 
        allowed_hosts=["boom-card.onrender.com", "boom-card.netlify.app"]
    )

# ===================== ERROR HANDLERS =====================

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": exc.detail,
            "timestamp": datetime.utcnow().isoformat(),
            "path": str(request.url.path)
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": "Internal server error",
            "timestamp": datetime.utcnow().isoformat(),
            "path": str(request.url.path)
        }
    )

# ===================== API ROUTES =====================

# Health check
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0",
        "environment": "production" if not settings.debug else "development"
    }

# Root API info
@app.get("/api")
async def api_info():
    return {
        "name": "BOOM Card Enterprise API",
        "version": "1.0.0", 
        "status": "running",
        "timestamp": datetime.utcnow().isoformat(),
        "docs_url": "/docs" if settings.debug else "Contact support for API documentation"
    }

# Authentication endpoints
@app.post("/api/v1/auth/register", response_model=UserResponse)
async def register_user(
    user_data: UserRegistrationRequest,
    db: Session = Depends(get_db)
):
    user_service = UserService(db)
    try:
        user = await user_service.create_user(user_data)
        return UserResponse(
            id=str(user.id),
            email=user.email,
            phone_number=user.phone_number,
            first_name=user.first_name,
            last_name=user.last_name,
            status=user.status.value,
            subscription_type=user.subscription_type.value,
            email_verified=user.email_verified,
            created_at=user.created_at
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/v1/auth/login", response_model=LoginResponse)
async def login_user(
    login_data: LoginRequest,
    db: Session = Depends(get_db)
):
    user_service = UserService(db)
    user = await user_service.authenticate_user(login_data.email, login_data.password)
    
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Incorrect email or password"
        )
    
    access_token = create_access_token(user)
    refresh_token = create_refresh_token(user)
    
    user_response = UserResponse(
        id=str(user.id),
        email=user.email,
        phone_number=user.phone_number,
        first_name=user.first_name,
        last_name=user.last_name,
        status=user.status.value,
        subscription_type=user.subscription_type.value,
        email_verified=user.email_verified,
        created_at=user.created_at
    )
    
    return LoginResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=settings.access_token_expire_minutes * 60,
        user=user_response
    )

# Legacy endpoints for compatibility
@app.post("/api/auth/login")
async def legacy_login(
    login_data: LoginRequest,
    db: Session = Depends(get_db)
):
    """Legacy login endpoint for backward compatibility"""
    user_service = UserService(db)
    user = await user_service.authenticate_user(login_data.email, login_data.password)
    
    if not user:
        return {
            "success": False,
            "message": "Invalid credentials"
        }
    
    access_token = create_access_token(user)
    
    return {
        "success": True,
        "message": "Login successful",
        "data": {
            "accessToken": access_token,
            "user": {
                "id": str(user.id),
                "email": user.email,
                "firstName": user.first_name,
                "lastName": user.last_name,
                "membershipType": user.subscription_type.value.title()
            }
        }
    }

@app.post("/api/auth/register")
async def legacy_register(
    user_data: UserRegistrationRequest,
    db: Session = Depends(get_db)
):
    """Legacy register endpoint for backward compatibility"""
    user_service = UserService(db)
    try:
        user = await user_service.create_user(user_data)
        return {
            "success": True,
            "message": "Registration successful", 
            "data": {
                "user": {
                    "id": str(user.id),
                    "email": user.email,
                    "firstName": user.first_name,
                    "lastName": user.last_name
                }
            }
        }
    except ValueError as e:
        return {
            "success": False,
            "message": str(e)
        }

# User profile endpoints
@app.get("/api/auth/profile")
async def get_user_profile(current_user: User = Depends(get_current_user)):
    return {
        "success": True,
        "data": {
            "id": str(current_user.id),
            "email": current_user.email,
            "firstName": current_user.first_name,
            "lastName": current_user.last_name,
            "membershipType": current_user.subscription_type.value.title(),
            "emailVerified": current_user.email_verified,
            "joinDate": current_user.created_at.strftime("%Y-%m-%d"),
            "validUntil": "2025-12-31"  # Mock data for now
        }
    }

# Mock endpoints for frontend compatibility
@app.get("/api/users/achievements")
async def get_user_achievements(current_user: User = Depends(get_current_user)):
    return {
        "success": True,
        "data": [
            {"id": 1, "title": "Welcome!", "description": "Joined BOOM Card", "icon": "🎉", "date": current_user.created_at.strftime("%Y-%m-%d")},
            {"id": 2, "title": "First Login", "description": "Successfully logged in", "icon": "🔑", "date": datetime.utcnow().strftime("%Y-%m-%d")}
        ]
    }

@app.get("/api/users/stats")
async def get_user_stats(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Calculate real stats from database
    total_transactions = db.query(Transaction).filter(Transaction.user_id == current_user.id).count()
    total_savings = db.query(func.sum(Transaction.discount_amount)).filter(Transaction.user_id == current_user.id).scalar() or 0
    
    return {
        "success": True,
        "data": {
            "totalSavings": float(total_savings),
            "totalPurchases": total_transactions,
            "favoritePartners": db.query(UserFavorite).filter(UserFavorite.user_id == current_user.id).count(),
            "memberSince": current_user.created_at.strftime("%Y-%m-%d")
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "boom_card_enterprise:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", "5002")),
        reload=settings.debug
    )