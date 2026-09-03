from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field


class OutreachLogBase(BaseModel):
    message_sent: str = Field(min_length=1)
    date_sent: date | None = None
    response_received: bool = False


class OutreachLogCreate(OutreachLogBase):
    pass


class OutreachLogUpdate(BaseModel):
    message_sent: str | None = Field(default=None, min_length=1)
    date_sent: date | None = None
    response_received: bool | None = None


class OutreachLogResponse(OutreachLogBase):
    id: int
    contact_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
