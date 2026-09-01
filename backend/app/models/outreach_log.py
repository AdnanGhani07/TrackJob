from datetime import datetime, date, timezone
from typing import TYPE_CHECKING
from sqlalchemy import (
    Text,
    Date,
    DateTime,
    Boolean,
    ForeignKey,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base

if TYPE_CHECKING:
    from app.models.contact import Contact


class OutreachLog(Base):
    __tablename__ = "outreach_logs"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    contact_id: Mapped[int] = mapped_column(
        ForeignKey("contacts.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    message_sent: Mapped[str] = mapped_column(Text, nullable=False)
    date_sent: Mapped[date] = mapped_column(Date, nullable=False, default=date.today)
    response_received: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    contact: Mapped["Contact"] = relationship("Contact", back_populates="outreach_logs")

    def __repr__(self) -> str:
        return f"<OutreachLog id={self.id} contact_id={self.contact_id} response_received={self.response_received}>"
