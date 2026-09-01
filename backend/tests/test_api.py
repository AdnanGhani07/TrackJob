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


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "TrackJob" in data["project"]


def test_companies_crud(auth_headers):
    uid = uuid.uuid4().hex[:6]
    company_name = f"TestCorp_{uid}"

    # 1. Create company
    create_res = client.post(
        "/companies",
        json={"name": company_name, "industry": "FinTech", "notes": "Target for backend role"},
        headers=auth_headers,
    )
    assert create_res.status_code == 201
    company_data = create_res.json()
    company_id = company_data["id"]
    assert company_data["name"] == company_name

    # 2. Duplicate company check (should fail with 400)
    dup_res = client.post("/companies", json={"name": company_name}, headers=auth_headers)
    assert dup_res.status_code == 400

    # 3. List companies
    list_res = client.get("/companies", headers=auth_headers)
    assert list_res.status_code == 200
    assert any(c["id"] == company_id for c in list_res.json())

    # 4. Update company
    update_res = client.patch(
        f"/companies/{company_id}",
        json={"notes": "Updated notes"},
        headers=auth_headers,
    )
    assert update_res.status_code == 200
    assert update_res.json()["notes"] == "Updated notes"

    # 5. Cleanup
    del_res = client.delete(f"/companies/{company_id}", headers=auth_headers)
    assert del_res.status_code == 204


def test_applications_crud(auth_headers):
    uid = uuid.uuid4().hex[:6]
    company_name = f"AppTestCorp_{uid}"

    # 1. Create dedicated company for test
    company_res = client.post(
        "/companies",
        json={"name": company_name, "industry": "Tech"},
        headers=auth_headers,
    )
    assert company_res.status_code == 201
    company_id = company_res.json()["id"]

    # 2. Create application
    role_name = f"Backend Engineer {uid}"
    app_res = client.post(
        "/applications",
        json={
            "company_id": company_id,
            "role_title": role_name,
            "jd_text": "Requirements: FastAPI, PostgreSQL, Distributed Systems.",
            "status": "Applied",
            "source": "referral",
            "applied_date": "2026-08-30",
            "resume_version": "v2.1_backend",
        },
        headers=auth_headers,
    )
    assert app_res.status_code == 201
    app_data = app_res.json()
    app_id = app_data["id"]
    assert app_data["role_title"] == role_name
    assert app_data["company"]["name"] == company_name

    # 3. Filter applications by status
    filter_res = client.get("/applications?status=Applied", headers=auth_headers)
    assert filter_res.status_code == 200
    apps = filter_res.json()
    assert len(apps) >= 1
    assert any(a["id"] == app_id for a in apps)

    # 4. Patch application status
    patch_res = client.patch(
        f"/applications/{app_id}",
        json={"status": "Interview"},
        headers=auth_headers,
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["status"] == "Interview"

    # 5. Get application details
    get_res = client.get(f"/applications/{app_id}", headers=auth_headers)
    assert get_res.status_code == 200
    assert get_res.json()["status"] == "Interview"

    # 6. Cleanup
    del_res = client.delete(f"/applications/{app_id}", headers=auth_headers)
    assert del_res.status_code == 204
    client.delete(f"/companies/{company_id}", headers=auth_headers)
