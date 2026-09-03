import uuid

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_auth_flow():
    email = f"user_{uuid.uuid4().hex[:6]}@example.com"
    password = "SecurePassword123!"

    # 1. Register new user
    reg_res = client.post(
        "/auth/register",
        json={"email": email, "password": password},
    )
    assert reg_res.status_code == 201
    user_data = reg_res.json()
    assert user_data["email"] == email
    assert "id" in user_data
    assert "password_hash" not in user_data  # verify password_hash is omitted

    # 2. Duplicate registration fails
    dup_res = client.post(
        "/auth/register",
        json={"email": email, "password": password},
    )
    assert dup_res.status_code == 400

    # 3. Login with invalid password fails
    bad_login = client.post(
        "/auth/login",
        json={"email": email, "password": "WrongPassword!"},
    )
    assert bad_login.status_code == 401

    # 4. Login with correct credentials returns JWT token
    login_res = client.post(
        "/auth/login",
        json={"email": email, "password": password},
    )
    assert login_res.status_code == 200
    token_data = login_res.json()
    assert "access_token" in token_data
    assert token_data["token_type"] == "bearer"

    # 5. Access /auth/me with bearer token
    token = token_data["access_token"]
    me_res = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    assert me_res.json()["email"] == email
