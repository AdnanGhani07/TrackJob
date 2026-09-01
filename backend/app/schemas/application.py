from datetime import datetime, date
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field

from app.models.application import ApplicationStatus, ApplicationSource
from app.schemas.company import CompanyResponse


class ApplicationBase(BaseModel):
    role_title: str = Field(min_length=1, max_length=255)
    jd_text: Optional[str] = None
    status: ApplicationStatus = ApplicationStatus.APPLIED
    source: ApplicationSource = ApplicationSource.JOB_BOARD
    applied_date: Optional[date] = None
    resume_version: Optional[str] = Field(default=None, max_length=100)


class ApplicationCreate(ApplicationBase):
    company_id: int
    user_id: Optional[int] = None  # Optional for MVP / default user


class ApplicationUpdate(BaseModel):
    company_id: Optional[int] = None
    role_title: Optional[str] = Field(default=None, min_length=1, max_length=255)
    jd_text: Optional[str] = None
    status: Optional[ApplicationStatus] = None
    source: Optional[ApplicationSource] = None
    applied_date: Optional[date] = None
    resume_version: Optional[str] = Field(default=None, max_length=100)


class ApplicationResponse(ApplicationBase):
    id: int
    user_id: int
    company_id: int
    company: Optional[CompanyResponse] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
