from fastapi import APIRouter, Depends
from typing import List, Optional
from app.models import LeaderboardEntry, SubmitScoreRequest, GameMode
from app.database import leaderboard
from app.routers.auth import get_current_user
from datetime import date
import uuid

router = APIRouter(prefix="/leaderboard", tags=["Leaderboard"])

@router.get("/", response_model=List[LeaderboardEntry])
async def get_leaderboard(mode: Optional[GameMode] = None):
    if mode:
        return [entry for entry in leaderboard if entry.mode == mode]
    return leaderboard

@router.post("/", response_model=bool)
async def submit_score(request: SubmitScoreRequest, user = Depends(get_current_user)):
    new_entry = LeaderboardEntry(
        id=str(uuid.uuid4()),
        username=user.username,
        score=request.score,
        mode=request.mode,
        date=date.today()
    )
    
    leaderboard.append(new_entry)
    leaderboard.sort(key=lambda x: x.score, reverse=True)
    return True
