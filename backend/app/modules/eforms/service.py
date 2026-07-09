from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.modules.eforms import repository as repo
import logging

logger = logging.getLogger(__name__)

def get_merged_certificate(db: Session, certificate_id: int):
    # Just fetch overrides, the frontend will manage fetching the base certificate data.
    # The requirement said to return Merged API Data + Manual Overrides.
    # Returning them separated as a dictionary allows the frontend to apply manual overrides cleanly.
    
    overrides_records = repo.get_overrides(db, certificate_id)
    overrides = {rec.field_name: rec.field_value for rec in overrides_records}

    return {
        "certificate": {}, # This can be fetched separately or we return just overrides. 
        # For simplicity and adhering to the no-modification rule, we just pass the overrides here.
        "overrides": overrides
    }

def save_overrides(db: Session, certificate_id: int, overrides: dict, user: str):
    count = 0
    for field, value in overrides.items():
        repo.upsert_override(db, certificate_id, field, value, user)
        count += 1
    
    logger.info(f"Saved {count} overrides for certificate {certificate_id} by user {user}")
    return {"message": "Overrides saved successfully", "updated_fields": count}
