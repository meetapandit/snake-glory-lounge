"""
Integration tests for the complete API flow.
These tests verify the full user journey through the API.
"""

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
    response = client.post("/leaderboard/", json=score_data)
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
    
    # Get all entries
    response = client.get("/leaderboard")
    assert response.status_code == 200
    all_entries = response.json()
    assert len(all_entries) > 0
    
    # Get walls mode only
    response = client.get("/leaderboard?mode=walls")
    assert response.status_code == 200
    walls_entries = response.json()
    assert all(entry["mode"] == "walls" for entry in walls_entries)
    
    # Get pass-through mode only
    response = client.get("/leaderboard?mode=pass-through")
    assert response.status_code == 200
    passthrough_entries = response.json()
    assert all(entry["mode"] == "pass-through" for entry in passthrough_entries)
    
    # Verify filtering works
    assert len(walls_entries) + len(passthrough_entries) == len(all_entries)


def test_spectator_endpoints(client):
    """Test spectator mode endpoints"""
    
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
    response = client.get("/spectator/player/nonexistent")
    assert response.status_code == 404


def test_authentication_errors(client):
    """Test authentication error scenarios"""
    
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
    
    # Logout first
    client.post("/auth/logout")
    
    # Try to submit score without auth
    response = client.post("/leaderboard/", json={
        "score": 1000,
        "mode": "walls"
    })
    # Should fail because no user is authenticated
    assert response.status_code == 401
