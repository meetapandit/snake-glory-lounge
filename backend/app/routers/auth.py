from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.models import LoginRequest, SignupRequest, AuthResponse, User
from app.database import (
    authenticate_user, create_user, get_user_by_email, 
    get_user_by_username, user_model_to_pydantic
)
from app.db_session import get_db

router = APIRouter(prefix="/auth", tags=["Auth"])

# Simple in-memory session management for demo purposes
# In a real app, use JWT or proper session handling
current_user_id: int | None = None


@router.post("/login", response_model=AuthResponse)
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    """
    Authenticate user with email and password.
    
    Args:
        request: Login credentials
        db: Database session
        
    Returns:
        Authentication response with user data
    """
    global current_user_id
    
    user = authenticate_user(db, request.email, request.password)
    
    if not user:
        return AuthResponse(success=False, error="User not found")
    
    current_user_id = user.id
    return AuthResponse(success=True, user=user_model_to_pydantic(user))


@router.post("/signup", response_model=AuthResponse)
async def signup(request: SignupRequest, db: Session = Depends(get_db)):
    """
    Register a new user account.
    
    Args:
        request: Signup information
        db: Database session
        
    Returns:
        Authentication response with user data
    """
    global current_user_id
    
    # Check if email already exists
    if get_user_by_email(db, request.email):
        return AuthResponse(success=False, error="Email already registered")
    
    # Check if username already exists
    if get_user_by_username(db, request.username):
        return AuthResponse(success=False, error="Username already taken")
    
    # Create new user
    new_user = create_user(db, request.username, request.email, request.password)
    
    current_user_id = new_user.id
    return AuthResponse(success=True, user=user_model_to_pydantic(new_user))


@router.post("/logout")
async def logout():
    """
    Logout current user.
    
    Returns:
        Success message
    """
    global current_user_id
    current_user_id = None
    return {"message": "Logout successful"}


@router.get("/me", response_model=User)
async def get_current_user(db: Session = Depends(get_db)):
    """
    Get current authenticated user.
    
    Args:
        db: Database session
        
    Returns:
        Current user data
        
    Raises:
        HTTPException: If not authenticated or user not found
    """
    global current_user_id
    
    if not current_user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    user = db.query(UserModel).filter(UserModel.id == current_user_id).first()
    
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    return user_model_to_pydantic(user)


# Import UserModel for the query (needed at the end to avoid circular import)
from app.db_models import UserModel
