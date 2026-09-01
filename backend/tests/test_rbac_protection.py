import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_unauthenticated_endpoints_rejected():
    """Verify that protected routes return 401 Unauthorized when no JWT token is provided."""
    # Applications
    assert client.get("/applications").status_code == 401
    assert client.post("/applications", json={"company_id": 1, "role_title": "Dev"}).status_code == 401
    assert client.get("/applications/1").status_code == 401
    assert client.patch("/applications/1", json={"status": "Offer"}).status_code == 401
    assert client.delete("/applications/1").status_code == 401

    # Companies
    assert client.get("/companies").status_code == 401
    assert client.post("/companies", json={"name": "Acme"}).status_code == 401
    assert client.get("/companies/1").status_code == 401
    assert client.patch("/companies/1", json={"name": "Acme Inc"}).status_code == 401
    assert client.delete("/companies/1").status_code == 401

    # Contacts
    assert client.get("/applications/1/contacts").status_code == 401
    assert client.post("/applications/1/contacts", json={"name": "John"}).status_code == 401
    assert client.patch("/contacts/1", json={"name": "John Doe"}).status_code == 401
    assert client.delete("/contacts/1").status_code == 401

    # Outreach
    assert client.get("/contacts/1/outreach").status_code == 401
    assert client.post("/contacts/1/outreach", json={"message_sent": "Hello"}).status_code == 401
    assert client.patch("/outreach/1", json={"response_received": True}).status_code == 401
    assert client.delete("/outreach/1").status_code == 401

    # Interview Rounds
    assert client.get("/applications/1/interview-rounds").status_code == 401
    assert client.post("/applications/1/interview-rounds", json={"scheduled_date": "2026-09-01T00:00:00Z"}).status_code == 401
    assert client.patch("/interview-rounds/1", json={"outcome": "passed"}).status_code == 401
    assert client.delete("/interview-rounds/1").status_code == 401

    # Auth Me
    assert client.get("/auth/me").status_code == 401
