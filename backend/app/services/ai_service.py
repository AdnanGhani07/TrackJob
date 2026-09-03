import json
import logging
from typing import Any

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)

PREP_SYSTEM_PROMPT = """You are an elite technical interviewer and staff software architect.
Your task is to analyze the target Role Title, Company Name, and Job Description (JD) to generate high-yield, deeply practical interview preparation material.

STRICT ROLE-GROUNDING RULES:
1. Ground questions strictly in the TARGET ROLE TITLE first and foremost. For example, if the role is 'Full Stack Developer' or 'Backend Engineer', generate questions on web architecture, APIs, databases, async processing, React/Next.js state management, and caching — DO NOT drift into generic Machine Learning / Data Science research unless the JD explicitly asks for ML engineering.
2. If the provided Job Description is short or minimal, derive industry-standard, realistic technical expectations for that specific Role Title at modern tech companies.
3. For Technical questions, explain real-world mechanisms, database locking, memory management, or protocol internals with concrete code/SQL examples.
4. For System Design questions, cover scalability, distributed caching (Redis), data sharding, idempotency, and fault tolerance.
5. For Behavioral questions, format the model answer strictly using the STAR methodology (Situation, Task, Action, Result) with quantified accomplishments.

You MUST respond strictly with a valid JSON object adhering to this exact schema:
{
  "likely_questions": [
    {
      "question": "The specific technical or behavioral interview question likely to be asked",
      "category": "Technical | System Design | Behavioral",
      "tips": "Quick tactical talking points, key buzzwords, or STAR method highlights.",
      "answer": "A comprehensive, high-scoring model answer that the candidate can deliver directly to the interviewer.",
      "explanation": "In-depth technical background, architectural tradeoffs, why this pattern is preferred, edge cases, and common pitfalls to avoid.",
      "sample_code": "Concise code snippet, SQL query, or pseudocode illustrating the solution (if applicable, else empty string)."
    }
  ],
  "suggested_bullets": [
    {
      "bullet": "Strong action-driven resume bullet point matching the JD requirements with quantifiable metrics",
      "keyword_match": "The core technical skills or requirements matched (e.g. React, TypeScript, FastAPI, PostgreSQL)"
    }
  ]
}

Guidelines:
1. Provide 5 to 7 high-yield, realistic questions strictly relevant to the Role Title.
2. For EVERY question, write a complete, articulate 'answer' and a deep-dive 'explanation' discussing trade-offs, bottlenecks, or STAR outcomes.
3. For Technical / System Design questions, provide clean, multi-line 'sample_code' with proper newline (\\n) characters and standard indentation — NEVER compress code into a single unreadable line.
4. Provide 3 to 4 tailored resume accomplishment bullets formatted with strong action verbs and quantified impact.
5. Return ONLY the raw JSON object. Do not include markdown ticks (```json) or introductory commentary.
"""


