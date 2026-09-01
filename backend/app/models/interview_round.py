import enum
from datetime import datetime, timezone
from typing import Optional, TYPE_CHECKING
from sqlalchemy import (
    Text,
    DateTime,
    ForeignKey,
    Enum as SQLEnum,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base

if TYPE_CHECKING:
    from app.models.application import Application


class RoundType(str, enum.Enum):
    PHONE_SCREEN = "phone_screen"
    TECH = "tech"
    SYSTEM_DESIGN = "system_design"
    HR = "hr"
    BEHAVIORAL = "behavioral"


class RoundOutcome(str, enum.Enum):
    PENDING = "pending"
    PASSED = "passed"
    FAILED = "failed"


class InterviewRound(Base):
    __tablename__ = "interview_rounds"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    application_id: Mapped[int] = mapped_column(
        ForeignKey("applications.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    round_type: Mapped[RoundType] = mapped_column(
        SQLEnum(RoundType, name="round_type_enum", native_enum=False),
        default=RoundType.PHONE_SCREEN,
        nullable=False,
    )
    scheduled_date: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    outcome: Mapped[RoundOutcome] = mapped_column(
        SQLEnum(RoundOutcome, name="round_outcome_enum", native_enum=False),
        default=RoundOutcome.PENDING,
        nullable=False,
    )
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    application: Mapped["Application"] = relationship("Application", back_populates="interview_rounds")

    def __repr__(self) -> str:
        return f"<InterviewRound id={self.id} type={self.round_type} outcome={self.outcome}>"
