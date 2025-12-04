from fastapi import APIRouter, HTTPException, Depends
from app.models import LoginRequest, SignupRequest, AuthResponse, User
from app.database import users
import uuid

router = APIRouter(prefix="/auth", tags=["Auth"])

# Simple in-memory session management for demo purposes
# In a real app, use JWT or proper session handling
current_user_id: str | None = None

@router.post("/login", response_model=AuthResponse)
async def login(request: LoginRequest):
    global current_user_id
    user_data = users.get(request.email)
    
    if not user_data:
        return AuthResponse(success=False, error="User not found")
    
    if user_data["password"] != request.password:
        return AuthResponse(success=False, error="Invalid password")
    
    current_user_id = user_data["user"].id
    return AuthResponse(success=True, user=user_data["user"])

@router.post("/signup", response_model=AuthResponse)
async def signup(request: SignupRequest):
    global current_user_id
    if request.email in users:
        return AuthResponse(success=False, error="Email already registered")
    
    new_user = User(
        id=str(uuid.uuid4()),
        username=request.username,
        email=request.email
    )
    
    users[request.email] = {
        "user": new_user,
        "password": request.password
    }
    
    current_user_id = new_user.id
    return AuthResponse(success=True, user=new_user)

@router.post("/logout")
async def logout():
    global current_user_id
    current_user_id = None
    return {"message": "Logout successful"}

@router.get("/me", response_model=User)
async def get_current_user():
    global current_user_id
    if not current_user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Find user by ID (inefficient but works for mock)
    for data in users.values():
        if data["user"].id == current_user_id:
            return data["user"]
            
    raise HTTPException(status_code=401, detail="User not found")
