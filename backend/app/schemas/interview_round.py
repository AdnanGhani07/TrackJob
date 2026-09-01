from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field

from app.models.interview_round import RoundType, RoundOutcome


class InterviewRoundBase(BaseModel):
    round_type: RoundType = RoundType.PHONE_SCREEN
    scheduled_date: datetime
    notes: Optional[str] = None
    outcome: RoundOutcome = RoundOutcome.PENDING


class InterviewRoundCreate(InterviewRoundBase):
    pass


class InterviewRoundUpdate(BaseModel):
    round_type: Optional[RoundType] = None
    scheduled_date: Optional[datetime] = None
    notes: Optional[str] = None
    outcome: Optional[RoundOutcome] = None


class InterviewRoundResponse(InterviewRoundBase):
    id: int
    application_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
