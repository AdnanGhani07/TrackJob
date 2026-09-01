from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class CompanyBase(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    industry: Optional[str] = Field(default=None, max_length=100)
    notes: Optional[str] = None


class CompanyCreate(CompanyBase):
    pass


class CompanyUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=255)
    industry: Optional[str] = Field(default=None, max_length=100)
    notes: Optional[str] = None


class CompanyResponse(CompanyBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
