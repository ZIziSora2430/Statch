import uvicorn

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import models
from .database import engine


from .feature_login.router import router as login_router
from .accommodations.traveler_router import router as traveler_accommodation_router 
from .accommodations.owner_router import router as owner_accommodation_router 
from .booking.traveler_router import router as traveler_booking_router
from .booking.owner_router import router as owner_booking_router
from .reviews import router as reviews_router


models.Base.metadata.create_all(bind=engine)
app = FastAPI(title="STATCH Project API")

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

#Accommodations
app.include_router(traveler_accommodation_router)
app.include_router(owner_accommodation_router)

#Booking
app.include_router(traveler_booking_router)
app.include_router(owner_booking_router)

#Login
app.include_router(login_router)

#Review
app.include_router(reviews_router.router, prefix="/api")


@app.get("/")
def read_root():
    return {"message": "Chào mừng đến với Stach API!"}
