from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.interview_round import RoundOutcome, RoundType


class InterviewRoundBase(BaseModel):
    round_type: RoundType = RoundType.PHONE_SCREEN
    scheduled_date: datetime
    notes: str | None = None
    outcome: RoundOutcome = RoundOutcome.PENDING


class InterviewRoundCreate(InterviewRoundBase):
    pass


class InterviewRoundUpdate(BaseModel):
    round_type: RoundType | None = None
    scheduled_date: datetime | None = None
    notes: str | None = None
    outcome: RoundOutcome | None = None


class InterviewRoundResponse(InterviewRoundBase):
    id: int
    application_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
