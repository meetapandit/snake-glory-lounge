def test_signup_login_flow(client):
    # Signup
    signup_data = {
        "username": "testuser",
        "email": "test@example.com",
        "password": "password123"
    }
    response = client.post("/auth/signup", json=signup_data)
    assert response.status_code == 200
    assert response.json()["success"] == True
    assert response.json()["user"]["email"] == "test@example.com"

    # Login
    login_data = {
        "email": "test@example.com",
        "password": "password123"
    }
    response = client.post("/auth/login", json=login_data)
    assert response.status_code == 200
    assert response.json()["success"] == True
    assert response.json()["user"]["username"] == "testuser"

    # Get Current User
    response = client.get("/auth/me")
    assert response.status_code == 200
    assert response.json()["email"] == "test@example.com"

    # Logout
    response = client.post("/auth/logout")
    assert response.status_code == 200

    # Verify Logout
    response = client.get("/auth/me")
    assert response.status_code == 401

def test_login_invalid_credentials(client):
    login_data = {
        "email": "nonexistent@example.com",
        "password": "wrongpassword"
    }
    response = client.post("/auth/login", json=login_data)
    assert response.status_code == 200
    assert response.json()["success"] == False
    assert response.json()["error"] == "User not found"
