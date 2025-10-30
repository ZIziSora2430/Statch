import uvicorn
from fastapi import FastAPI


from app.routers import matching

app = FastAPI()
app.include_router(matching.router, prefix="/api/matching")

@app.get("/")
def read_root():
    return {"message": "Chào mừng đến với Stach API!"}

if __name__ == "__main__":
    uvicorn.run("main.app", host="127.0.0.1", port=8000, reload=True)


