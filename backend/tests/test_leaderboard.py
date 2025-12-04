def test_get_leaderboard(client):
    response = client.get("/leaderboard")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    assert len(response.json()) > 0

def test_get_leaderboard_filtered(client):
    response = client.get("/leaderboard?mode=walls")
    assert response.status_code == 200
    entries = response.json()
    assert all(entry["mode"] == "walls" for entry in entries)

def test_submit_score(client):
    # First login
    signup_data = {
        "username": "scorer",
        "email": "scorer@example.com",
        "password": "password123"
    }
    client.post("/auth/signup", json=signup_data)

    # Submit score
    score_data = {
        "score": 5000,
        "mode": "walls"
    }
    response = client.post("/leaderboard/", json=score_data)
    assert response.status_code == 200
    assert response.json() == True

    # Verify score in leaderboard
    response = client.get("/leaderboard?mode=walls")
    entries = response.json()
    assert entries[0]["score"] == 5000
    assert entries[0]["username"] == "scorer"
