from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, leaderboard, spectator
from app.db_session import create_tables, SessionLocal
from app.database import init_db

from fastapi.staticfiles import StaticFiles
import os

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
app.include_router(auth.router, prefix="/api")
app.include_router(leaderboard.router, prefix="/api")
app.include_router(spectator.router, prefix="/api")


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


# Mount static files correctly
if os.path.exists("static"):
    app.mount("/", StaticFiles(directory="static", html=True), name="static")


