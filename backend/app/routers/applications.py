from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import IntegrityError

from app.deps import get_db, get_current_user
from app.models.user import User
from app.models.company import Company
from app.models.application import Application, ApplicationStatus, ApplicationSource
from app.schemas.application import (
    ApplicationCreate,
    ApplicationUpdate,
    ApplicationResponse,
)

router = APIRouter(prefix="/applications", tags=["Applications"])


@router.post("", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
def create_application(
    app_in: ApplicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Create a new job application record for the authenticated user.
    """
    # Verify company exists
    company = db.get(Company, app_in.company_id)
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Company with ID {app_in.company_id} does not exist.",
        )

    # Check for duplicate unique constraint (user_id, company_id, role_title)
    existing = db.scalar(
        select(Application).where(
            Application.user_id == current_user.id,
            Application.company_id == app_in.company_id,
            Application.role_title == app_in.role_title,
        )
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"An application for role '{app_in.role_title}' at this company already exists.",
        )

    application = Application(
        user_id=current_user.id,
        company_id=app_in.company_id,
        role_title=app_in.role_title,
        jd_text=app_in.jd_text,
        status=app_in.status,
        source=app_in.source,
        applied_date=app_in.applied_date,
        resume_version=app_in.resume_version,
    )
    db.add(application)
    try:
        db.commit()
        db.refresh(application)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Database integrity error while creating application.",
        )

    # Re-fetch with joined company for clean response
    return db.scalar(
        select(Application)
        .options(joinedload(Application.company))
        .where(Application.id == application.id)
    )


@router.get("", response_model=List[ApplicationResponse])
def list_applications(
    status: Optional[ApplicationStatus] = Query(None, description="Filter by application status"),
    source: Optional[ApplicationSource] = Query(None, description="Filter by source"),
    company_id: Optional[int] = Query(None, description="Filter by company ID"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    List applications belonging to the authenticated user with optional filtering.
    """
    stmt = (
        select(Application)
        .options(joinedload(Application.company))
        .where(Application.user_id == current_user.id)
        .offset(skip)
        .limit(limit)
        .order_by(Application.created_at.desc())
    )

    if status:
        stmt = stmt.where(Application.status == status)
    if source:
        stmt = stmt.where(Application.source == source)
    if company_id:
        stmt = stmt.where(Application.company_id == company_id)

    applications = db.scalars(stmt).all()
    return applications


@router.get("/{application_id}", response_model=ApplicationResponse)
def get_application(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get single application details by ID (scoped to current user).
    """
    stmt = (
        select(Application)
        .options(joinedload(Application.company))
        .where(Application.id == application_id, Application.user_id == current_user.id)
    )
    application = db.scalar(stmt)
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Application with ID {application_id} not found.",
        )
    return application


@router.patch("/{application_id}", response_model=ApplicationResponse)
def update_application(
    application_id: int,
    app_in: ApplicationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Update application fields (scoped to current user).
    """
    application = db.get(Application, application_id)
    if not application or application.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Application with ID {application_id} not found.",
        )

    update_data = app_in.model_dump(exclude_unset=True)

    if "company_id" in update_data:
        company = db.get(Company, update_data["company_id"])
        if not company:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Target company with ID {update_data['company_id']} does not exist.",
            )

    for field, value in update_data.items():
        setattr(application, field, value)

    try:
        db.commit()
        db.refresh(application)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Update violates unique constraint for user, company, and role.",
        )

    return db.scalar(
        select(Application)
        .options(joinedload(Application.company))
        .where(Application.id == application.id)
    )


@router.delete("/{application_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_application(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Delete a job application (scoped to current user).
    """
    application = db.get(Application, application_id)
    if not application or application.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Application with ID {application_id} not found.",
        )

    db.delete(application)
    db.commit()
    return None
