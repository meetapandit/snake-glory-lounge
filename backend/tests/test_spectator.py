from app.db_models import ActivePlayerModel, UserModel, GameModeEnum
from datetime import datetime

def test_get_active_players(client, db_session):
    # Seed user
    user = UserModel(username="player1", email="p1@test.com", password_hash="hash")
    db_session.add(user)
    db_session.commit()
    
    # Seed active player
    active_player = ActivePlayerModel(
        user_id=user.id,
        username=user.username,
        score=100,
        mode=GameModeEnum.PASS_THROUGH,
        game_state={
            "snake": [], 
            "score": 100,
            "food": {"x": 5, "y": 5},
            "direction": "RIGHT",
            "status": "playing",
            "mode": "pass-through",
            "speed": 100
        },
        updated_at=datetime.utcnow()
    )
    db_session.add(active_player)
    db_session.commit()

    response = client.get("/spectator/active")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    assert len(response.json()) > 0
    assert response.json()[0]["username"] == "player1"

def test_get_player_game_state(client, db_session):
    # Seed user
    user = UserModel(username="player2", email="p2@test.com", password_hash="hash")
    db_session.add(user)
    db_session.commit()
    
    # Seed active player
    active_player = ActivePlayerModel(
        user_id=user.id,
        username=user.username,
        score=200,
        mode=GameModeEnum.WALLS,
        game_state={
            "snake": [{"x": 10, "y": 10}], 
            "score": 200,
            "food": {"x": 5, "y": 5},
            "direction": "UP",
            "status": "playing",
            "mode": "walls",
            "speed": 150
        },
        updated_at=datetime.utcnow()
    )
    db_session.add(active_player)
    db_session.commit()

    # Get game state
    response = client.get(f"/spectator/player/{active_player.id}")
    assert response.status_code == 200
    assert "snake" in response.json()
    assert response.json()["score"] == 200

def test_get_nonexistent_player(client):
    response = client.get("/spectator/player/999999")
    assert response.status_code == 404
