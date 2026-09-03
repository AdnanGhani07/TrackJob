import uuid

import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


@pytest.fixture
def auth_headers():
    email = f"user_{uuid.uuid4().hex[:6]}@example.com"
    password = "TestPassword123!"
    reg_res = client.post("/auth/register", json={"email": email, "password": password})
    assert reg_res.status_code == 201

    login_res = client.post("/auth/login", json={"email": email, "password": password})
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_contacts_and_outreach_flow(auth_headers):
    uid = uuid.uuid4().hex[:6]
    # 1. Create company and application
    comp_res = client.post(
        "/companies", json={"name": f"Meta_{uid}"}, headers=auth_headers
    )
    assert comp_res.status_code == 201
    comp_id = comp_res.json()["id"]

    app_res = client.post(
        "/applications",
        json={"company_id": comp_id, "role_title": "Production Engineer"},
        headers=auth_headers,
    )
    assert app_res.status_code == 201
    app_id = app_res.json()["id"]

    # 2. Add Contact to Application
    contact_res = client.post(
        f"/applications/{app_id}/contacts",
        json={
            "name": "Sarah Connor",
            "relation": "referrer",
            "linkedin_url": "https://linkedin.com/in/sarahconnor",
            "last_contacted_date": "2026-08-30",
        },
        headers=auth_headers,
    )
    assert contact_res.status_code == 201
    contact_data = contact_res.json()
    contact_id = contact_data["id"]
    assert contact_data["name"] == "Sarah Connor"

    # 3. Log outreach to Contact
    outreach_res = client.post(
        f"/contacts/{contact_id}/outreach",
        json={
            "message_sent": "Hi Sarah, saw your post on Meta infra hiring! Would love to chat.",
            "response_received": False,
        },
        headers=auth_headers,
    )
    assert outreach_res.status_code == 201
    outreach_id = outreach_res.json()["id"]

    # 4. Update outreach response received status
    patch_outreach = client.patch(
        f"/outreach/{outreach_id}",
        json={"response_received": True},
        headers=auth_headers,
    )
    assert patch_outreach.status_code == 200
    assert patch_outreach.json()["response_received"] is True

    # 5. List contacts and outreach
    list_contacts = client.get(f"/applications/{app_id}/contacts", headers=auth_headers)
    assert list_contacts.status_code == 200
    assert len(list_contacts.json()) == 1

    list_outreach = client.get(f"/contacts/{contact_id}/outreach", headers=auth_headers)
    assert list_outreach.status_code == 200
    assert len(list_outreach.json()) == 1


def test_interview_rounds_flow(auth_headers):
    uid = uuid.uuid4().hex[:6]
    comp_res = client.post(
        "/companies", json={"name": f"Amazon_{uid}"}, headers=auth_headers
    )
    comp_id = comp_res.json()["id"]

    app_res = client.post(
        "/applications",
        json={"company_id": comp_id, "role_title": "SDE II"},
        headers=auth_headers,
    )
    app_id = app_res.json()["id"]

    # 1. Schedule Interview Round
    round_res = client.post(
        f"/applications/{app_id}/interview-rounds",
        json={
            "round_type": "tech",
            "scheduled_date": "2026-09-05T14:00:00Z",
            "notes": "System design & live coding in Python.",
            "outcome": "pending",
        },
        headers=auth_headers,
    )
    assert round_res.status_code == 201
    round_data = round_res.json()
    round_id = round_data["id"]
    assert round_data["round_type"] == "tech"
    assert round_data["outcome"] == "pending"

    # 2. Update Outcome to Passed
    patch_res = client.patch(
        f"/interview-rounds/{round_id}",
        json={"outcome": "passed", "notes": "Crushed the live coding part!"},
        headers=auth_headers,
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["outcome"] == "passed"

    # 3. List Interview Rounds
    rounds_res = client.get(
        f"/applications/{app_id}/interview-rounds", headers=auth_headers
    )
    assert rounds_res.status_code == 200
    assert len(rounds_res.json()) == 1
