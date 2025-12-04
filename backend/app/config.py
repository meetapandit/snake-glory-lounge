"""
Database configuration and settings.
"""
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


class Settings:
    """Application settings."""
    
    # Database configuration
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "sqlite:///./snake_glory.db"
    )
    
    # SQLite-specific settings
    SQLITE_CONNECT_ARGS = {
        "check_same_thread": False,  # Allow multiple threads to use the same connection
    }
    
    # PostgreSQL connection pool settings
    POSTGRES_POOL_SIZE = int(os.getenv("POSTGRES_POOL_SIZE", "5"))
    POSTGRES_MAX_OVERFLOW = int(os.getenv("POSTGRES_MAX_OVERFLOW", "10"))
    POSTGRES_POOL_TIMEOUT = int(os.getenv("POSTGRES_POOL_TIMEOUT", "30"))
    
    # Application settings
    SECRET_KEY: str = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")
    DEBUG: bool = os.getenv("DEBUG", "true").lower() == "true"
    
    @property
    def is_sqlite(self) -> bool:
        """Check if using SQLite database."""
        return self.DATABASE_URL.startswith("sqlite")
    
    @property
    def is_postgres(self) -> bool:
        """Check if using PostgreSQL database."""
        return self.DATABASE_URL.startswith("postgresql")
    
    def get_engine_args(self) -> dict:
        """Get database engine arguments based on database type."""
        if self.is_sqlite:
            return {
                "connect_args": self.SQLITE_CONNECT_ARGS,
                "echo": self.DEBUG,
            }
        elif self.is_postgres:
            return {
                "pool_size": self.POSTGRES_POOL_SIZE,
                "max_overflow": self.POSTGRES_MAX_OVERFLOW,
                "pool_timeout": self.POSTGRES_POOL_TIMEOUT,
                "echo": self.DEBUG,
            }
        else:
            return {"echo": self.DEBUG}


# Global settings instance
settings = Settings()
