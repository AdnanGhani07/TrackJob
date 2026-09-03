from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.deps import get_current_user, get_db
from app.models.contact import Contact
from app.models.outreach_log import OutreachLog
from app.models.user import User
from app.schemas.outreach import (
    OutreachLogCreate,
    OutreachLogResponse,
    OutreachLogUpdate,
)

router = APIRouter(tags=["Outreach"])


@router.post(
    "/contacts/{contact_id}/outreach",
    response_model=OutreachLogResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_outreach_log_for_contact(
    contact_id: int,
    outreach_in: OutreachLogCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Log an outreach message (LinkedIn DM, email, coffee chat) sent to a contact."""
    contact = db.get(Contact, contact_id)
    if not contact or contact.application.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Contact with ID {contact_id} not found.",
        )

    outreach = OutreachLog(
        contact_id=contact_id,
        message_sent=outreach_in.message_sent,
        date_sent=outreach_in.date_sent or date.today(),
        response_received=outreach_in.response_received,
    )
    db.add(outreach)
    db.commit()
    db.refresh(outreach)
    return outreach


@router.get("/contacts/{contact_id}/outreach", response_model=list[OutreachLogResponse])
def list_outreach_for_contact(
    contact_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all outreach log entries for a contact."""
    contact = db.get(Contact, contact_id)
    if not contact or contact.application.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Contact with ID {contact_id} not found.",
        )

    stmt = (
        select(OutreachLog)
        .where(OutreachLog.contact_id == contact_id)
        .order_by(OutreachLog.date_sent.desc())
    )
    return db.scalars(stmt).all()


@router.patch("/outreach/{outreach_id}", response_model=OutreachLogResponse)
def update_outreach_log(
    outreach_id: int,
    outreach_in: OutreachLogUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update outreach entry (e.g., mark response_received = True)."""
    outreach = db.get(OutreachLog, outreach_id)
    if not outreach or outreach.contact.application.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Outreach log entry with ID {outreach_id} not found.",
        )

    update_data = outreach_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(outreach, field, value)

    db.commit()
    db.refresh(outreach)
    return outreach


@router.delete("/outreach/{outreach_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_outreach_log(
    outreach_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete an outreach log entry."""
    outreach = db.get(OutreachLog, outreach_id)
    if not outreach or outreach.contact.application.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Outreach log entry with ID {outreach_id} not found.",
        )

    db.delete(outreach)
    db.commit()
