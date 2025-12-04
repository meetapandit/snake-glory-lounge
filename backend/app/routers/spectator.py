from fastapi import APIRouter, HTTPException
from typing import List
from app.models import ActivePlayer, GameState
from app.database import active_players

router = APIRouter(prefix="/spectator", tags=["Spectator"])

@router.get("/active", response_model=List[ActivePlayer])
async def get_active_players():
    return active_players

@router.get("/player/{player_id}", response_model=GameState)
async def get_player_game_state(player_id: str):
    player = next((p for p in active_players if p.id == player_id), None)
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    return player.gameState
