from sqlalchemy.orm import Session
from app.modules.eforms.model import CertificateFieldOverride

def get_overrides(db: Session, certificate_id: int):
    return db.query(CertificateFieldOverride).filter(CertificateFieldOverride.certificate_id == certificate_id).all()

def upsert_override(db: Session, certificate_id: int, field_name: str, field_value: str, user: str):
    record = db.query(CertificateFieldOverride).filter(
        CertificateFieldOverride.certificate_id == certificate_id,
        CertificateFieldOverride.field_name == field_name
    ).first()

    if record:
        record.field_value = field_value
        record.updated_by = user
    else:
        record = CertificateFieldOverride(
            certificate_id=certificate_id,
            field_name=field_name,
            field_value=field_value,
            created_by=user,
            updated_by=user
        )
        db.add(record)
    
    db.commit()
    db.refresh(record)
    return record
