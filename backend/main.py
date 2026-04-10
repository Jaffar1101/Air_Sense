import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import get_db, init_mongo_collections
from routes import agent, environment, hardware

app = FastAPI()

# Register Routers
app.include_router(agent.router, prefix="/agent", tags=["agent"])
app.include_router(environment.router, prefix="/environment", tags=["environment"])
app.include_router(hardware.router, prefix="/hardware", tags=["hardware"])

@app.on_event("startup")
async def startup_event():
    db = get_db()
    if db is not None:
        init_mongo_collections(db)
    else:
        print("Skipping MongoDB initialization (connection failed or not configured)")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "ok"}

