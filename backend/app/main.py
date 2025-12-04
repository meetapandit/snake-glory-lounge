from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, leaderboard, spectator

app = FastAPI(
    title="Snake Glory Lounge API",
    description="API for the Snake Glory Lounge game",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(leaderboard.router)
app.include_router(spectator.router)

@app.get("/")
async def root():
    return {"message": "Welcome to Snake Glory Lounge API"}
