from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.application import ApplicationSource, ApplicationStatus
from app.schemas.company import CompanyResponse


class ApplicationBase(BaseModel):
    role_title: str = Field(min_length=1, max_length=255)
    jd_text: str | None = None
    status: ApplicationStatus = ApplicationStatus.APPLIED
    source: ApplicationSource = ApplicationSource.JOB_BOARD
    applied_date: date | None = None
    resume_version: str | None = Field(default=None, max_length=100)


class ApplicationCreate(ApplicationBase):
    company_id: int
    user_id: int | None = None  # Optional for MVP / default user


class ApplicationUpdate(BaseModel):
    company_id: int | None = None
    role_title: str | None = Field(default=None, min_length=1, max_length=255)
    jd_text: str | None = None
    status: ApplicationStatus | None = None
    source: ApplicationSource | None = None
    applied_date: date | None = None
    resume_version: str | None = Field(default=None, max_length=100)


class ApplicationResponse(ApplicationBase):
    id: int
    user_id: int
    company_id: int
    company: CompanyResponse | None = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
