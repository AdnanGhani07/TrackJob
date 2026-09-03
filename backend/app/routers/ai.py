from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.deps import get_current_user, get_db
from app.models.ai_prep_note import AIPrepNote
from app.models.application import Application
from app.models.user import User
from app.schemas.ai import AIPrepNotesResponse, GenerateAIPrepRequest
from app.services.ai_service import AIService

router = APIRouter(
    prefix="/applications/{application_id}/ai", tags=["AI Interview Prep"]
)


@router.post(
    "/prep-notes",
    response_model=AIPrepNotesResponse,
    status_code=status.HTTP_201_CREATED,
)
async def generate_or_refresh_prep_notes(
    application_id: int,
    request: GenerateAIPrepRequest = GenerateAIPrepRequest(),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Generates tailored interview questions and resume bullets using Google Gemini 3.7 Flash
    or local Ollama based on the application's Job Description.
    """
    # 1. Verify Application Ownership
    stmt = select(Application).where(
        Application.id == application_id,
        Application.user_id == current_user.id,
    )
    application = db.scalars(stmt).first()
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found",
        )

    if not application.jd_text or not application.jd_text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot generate prep notes: Job Description (JD) text is empty for this application. Please update the application with a Job Description first.",
        )

    # 2. Check existing prep notes if force_refresh is False
    existing_stmt = select(AIPrepNote).where(
        AIPrepNote.application_id == application_id
    )
    existing_note = db.scalars(existing_stmt).first()

    if existing_note and not request.force_refresh:
        return existing_note

    # 3. Call AI Service
    company_name = application.company.name if application.company else "Target Company"
    try:
        ai_data = await AIService.generate_interview_prep(
            role_title=application.role_title,
            company_name=company_name,
            jd_text=application.jd_text,
            round_type=request.round_type,
            round_notes=request.round_notes,
            custom_instructions=request.custom_instructions,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(e),
        )

    # 4. Save or Update in Database
    if existing_note:
        existing_note.generated_questions = ai_data["generated_questions"]
        existing_note.suggested_bullets = ai_data["suggested_bullets"]
        existing_note.model_used = ai_data["model_used"]
        db.commit()
        db.refresh(existing_note)
        return existing_note
    else:
        new_note = AIPrepNote(
            application_id=application.id,
            generated_questions=ai_data["generated_questions"],
            suggested_bullets=ai_data["suggested_bullets"],
            model_used=ai_data["model_used"],
        )
        db.add(new_note)
        db.commit()
        db.refresh(new_note)
        return new_note


@router.get("/prep-notes", response_model=AIPrepNotesResponse)
def get_prep_notes(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Fetches previously generated AI interview prep notes for an application."""
    # Verify Application Ownership
    stmt = select(Application).where(
        Application.id == application_id,
        Application.user_id == current_user.id,
    )
    application = db.scalars(stmt).first()
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found",
        )

    note_stmt = select(AIPrepNote).where(AIPrepNote.application_id == application_id)
    prep_note = db.scalars(note_stmt).first()
    if not prep_note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No AI prep notes generated for this application yet.",
        )

    return prep_note


@router.delete("/prep-notes", status_code=status.HTTP_204_NO_CONTENT)
def delete_prep_notes(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Deletes AI prep notes for an application."""
    stmt = select(Application).where(
        Application.id == application_id,
        Application.user_id == current_user.id,
    )
    application = db.scalars(stmt).first()
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found",
        )

    note_stmt = select(AIPrepNote).where(AIPrepNote.application_id == application_id)
    prep_note = db.scalars(note_stmt).first()
    if prep_note:
        db.delete(prep_note)
        db.commit()
