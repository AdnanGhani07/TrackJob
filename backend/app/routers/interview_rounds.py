from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.deps import get_db, get_current_user
from app.models.user import User
from app.models.application import Application
from app.models.interview_round import InterviewRound
from app.schemas.interview_round import (
    InterviewRoundCreate,
    InterviewRoundUpdate,
    InterviewRoundResponse,
)

router = APIRouter(tags=["Interview Rounds"])


@router.post("/applications/{application_id}/interview-rounds", response_model=InterviewRoundResponse, status_code=status.HTTP_201_CREATED)
def create_interview_round_for_application(
    application_id: int,
    round_in: InterviewRoundCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Schedule an interview round (phone, tech, system design, HR, behavioral) for an application."""
    app_record = db.get(Application, application_id)
    if not app_record or app_record.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Application with ID {application_id} not found.",
        )

    round_entry = InterviewRound(
        application_id=application_id,
        round_type=round_in.round_type,
        scheduled_date=round_in.scheduled_date,
        notes=round_in.notes,
        outcome=round_in.outcome,
    )
    db.add(round_entry)
    db.commit()
    db.refresh(round_entry)
    return round_entry


@router.get("/applications/{application_id}/interview-rounds", response_model=List[InterviewRoundResponse])
def list_interview_rounds_for_application(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all interview rounds for a specific application."""
    app_record = db.get(Application, application_id)
    if not app_record or app_record.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Application with ID {application_id} not found.",
        )

    stmt = select(InterviewRound).where(InterviewRound.application_id == application_id).order_by(InterviewRound.scheduled_date.asc())
    return db.scalars(stmt).all()


@router.patch("/interview-rounds/{round_id}", response_model=InterviewRoundResponse)
def update_interview_round(
    round_id: int,
    round_in: InterviewRoundUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update round date, notes, or outcome (pending -> passed/failed)."""
    round_entry = db.get(InterviewRound, round_id)
    if not round_entry or round_entry.application.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Interview round with ID {round_id} not found.",
        )

    update_data = round_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(round_entry, field, value)

    db.commit()
    db.refresh(round_entry)
    return round_entry


@router.delete("/interview-rounds/{round_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_interview_round(
    round_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete an interview round."""
    round_entry = db.get(InterviewRound, round_id)
    if not round_entry or round_entry.application.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Interview round with ID {round_id} not found.",
        )

    db.delete(round_entry)
    db.commit()
    return None
