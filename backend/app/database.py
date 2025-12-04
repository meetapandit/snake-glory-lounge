"""
Database operations using SQLAlchemy.
This module provides CRUD operations for users, leaderboard, and active players.
"""
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc, and_
from datetime import datetime, date
import random

from app.db_models import UserModel, LeaderboardEntryModel, ActivePlayerModel, GameModeEnum
from app.models import (
    User, LeaderboardEntry, GameMode, GameState, ActivePlayer, 
    Direction, Position
)
from app.security import hash_password, verify_password


# ============================================================================
# User Operations
# ============================================================================

def create_user(db: Session, username: str, email: str, password: str) -> UserModel:
    """
    Create a new user.
    
    Args:
        db: Database session
        username: Username
        email: Email address
        password: Plain text password (will be hashed)
        
    Returns:
        Created user model
    """
    password_hash = hash_password(password)
    user = UserModel(
        username=username,
        email=email,
        password_hash=password_hash
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def get_user_by_email(db: Session, email: str) -> Optional[UserModel]:
    """
    Get user by email address.
    
    Args:
        db: Database session
        email: Email address
        
    Returns:
        User model or None if not found
    """
    return db.query(UserModel).filter(UserModel.email == email).first()


def get_user_by_username(db: Session, username: str) -> Optional[UserModel]:
    """
    Get user by username.
    
    Args:
        db: Database session
        username: Username
        
    Returns:
        User model or None if not found
    """
    return db.query(UserModel).filter(UserModel.username == username).first()


def authenticate_user(db: Session, email: str, password: str) -> Optional[UserModel]:
    """
    Authenticate user with email and password.
    
    Args:
        db: Database session
        email: Email address
        password: Plain text password
        
    Returns:
        User model if authentication successful, None otherwise
    """
    user = get_user_by_email(db, email)
    if not user:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user


# ============================================================================
# Leaderboard Operations
# ============================================================================

def create_leaderboard_entry(
    db: Session,
    user_id: int,
    username: str,
    score: int,
    mode: GameMode
) -> LeaderboardEntryModel:
    """
    Create a new leaderboard entry.
    
    Args:
        db: Database session
        user_id: User ID
        username: Username (denormalized)
        score: Game score
        mode: Game mode
        
    Returns:
        Created leaderboard entry
    """
    # Convert GameMode to GameModeEnum
    mode_enum = GameModeEnum(mode.value)
    
    entry = LeaderboardEntryModel(
        user_id=user_id,
        username=username,
        score=score,
        mode=mode_enum
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


def get_leaderboard(
    db: Session,
    mode: Optional[GameMode] = None,
    limit: int = 20
) -> List[LeaderboardEntryModel]:
    """
    Get leaderboard entries.
    
    Args:
        db: Database session
        mode: Optional game mode filter
        limit: Maximum number of entries to return
        
    Returns:
        List of leaderboard entries ordered by score (descending)
    """
    query = db.query(LeaderboardEntryModel)
    
    if mode:
        mode_enum = GameModeEnum(mode.value)
        query = query.filter(LeaderboardEntryModel.mode == mode_enum)
    
    return query.order_by(desc(LeaderboardEntryModel.score)).limit(limit).all()


# ============================================================================
# Active Player Operations
# ============================================================================

def create_active_player(
    db: Session,
    user_id: int,
    username: str,
    score: int,
    mode: GameMode,
    game_state: dict
) -> ActivePlayerModel:
    """
    Create a new active player session.
    
    Args:
        db: Database session
        user_id: User ID
        username: Username (denormalized)
        score: Current score
        mode: Game mode
        game_state: Serialized game state
        
    Returns:
        Created active player model
    """
    mode_enum = GameModeEnum(mode.value)
    
    player = ActivePlayerModel(
        user_id=user_id,
        username=username,
        score=score,
        mode=mode_enum,
        game_state=game_state
    )
    db.add(player)
    db.commit()
    db.refresh(player)
    return player


def get_active_players(
    db: Session,
    mode: Optional[GameMode] = None
) -> List[ActivePlayerModel]:
    """
    Get active players.
    
    Args:
        db: Database session
        mode: Optional game mode filter
        
    Returns:
        List of active players
    """
    query = db.query(ActivePlayerModel)
    
    if mode:
        mode_enum = GameModeEnum(mode.value)
        query = query.filter(ActivePlayerModel.mode == mode_enum)
    
    return query.order_by(desc(ActivePlayerModel.updated_at)).all()


def update_active_player(
    db: Session,
    player_id: int,
    score: int,
    game_state: dict
) -> Optional[ActivePlayerModel]:
    """
    Update an active player's score and game state.
    
    Args:
        db: Database session
        player_id: Player ID
        score: New score
        game_state: Updated game state
        
    Returns:
        Updated player model or None if not found
    """
    player = db.query(ActivePlayerModel).filter(ActivePlayerModel.id == player_id).first()
    if player:
        player.score = score
        player.game_state = game_state
        player.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(player)
    return player


def delete_active_player(db: Session, player_id: int) -> bool:
    """
    Delete an active player session.
    
    Args:
        db: Database session
        player_id: Player ID
        
    Returns:
        True if deleted, False if not found
    """
    player = db.query(ActivePlayerModel).filter(ActivePlayerModel.id == player_id).first()
    if player:
        db.delete(player)
        db.commit()
        return True
    return False


# ============================================================================
# Database Initialization and Seeding
# ============================================================================

def init_db(db: Session):
    """
    Initialize database with seed data if empty.
    
    Args:
        db: Database session
    """
    # Check if database already has data
    user_count = db.query(UserModel).count()
    if user_count > 0:
        return  # Database already initialized
    
    # Seeding disabled per user request
    pass
    
    # Mock data generation removed to keep database clean
    # Only real user data will be persisted


def generate_mock_game_state(mode: GameMode, score: int) -> GameState:
    """
    Generate a mock game state for testing.
    
    Args:
        mode: Game mode
        score: Current score
        
    Returns:
        GameState object
    """
    snake_length = (score // 10) + 3
    snake = []
    start_x = random.randint(5, 15)
    start_y = random.randint(5, 15)
    
    for i in range(snake_length):
        snake.append(Position(x=start_x - i, y=start_y))
        
    return GameState(
        snake=snake,
        food=Position(x=random.randint(0, 19), y=random.randint(0, 19)),
        direction=Direction.RIGHT,
        score=score,
        status="playing",
        mode=mode,
        speed=150
    )


# ============================================================================
# Model Conversion Utilities
# ============================================================================

def user_model_to_pydantic(user: UserModel) -> User:
    """Convert UserModel to Pydantic User."""
    return User(
        id=str(user.id),
        username=user.username,
        email=user.email
    )


def leaderboard_model_to_pydantic(entry: LeaderboardEntryModel) -> LeaderboardEntry:
    """Convert LeaderboardEntryModel to Pydantic LeaderboardEntry."""
    return LeaderboardEntry(
        id=str(entry.id),
        username=entry.username,
        score=entry.score,
        mode=GameMode(entry.mode.value),
        date=entry.created_at.date()
    )


def active_player_model_to_pydantic(player: ActivePlayerModel) -> ActivePlayer:
    """Convert ActivePlayerModel to Pydantic ActivePlayer."""
    # Deserialize game state from JSON
    game_state_dict = player.game_state
    game_state = GameState(**game_state_dict)
    
    return ActivePlayer(
        id=str(player.id),
        username=player.username,
        score=player.score,
        mode=GameMode(player.mode.value),
        gameState=game_state
    )
