from datetime import datetime, date
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field

from app.models.contact import ContactRelation


class ContactBase(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    relation: ContactRelation = ContactRelation.REFERRER
    linkedin_url: Optional[str] = Field(default=None, max_length=500)
    last_contacted_date: Optional[date] = None


class ContactCreate(ContactBase):
    pass


class ContactUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=255)
    relation: Optional[ContactRelation] = None
    linkedin_url: Optional[str] = Field(default=None, max_length=500)
    last_contacted_date: Optional[date] = None


class ContactResponse(ContactBase):
    id: int
    application_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