class AIService:
    @classmethod
    async def generate_interview_prep(
        cls,
        role_title: str,
        company_name: str,
        jd_text: str,
        round_type: str | None = None,
        round_notes: str | None = None,
        custom_instructions: str | None = None,
    ) -> dict[str, Any]:
        """
        Generates structured interview questions and resume bullets using Google Gemini 3.7 Flash
        or falls back to local Ollama if no Gemini API key is configured.
        """
        user_prompt = f"""Target Company: {company_name}
Target Role: {role_title}

Job Description:
{jd_text}
"""
        if round_type:
            round_labels = {
                "phone_screen": "Initial Recruiter / Phone Screen (Background, elevator pitch, high-level fit)",
                "tech": "Technical Coding & Algorithm Round (Data structures, concurrency, live coding, query optimization)",
                "system_design": "System Design Architecture Round (High-scale distributed systems, caching, sharding, fault tolerance)",
                "hr": "HR / Culture Fit Round (Company values, compensation expectations, team dynamics)",
                "behavioral": "Behavioral Leadership Round (STAR format: conflict resolution, tough projects, cross-functional collaboration)",
            }
            round_desc = round_labels.get(round_type.lower(), round_type)
            user_prompt += f"\nTarget Interview Round: {round_desc}\nIMPORTANT: Heavily tailor 80%+ of the questions specifically to excel in this specific round!\n"

        if round_notes:
            user_prompt += f"Interviewer / Round Directives: {round_notes}\n"

        if custom_instructions:
            user_prompt += f"\nAdditional Candidate Focus: {custom_instructions}\n"

        # 1. Try Google Gemini API if API key is provided
        if settings.GEMINI_API_KEY and settings.GEMINI_API_KEY.strip():
            try:
                return await cls._generate_with_gemini(user_prompt)
            except Exception as e:
                logger.warning(
                    f"Gemini generation failed: {e}. Attempting Ollama fallback..."
                )

        # 2. Fallback to Local Ollama
        return await cls._generate_with_ollama(user_prompt)

    @classmethod
    async def _generate_with_gemini(cls, user_prompt: str) -> dict[str, Any]:
        """Calls Google Gemini Generative Language API directly via async HTTP with structured JSON output."""
        model_name = settings.GEMINI_MODEL or "gemini-2.5-flash"
        # Standardize model identifier
        clean_model = (
            model_name
            if not model_name.startswith("models/")
            else model_name.replace("models/", "")
        )

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{clean_model}:generateContent?key={settings.GEMINI_API_KEY}"

        payload = {
            "system_instruction": {"parts": [{"text": PREP_SYSTEM_PROMPT}]},
            "contents": [{"role": "user", "parts": [{"text": user_prompt}]}],
            "generationConfig": {
                "response_mime_type": "application/json",
                "temperature": 0.4,
            },
        }

        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(url, json=payload)
            if resp.status_code != 200:
                raise RuntimeError(
                    f"Gemini API returned status {resp.status_code}: {resp.text}"
                )

            data = resp.json()
            candidates = data.get("candidates", [])
            if not candidates:
                raise RuntimeError("Gemini API returned empty candidates.")

            text = candidates[0]["content"]["parts"][0]["text"].strip()

            # Clean possible markdown wrapping
            text = text.removeprefix("```json")
            text = text.removeprefix("```")
            text = text.removesuffix("```")
            text = text.strip()

            try:
                parsed = json.loads(text)
            except Exception:
                # Fallback for unescaped backslashes in code snippets (e.g. \n, \t, regexes)
                parsed = json.loads(text, strict=False)

            return {
                "generated_questions": parsed.get("likely_questions", []),
                "suggested_bullets": parsed.get("suggested_bullets", []),
                "model_used": model_name,
            }

    @classmethod
    async def _generate_with_ollama(cls, user_prompt: str) -> dict[str, Any]:
        """Calls local Ollama daemon with JSON format constraint."""
        url = f"{settings.OLLAMA_BASE_URL.rstrip('/')}/api/generate"
        payload = {
            "model": settings.OLLAMA_MODEL,
            "system": PREP_SYSTEM_PROMPT,
            "prompt": user_prompt,
            "stream": False,
            "format": "json",
            "options": {
                "temperature": 0.4,
            },
        }

        try:
            async with httpx.AsyncClient(timeout=120.0) as client:
                resp = await client.post(url, json=payload)
                if resp.status_code != 200:
                    raise RuntimeError(
                        f"Ollama returned status {resp.status_code}: {resp.text}"
                    )

                result = resp.json()
                raw_response = result.get("response", "{}")
                parsed = json.loads(raw_response)

                return {
                    "generated_questions": parsed.get("likely_questions", []),
                    "suggested_bullets": parsed.get("suggested_bullets", []),
                    "model_used": f"ollama/{settings.OLLAMA_MODEL}",
                }
        except httpx.ConnectError:
            raise RuntimeError(
                "Neither GEMINI_API_KEY is configured nor is local Ollama running. "
                "Please add a GEMINI_API_KEY to your .env or start Ollama at http://localhost:11434."
            )
        except Exception as e:
            raise RuntimeError(f"AI Generation failed: {e!s}")
