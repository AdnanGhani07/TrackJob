from datetime import datetime

from pydantic import BaseModel, ConfigDict


class PrepQuestionItem(BaseModel):
    question: str
    category: str = "Technical"
    tips: str | None = None
    answer: str | None = None
    explanation: str | None = None
    sample_code: str | None = None


class PrepBulletItem(BaseModel):
    bullet: str
    keyword_match: str | None = None


class AIPrepNotesBase(BaseModel):
    generated_questions: list[PrepQuestionItem]
    suggested_bullets: list[PrepBulletItem]
    model_used: str


class AIPrepNotesResponse(AIPrepNotesBase):
    id: int
    application_id: int
    generated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class GenerateAIPrepRequest(BaseModel):
    custom_instructions: str | None = None
    round_type: str | None = None
    round_notes: str | None = None
    force_refresh: bool = False
