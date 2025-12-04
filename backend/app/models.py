from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field
from datetime import date

class GameMode(str, Enum):
    PASS_THROUGH = "pass-through"
    WALLS = "walls"

class GameStatus(str, Enum):
    IDLE = "idle"
    PLAYING = "playing"
    PAUSED = "paused"
    GAME_OVER = "game-over"

class Direction(str, Enum):
    UP = "UP"
    DOWN = "DOWN"
    LEFT = "LEFT"
    RIGHT = "RIGHT"

class Position(BaseModel):
    x: int
    y: int

class User(BaseModel):
    id: str
    username: str
    email: EmailStr

class AuthResponse(BaseModel):
    success: bool
    user: Optional[User] = None
    error: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class SignupRequest(BaseModel):
    username: str
    email: EmailStr
    password: str

class GameState(BaseModel):
    snake: List[Position]
    food: Position
    direction: Direction
    score: int
    status: GameStatus
    mode: GameMode
    speed: int

class LeaderboardEntry(BaseModel):
    id: str
    username: str
    score: int
    mode: GameMode
    date: date

class SubmitScoreRequest(BaseModel):
    score: int
    mode: GameMode

class ActivePlayer(BaseModel):
    id: str
    username: str
    score: int
    mode: GameMode
    gameState: GameState
