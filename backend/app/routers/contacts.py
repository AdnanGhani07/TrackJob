from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.deps import get_db, get_current_user
from app.models.user import User
from app.models.application import Application
from app.models.contact import Contact
from app.schemas.contact import ContactCreate, ContactUpdate, ContactResponse

router = APIRouter(tags=["Contacts"])


@router.post("/applications/{application_id}/contacts", response_model=ContactResponse, status_code=status.HTTP_201_CREATED)
def create_contact_for_application(
    application_id: int,
    contact_in: ContactCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a contact/referrer linked to a specific user application."""
    app_record = db.get(Application, application_id)
    if not app_record or app_record.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Application with ID {application_id} not found.",
        )

    contact = Contact(
        application_id=application_id,
        name=contact_in.name,
        relation=contact_in.relation,
        linkedin_url=contact_in.linkedin_url,
        last_contacted_date=contact_in.last_contacted_date,
    )
    db.add(contact)
    db.commit()
    db.refresh(contact)
    return contact


@router.get("/applications/{application_id}/contacts", response_model=List[ContactResponse])
def list_contacts_for_application(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all contacts associated with a specific user application."""
    app_record = db.get(Application, application_id)
    if not app_record or app_record.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Application with ID {application_id} not found.",
        )

    stmt = select(Contact).where(Contact.application_id == application_id).order_by(Contact.created_at.desc())
    return db.scalars(stmt).all()


@router.patch("/contacts/{contact_id}", response_model=ContactResponse)
def update_contact(
    contact_id: int,
    contact_in: ContactUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update contact details."""
    contact = db.get(Contact, contact_id)
    if not contact or contact.application.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Contact with ID {contact_id} not found.",
        )

    update_data = contact_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(contact, field, value)

    db.commit()
    db.refresh(contact)
    return contact


@router.delete("/contacts/{contact_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_contact(
    contact_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a contact."""
    contact = db.get(Contact, contact_id)
    if not contact or contact.application.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Contact with ID {contact_id} not found.",
        )

    db.delete(contact)
    db.commit()
    return None
