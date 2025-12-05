from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from app.models import LeaderboardEntry, SubmitScoreRequest, GameMode
from app.database import (
    get_leaderboard, create_leaderboard_entry, 
    leaderboard_model_to_pydantic
)
from app.db_session import get_db
from app.routers.auth import get_current_user

router = APIRouter(prefix="/leaderboard", tags=["Leaderboard"])


@router.get("", response_model=List[LeaderboardEntry])
async def get_leaderboard_endpoint(
    mode: Optional[GameMode] = None,
    db: Session = Depends(get_db)
):
    """
    Get leaderboard entries.
    
    Args:
        mode: Optional game mode filter
        db: Database session
        
    Returns:
        List of leaderboard entries ordered by score
    """
    entries = get_leaderboard(db, mode=mode, limit=20)
    return [leaderboard_model_to_pydantic(entry) for entry in entries]


@router.post("", response_model=bool)
async def submit_score(
    request: SubmitScoreRequest,
    user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Submit a new score to the leaderboard.
    
    Args:
        request: Score submission data
        user: Current authenticated user
        db: Database session
        
    Returns:
        True if successful
    """
    # Convert user.id from string to int
    user_id = int(user.id)
    
    create_leaderboard_entry(
        db,
        user_id=user_id,
        username=user.username,
        score=request.score,
        mode=request.mode
    )
    
    return True


@router.delete("", response_model=int)
async def clear_leaderboard_endpoint(
    user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Clear all leaderboard entries.
    Only authenticated users can perform this action (for now).
    
    Args:
        user: Current authenticated user
        db: Database session
        
    Returns:
        Number of deleted entries
    """
    from app.database import clear_leaderboard
    return clear_leaderboard(db)
