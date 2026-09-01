from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict


class PrepQuestionItem(BaseModel):
    question: str
    category: str = "Technical"
    tips: Optional[str] = None
    answer: Optional[str] = None
    explanation: Optional[str] = None
    sample_code: Optional[str] = None


class PrepBulletItem(BaseModel):
    bullet: str
    keyword_match: Optional[str] = None


class AIPrepNotesBase(BaseModel):
    generated_questions: List[PrepQuestionItem]
    suggested_bullets: List[PrepBulletItem]
    model_used: str


class AIPrepNotesResponse(AIPrepNotesBase):
    id: int
    application_id: int
    generated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class GenerateAIPrepRequest(BaseModel):
    custom_instructions: Optional[str] = None
    round_type: Optional[str] = None
    round_notes: Optional[str] = None
    force_refresh: bool = False
