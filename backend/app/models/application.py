import enum
from datetime import date, datetime, timezone
from typing import TYPE_CHECKING

from sqlalchemy import (
    Date,
    DateTime,
    ForeignKey,
    Index,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy import (
    Enum as SQLEnum,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base

if TYPE_CHECKING:
    from app.models.company import Company
    from app.models.contact import Contact
    from app.models.interview_round import InterviewRound
    from app.models.user import User


class ApplicationStatus(str, enum.Enum):
    APPLIED = "Applied"
    REFERRAL = "Referral"
    INTERVIEW = "Interview"
    OFFER = "Offer"
    REJECTED = "Rejected"


class ApplicationSource(str, enum.Enum):
    REFERRAL = "referral"
    COLD = "cold"
    JOB_BOARD = "job_board"


class Application(Base):
    __tablename__ = "applications"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    company_id: Mapped[int] = mapped_column(
        ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True
    )
    role_title: Mapped[str] = mapped_column(String(255), nullable=False)
    jd_text: Mapped[str | None] = mapped_column(Text, nullable=True)

    status: Mapped[ApplicationStatus] = mapped_column(
        SQLEnum(ApplicationStatus, name="application_status_enum", native_enum=False),
        default=ApplicationStatus.APPLIED,
        nullable=False,
        index=True,
    )
    source: Mapped[ApplicationSource] = mapped_column(
        SQLEnum(ApplicationSource, name="application_source_enum", native_enum=False),
        default=ApplicationSource.JOB_BOARD,
        nullable=False,
    )
    applied_date: Mapped[date | None] = mapped_column(Date, nullable=True, index=True)
    resume_version: Mapped[str | None] = mapped_column(String(100), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="applications")
    company: Mapped["Company"] = relationship("Company", back_populates="applications")
    contacts: Mapped[list["Contact"]] = relationship(
        "Contact",
        back_populates="application",
        cascade="all, delete-orphan",
    )
    interview_rounds: Mapped[list["InterviewRound"]] = relationship(
        "InterviewRound",
        back_populates="application",
        cascade="all, delete-orphan",
    )
    ai_prep_note = relationship(
        "AIPrepNote",
        back_populates="application",
        uselist=False,
        cascade="all, delete-orphan",
    )

    __table_args__ = (
        UniqueConstraint(
            "user_id", "company_id", "role_title", name="uq_user_company_role"
        ),
        Index("ix_applications_status_applied_date", "status", "applied_date"),
    )

    def __repr__(self) -> str:
        return f"<Application id={self.id} role={self.role_title} status={self.status}>"
