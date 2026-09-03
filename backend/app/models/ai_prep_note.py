from datetime import datetime, timezone

from sqlalchemy import JSON, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.models.base import Base


class AIPrepNote(Base):
    __tablename__ = "ai_prep_notes"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(
        Integer,
        ForeignKey("applications.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )

    # JSON structure: list of {"question": str, "category": str, "tips": str}
    generated_questions = Column(JSON, nullable=False, default=list)

    # JSON structure: list of {"bullet": str, "keyword_match": str}
    suggested_bullets = Column(JSON, nullable=False, default=list)

    model_used = Column(String(100), nullable=False, default="gemini-3.7-flash")
    generated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    application = relationship("Application", back_populates="ai_prep_note")
