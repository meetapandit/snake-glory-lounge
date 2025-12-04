from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
from app.models import ActivePlayer, GameState
from app.database import get_active_players, active_player_model_to_pydantic
from app.db_session import get_db
from app.db_models import ActivePlayerModel

router = APIRouter(prefix="/spectator", tags=["Spectator"])


@router.get("/active", response_model=List[ActivePlayer])
async def get_active_players_endpoint(db: Session = Depends(get_db)):
    """
    Get all active players.
    
    Args:
        db: Database session
        
    Returns:
        List of active players with their game states
    """
    players = get_active_players(db)
    return [active_player_model_to_pydantic(player) for player in players]


@router.get("/player/{player_id}", response_model=GameState)
async def get_player_game_state(player_id: str, db: Session = Depends(get_db)):
    """
    Get game state for a specific player.
    
    Args:
        player_id: Player ID
        db: Database session
        
    Returns:
        Player's current game state
        
    Raises:
        HTTPException: If player not found
    """
    # Convert player_id to int
    try:
        player_id_int = int(player_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Player not found")
    
    player = db.query(ActivePlayerModel).filter(ActivePlayerModel.id == player_id_int).first()
    
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    
    # Deserialize game state from JSON
    return GameState(**player.game_state)
