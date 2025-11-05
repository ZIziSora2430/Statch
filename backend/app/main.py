import uvicorn

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import models
from .database import engine

from .feature_login import router as login_router
from .accommodations import router as accommodation_router # <-- DÒNG MỚI

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Chào mừng đến với Stach API!"}

if __name__ == "__main__":
    uvicorn.run("main.app", host="127.0.0.1", port=8000, reload=True)


