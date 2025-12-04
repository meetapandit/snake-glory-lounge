from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, leaderboard, spectator
from app.db_session import create_tables, SessionLocal
from app.database import init_db

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


@app.on_event("startup")
async def startup_event():
    """Initialize database on startup."""
    # Create tables if they don't exist
    create_tables()
    
    # Seed initial data if database is empty
    db = SessionLocal()
    try:
        init_db(db)
    finally:
        db.close()


@app.get("/")
async def root():
    return {"message": "Welcome to Snake Glory Lounge API"}

