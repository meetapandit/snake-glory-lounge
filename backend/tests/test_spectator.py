def test_get_active_players(client):
    response = client.get("/spectator/active")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    assert len(response.json()) > 0

def test_get_player_game_state(client):
    # Get an active player ID
    response = client.get("/spectator/active")
    player_id = response.json()[0]["id"]

    # Get game state
    response = client.get(f"/spectator/player/{player_id}")
    assert response.status_code == 200
    assert "snake" in response.json()
    assert "score" in response.json()

def test_get_nonexistent_player(client):
    response = client.get("/spectator/player/nonexistent")
    assert response.status_code == 404
