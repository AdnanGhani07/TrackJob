import uuid
from unittest.mock import AsyncMock, patch

import pytest
from fastapi import status
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


@pytest.mark.asyncio
async def test_ai_prep_notes_flow(auth_headers):
    uid = uuid.uuid4().hex[:6]
    # 1. Create a Company
    company_resp = client.post(
        "/companies",
        json={"name": f"AI Tech Corp {uid}", "industry": "Artificial Intelligence"},
        headers=auth_headers,
    )
    company_id = company_resp.json()["id"]

    # 2. Create Application with JD Text
    app_resp = client.post(
        "/applications",
        json={
            "company_id": company_id,
            "role_title": "AI Backend Engineer",
            "jd_text": "We are seeking a Backend Engineer with expertise in Python, FastAPI, and LLM integrations. Experience with PostgreSQL and async architecture is required.",
            "source": "referral",
        },
        headers=auth_headers,
    )
    assert app_resp.status_code == status.HTTP_201_CREATED
    app_id = app_resp.json()["id"]

    # 3. Mock AIService generate_interview_prep response
    mock_ai_output = {
        "generated_questions": [
            {
                "question": "How do you design a high-throughput async pipeline for streaming LLM tokens in FastAPI?",
                "category": "Technical",
                "tips": "Discuss Server-Sent Events (SSE), WebSockets, and asyncio queue buffering.",
            },
            {
                "question": "Describe an architectural decision where you optimized relational queries with PostgreSQL indexing.",
                "category": "System Design",
                "tips": "Cover composite indexes, query execution plans (EXPLAIN ANALYZE), and connection pooling.",
            },
        ],
        "suggested_bullets": [
            {
                "bullet": "Architected async FastAPI microservices handling 5,000+ RPS with sub-50ms latency using PostgreSQL connection pooling.",
                "keyword_match": "FastAPI, PostgreSQL, Async Architecture",
            }
        ],
        "model_used": "gemini-3.7-flash",
    }

    with patch(
        "app.services.ai_service.AIService.generate_interview_prep",
        new_callable=AsyncMock,
    ) as mock_ai:
        mock_ai.return_value = mock_ai_output

        # Generate Prep Notes
        gen_resp = client.post(
            f"/applications/{app_id}/ai/prep-notes", headers=auth_headers
        )
        assert gen_resp.status_code == status.HTTP_201_CREATED
        gen_data = gen_resp.json()
        assert len(gen_data["generated_questions"]) == 2
        assert gen_data["generated_questions"][0]["category"] == "Technical"
        assert gen_data["model_used"] == "gemini-3.7-flash"

        # 4. Fetch Cached Prep Notes (without calling AI service again)
        get_resp = client.get(
            f"/applications/{app_id}/ai/prep-notes", headers=auth_headers
        )
        assert get_resp.status_code == status.HTTP_200_OK
        assert get_resp.json()["id"] == gen_data["id"]

        # 5. Delete Prep Notes
        del_resp = client.delete(
            f"/applications/{app_id}/ai/prep-notes", headers=auth_headers
        )
        assert del_resp.status_code == status.HTTP_204_NO_CONTENT

        # 6. Verify 404 after deletion
        get_after_del = client.get(
            f"/applications/{app_id}/ai/prep-notes", headers=auth_headers
        )
        assert get_after_del.status_code == status.HTTP_404_NOT_FOUND
