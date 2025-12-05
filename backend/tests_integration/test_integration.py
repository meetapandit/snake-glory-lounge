"""
Integration tests for the complete API flow.
These tests verify the full user journey through the API.
"""

from app.db_models import ActivePlayerModel, UserModel, GameModeEnum
from datetime import datetime

def test_complete_user_journey(client):
    """Test a complete user journey: signup -> login -> submit score -> logout"""
    
    # 1. Signup a new user
    signup_data = {
        "username": "integrationtest",
        "email": "integration@test.com",
        "password": "testpass123"
    }
    response = client.post("/auth/signup", json=signup_data)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] == True
    assert data["user"]["username"] == "integrationtest"
    user_id = data["user"]["id"]
    
    # 2. Login with the new user
    login_data = {
        "email": "integration@test.com",
        "password": "testpass123"
    }
    response = client.post("/auth/login", json=login_data)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] == True
    assert data["user"]["id"] == user_id
    
    # 3. Get current user
    response = client.get("/auth/me")
    assert response.status_code == 200
    user = response.json()
    assert user["email"] == "integration@test.com"
    
    # 4. Submit a score
    score_data = {
        "score": 1500,
        "mode": "walls"
    }
    response = client.post("/leaderboard", json=score_data)
    assert response.status_code == 200
    assert response.json() == True
    
    # 5. Verify score appears in leaderboard
    response = client.get("/leaderboard?mode=walls")
    assert response.status_code == 200
    entries = response.json()
    user_entry = next((e for e in entries if e["username"] == "integrationtest"), None)
    assert user_entry is not None
    assert user_entry["score"] == 1500
    
    # 6. Logout
    response = client.post("/auth/logout")
    assert response.status_code == 200
    
    # 7. Verify cannot access protected endpoint after logout
    response = client.get("/auth/me")
    assert response.status_code == 401


def test_leaderboard_filtering(client):
    """Test leaderboard filtering by game mode"""
    # Seed data
    users = [
        {"username": "u1", "email": "u1@test.com", "password": "p1"},
        {"username": "u2", "email": "u2@test.com", "password": "p2"}
    ]
    for u in users:
        client.post("/auth/signup", json=u)
        
    # Submit scores (need to login as each user)
    # User 1
    client.post("/auth/login", json={"email": "u1@test.com", "password": "p1"})
    client.post("/leaderboard", json={"score": 100, "mode": "walls"})
    
    # User 2
    client.post("/auth/login", json={"email": "u2@test.com", "password": "p2"})
    client.post("/leaderboard", json={"score": 200, "mode": "pass-through"})
    
    # Get all entries
    response = client.get("/leaderboard")
    assert response.status_code == 200
    all_entries = response.json()
    assert len(all_entries) >= 2
    
    # Get walls mode only
    response = client.get("/leaderboard?mode=walls")
    assert response.status_code == 200
    walls_entries = response.json()
    assert len(walls_entries) > 0
    assert all(entry["mode"] == "walls" for entry in walls_entries)
    
    # Get pass-through mode only
    response = client.get("/leaderboard?mode=pass-through")
    assert response.status_code == 200
    passthrough_entries = response.json()
    assert len(passthrough_entries) > 0
    assert all(entry["mode"] == "pass-through" for entry in passthrough_entries)


def test_spectator_endpoints(client, db_session):
    """Test spectator mode endpoints"""
    # Seed data directly
    user = UserModel(username="spectate_target", email="spectate@test.com", password_hash="hash")
    db_session.add(user)
    db_session.commit()
    
    active_player = ActivePlayerModel(
        user_id=user.id,
        username=user.username,
        score=500,
        mode=GameModeEnum.WALLS,
        game_state={
            "snake": [], 
            "score": 500,
            "food": {"x": 1, "y": 1},
            "direction": "UP",
            "status": "playing",
            "mode": "walls",
            "speed": 100
        },
        updated_at=datetime.utcnow()
    )
    db_session.add(active_player)
    db_session.commit()
    
    # Get active players
    response = client.get("/spectator/active")
    assert response.status_code == 200
    players = response.json()
    assert len(players) > 0
    assert all("id" in p and "username" in p and "gameState" in p for p in players)
    
    # Get specific player state
    player_id = players[0]["id"]
    response = client.get(f"/spectator/player/{player_id}")
    assert response.status_code == 200
    game_state = response.json()
    assert "snake" in game_state
    assert "food" in game_state
    assert "score" in game_state
    
    # Test non-existent player
    response = client.get("/spectator/player/999999")
    assert response.status_code == 404


def test_authentication_errors(client):
    """Test authentication error scenarios"""
    
    # Create a user first for duplicate check
    client.post("/auth/signup", json={
        "username": "existing",
        "email": "player1@test.com",
        "password": "password123"
    })
    
    # Login with non-existent user
    response = client.post("/auth/login", json={
        "email": "nonexistent@test.com",
        "password": "wrong"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["success"] == False
    assert "error" in data
    
    # Login with wrong password
    response = client.post("/auth/login", json={
        "email": "player1@test.com",
        "password": "wrongpassword"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["success"] == False
    
    # Signup with existing email
    response = client.post("/auth/signup", json={
        "username": "duplicate",
        "email": "player1@test.com",
        "password": "password123"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["success"] == False


def test_score_submission_requires_auth(client):
    """Test that score submission requires authentication"""
    
    # Logout first (just in case)
    client.post("/auth/logout")
    
    # Try to submit score without auth
    response = client.post("/leaderboard", json={
        "score": 1000,
        "mode": "walls"
    })
    # Should fail because no user is authenticated
    assert response.status_code == 401
