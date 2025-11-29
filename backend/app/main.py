# app/main.py
"""
Main FastAPI application
Entry point cho toàn bộ dự án Statch
"""

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from . import models
from app.database import engine, test_connection
from app.models import Base


from .feature_login.router import router as login_router
from .accommodations.traveler_router import router as traveler_accommodation_router 
from .accommodations.owner_router import router as owner_accommodation_router 
from .booking.traveler_router import router as traveler_booking_router
from .booking.owner_router import router as owner_booking_router
from .reviews import router as reviews_router

# Feature Login (Authentication) - ✅ CÓ RỒI
from app.feature_login.router import router as auth_router

# System Forum (Posts & Replies) - ⚠️ TẠM THỜI COMMENT
from app.system_forum.routes import router as forum_router

# Accommodations (Booking system) - ✅ KIỂM TRA TÊN FILE
from app.accommodations.traveler_router import router as traveler_router
from app.accommodations.owner_router import router as owner_router

models.Base.metadata.create_all(bind=engine)

# =====================================================
# FastAPI app instance
# =====================================================

app = FastAPI(
    title="Statch API",
    description="""
    🏨 **Statch - Travel & Accommodation Platform**
    
    ## Features:
    
    ### 🔐 Authentication
    - User registration (signup)
    - User login
    - JWT token-based authentication
    - Role-based access (traveler/owner)
    - Protected routes
    
    ### 🏠 Accommodations
    - Browse accommodations (traveler)
    - Manage accommodations (owner)
    - Booking system
    - Reviews and ratings
    
    ### 💬 Forum (Coming Soon)
    - Create and view posts
    - Comment on posts (replies)
    - Categories: general, tips, questions, reviews, stories
    
    ---
    
    **Developer:** Team Statch  
    **Version:** 1.0.0  
    **Contact:** tanthanh1606@example.com
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# =====================================================
# CORS Middleware
# =====================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",      # React default
        "http://localhost:5173",      # Vite default
        "http://localhost:5174",      # Vite alternate
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =====================================================
# Include routers
# =====================================================

# Authentication routes (feature_login)
app.include_router(
    auth_router,
    prefix="",  # ← KHÔNG CÓ PREFIX vì router.py đã có /signup, /login
    tags=["🔐 Authentication"]
)

# Forum routes (system_forum) - TẠM THỜI COMMENT
app.include_router(
    forum_router,
    prefix="",
    tags=["💬 Forum"]
)

# Accommodation routes - Traveler
app.include_router(
    traveler_router,
    tags=["🏠 Accommodations (Traveler)"]
)

# Accommodation routes - Owner
app.include_router(
    owner_router,
    tags=["🏢 Accommodations (Owner)"]
)

# 3. Booking 
app.include_router(
    traveler_booking_router,
    tags=["📅 Booking (Traveler)"]
)
app.include_router(
    owner_booking_router,
    tags=["📅 Booking (Owner)"]
)

app.include_router(
    reviews_router.router, 
    prefix="/api", 
    tags=["⭐ Reviews"]
)


# =====================================================
# Root endpoints
# =====================================================

@app.get("/", tags=["🏠 Root"])
def root():
    """
    Root endpoint - API welcome message
    """
    return {
        "message": "🎉 Chào mừng đến với Statch API!",
        "version": "1.0.0",
        "docs": "/docs",
    }

@app.get("/health", tags=["🏥 Health"])
def health_check():
    # Kiểm tra trạng thái server
    return {
        "status": "healthy",
        #"database": db_status,
        "version": "1.0.0"
    }

# =====================================================
# Run app (for development)
# =====================================================

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
