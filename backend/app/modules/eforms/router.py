from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.modules.auth.deps import get_current_user
from app.modules.eforms import schema, service

router = APIRouter()

@router.get("/{id}", response_model=schema.CertificateMergedResponse)
def get_eform_overrides(
    id: int, 
    db: Session = Depends(get_db), 
    current_user: dict = Depends(get_current_user)
):
    return service.get_merged_certificate(db, id)

@router.post("/{id}/override", response_model=schema.OverrideResponse)
def save_eform_overrides(
    id: int, 
    payload: schema.OverrideRequest,
    db: Session = Depends(get_db), 
    current_user: dict = Depends(get_current_user)
):
    user_email = current_user.get("email", "unknown")
    return service.save_overrides(db, id, payload.overrides, user_email)
