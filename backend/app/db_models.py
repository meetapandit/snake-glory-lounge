"""
SQLAlchemy database models for Snake Glory Lounge.
"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum as SQLEnum, JSON, Index
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
import enum

Base = declarative_base()


class GameModeEnum(str, enum.Enum):
    """Game mode enumeration."""
    PASS_THROUGH = "pass-through"
    WALLS = "walls"


class UserModel(Base):
    """User account model."""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    leaderboard_entries = relationship("LeaderboardEntryModel", back_populates="user", cascade="all, delete-orphan")
    active_sessions = relationship("ActivePlayerModel", back_populates="user", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<UserModel(id={self.id}, username='{self.username}', email='{self.email}')>"


class LeaderboardEntryModel(Base):
    """Leaderboard entry model for high scores."""
    __tablename__ = "leaderboard_entries"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    username = Column(String(50), nullable=False)  # Denormalized for faster queries
    score = Column(Integer, nullable=False)
    mode = Column(SQLEnum(GameModeEnum), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    user = relationship("UserModel", back_populates="leaderboard_entries")
    
    # Indexes for common queries
    __table_args__ = (
        Index('idx_leaderboard_mode_score', 'mode', 'score'),
        Index('idx_leaderboard_created_at', 'created_at'),
    )
    
    def __repr__(self):
        return f"<LeaderboardEntryModel(id={self.id}, username='{self.username}', score={self.score}, mode='{self.mode}')>"


class ActivePlayerModel(Base):
    """Active player session model."""
    __tablename__ = "active_players"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    username = Column(String(50), nullable=False)  # Denormalized for faster queries
    score = Column(Integer, nullable=False, default=0)
    mode = Column(SQLEnum(GameModeEnum), nullable=False)
    game_state = Column(JSON, nullable=False)  # Serialized GameState
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    user = relationship("UserModel", back_populates="active_sessions")
    
    # Index for mode filtering
    __table_args__ = (
        Index('idx_active_players_mode', 'mode'),
        Index('idx_active_players_updated_at', 'updated_at'),
    )
    
    def __repr__(self):
        return f"<ActivePlayerModel(id={self.id}, username='{self.username}', score={self.score}, mode='{self.mode}')>"
