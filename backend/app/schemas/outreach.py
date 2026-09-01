from datetime import datetime, date
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class OutreachLogBase(BaseModel):
    message_sent: str = Field(min_length=1)
    date_sent: Optional[date] = None
    response_received: bool = False


class OutreachLogCreate(OutreachLogBase):
    pass


class OutreachLogUpdate(BaseModel):
    message_sent: Optional[str] = Field(default=None, min_length=1)
    date_sent: Optional[date] = None
    response_received: Optional[bool] = None


class OutreachLogResponse(OutreachLogBase):
    id: int
    contact_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
