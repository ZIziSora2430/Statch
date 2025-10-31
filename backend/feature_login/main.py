# ========================================
# FILE: feature_login/main.py
# ========================================
from fastapi import FastAPI, Depends, HTTPException, status, Header
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import select
import bcrypt  
from typing import Optional
from .database import engine, SessionLocal, Base
from . import models
from . import schemas

app = FastAPI(title="Auth Example Simplified")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def hash_password(password: str) -> str:
    """Hash password using bcrypt"""
    # Truncate password to 72 bytes if needed
    password_bytes = password.encode('utf-8')[:72]
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hashed password"""
    password_bytes = plain_password.encode('utf-8')[:72]
    hashed_bytes = hashed_password.encode('utf-8')
    return bcrypt.checkpw(password_bytes, hashed_bytes)


Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ======= Signup =======
@app.post("/signup", response_model=schemas.UserResponse)
def signup(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    print(f"📝 Signup request: {user_in.username}, {user_in.email}, {user_in.role}")
    
    # Kiểm tra username/email
    user = db.scalar(select(models.User).where(models.User.username == user_in.username))
    if user:
        print(f"❌ Username already exists")
        raise HTTPException(status_code=400, detail="Username already registered")
    
    user = db.scalar(select(models.User).where(models.User.email == user_in.email))
    if user:
        print(f"❌ Email already exists")
        raise HTTPException(status_code=400, detail="Email already registered")
    
    try:
        hashed_password = hash_password(user_in.password)
        print(f"✅ Password hashed successfully")
        
        db_user = models.User(
            username=user_in.username,
            email=user_in.email,
            hashed_password=hashed_password,
            role=user_in.role
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        print(f"✅ User created: {db_user.username}")
        return db_user
    except Exception as e:
        db.rollback()
        print(f"❌ Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ======= Login =======
@app.post("/login", response_model=schemas.Token)
def login(form_data: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.scalar(select(models.User).where(models.User.username == form_data.username))
    
    # ✅ SỬA: Dùng verify_password helper
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    
    token = f"{user.username}:{user.role.value}"
    return {"access_token": token, "token_type": "bearer", "role": user.role}

# ======= Get current user từ token =======
def get_current_user(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing token")
    try:
        token = authorization.split(" ")[1]
        username, role = token.split(":")
        user = db.scalar(select(models.User).where(models.User.username == username))
        if not user:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

@app.get("/users/me", response_model=schemas.UserResponse)
def read_me(current_user: models.User = Depends(get_current_user)):
    return current_user

# ======= Update current user =======
@app.put("/users/me", response_model=schemas.UserResponse)
def update_me(payload: schemas.UserUpdate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    changed = False
    if payload.full_name is not None:
        current_user.full_name = payload.full_name
        changed = True
    if payload.email is not None:
        existing = db.scalar(select(models.User).where(models.User.email == payload.email))
        if existing and existing.id != current_user.id:
            raise HTTPException(status_code=400, detail="Email already used")
        current_user.email = payload.email
        changed = True
    if changed:
        db.add(current_user)
        db.commit()
        db.refresh(current_user)
    return current_user

# ======= Example protected routes =======
@app.get("/owner/dashboard")
def owner_dashboard(current_user: models.User = Depends(get_current_user)):
    if current_user.role.value != "owner":
        raise HTTPException(status_code=403, detail="Forbidden")
    return {"msg": f"Hello owner {current_user.username}"}

@app.get("/traveller/home")
def traveller_home(current_user: models.User = Depends(get_current_user)):
    if current_user.role.value != "traveler":
        raise HTTPException(status_code=403, detail="Forbidden")
    return {"msg": f"Hello traveller {current_user.username}"}