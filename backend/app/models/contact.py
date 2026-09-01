import enum
from datetime import datetime, date, timezone
from typing import List, Optional, TYPE_CHECKING
from sqlalchemy import (
    String,
    Date,
    DateTime,
    ForeignKey,
    Enum as SQLEnum,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base

if TYPE_CHECKING:
    from app.models.application import Application
    from app.models.outreach_log import OutreachLog


class ContactRelation(str, enum.Enum):
    ALUM = "alum"
    REFERRER = "referrer"
    RECRUITER = "recruiter"
    OTHER = "other"


class Contact(Base):
    __tablename__ = "contacts"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    application_id: Mapped[int] = mapped_column(
        ForeignKey("applications.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    relation: Mapped[ContactRelation] = mapped_column(
        SQLEnum(ContactRelation, name="contact_relation_enum", native_enum=False),
        default=ContactRelation.REFERRER,
        nullable=False,
    )
    linkedin_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    last_contacted_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    application: Mapped["Application"] = relationship("Application", back_populates="contacts")
    outreach_logs: Mapped[List["OutreachLog"]] = relationship(
        "OutreachLog",
        back_populates="contact",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return f"<Contact id={self.id} name={self.name} relation={self.relation}>"
