"""
Customer Repository
-------------------
All raw database queries for the Customer domain live here.
Routers and services call these functions — they never query the DB directly.
"""
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.modules.customer.model import Customer, Policy, CustomerNote


def get_all(db: Session) -> list[Customer]:
    """Return all customers ordered by newest first."""
    return db.query(Customer).order_by(Customer.id.desc()).all()


def get_by_id(db: Session, customer_id: int) -> Customer | None:
    """Return a single customer by primary key, or None."""
    return db.query(Customer).filter(Customer.id == customer_id).first()


def get_by_match_code(db: Session, match_code: str) -> Customer | None:
    """Return a customer with the given match code, or None."""
    return db.query(Customer).filter(Customer.match_code == match_code).first()


def create(db: Session, data: dict) -> Customer:
    """
    Insert a new customer row.
    `data` must only contain keys that exist as columns in Customer.__table__.
    """
    valid_keys = {c.name for c in Customer.__table__.columns}
    clean_data = {k: v for k, v in data.items() if k in valid_keys}
    db_customer = Customer(**clean_data)
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    return db_customer


def update(db: Session, db_customer: Customer, data: dict) -> Customer:
    """
    Apply a partial update to an existing customer row.
    Only keys that exist as columns are written.
    """
    valid_keys = {c.name for c in Customer.__table__.columns}
    for key, value in data.items():
        if key in valid_keys:
            setattr(db_customer, key, value)
    db.commit()
    db.refresh(db_customer)
    return db_customer


def delete(db: Session, db_customer: Customer) -> None:
    """Permanently remove a customer row."""
    db.delete(db_customer)
    db.commit()


def count_all(db: Session) -> int:
    """Return total number of customer records."""
    return db.query(func.count(Customer.id)).scalar() or 0


def get_policies_by_customer_id(db: Session, customer_id: int) -> list[Policy]:
    """Return all policies for the given customer ordered by newest first."""
    return db.query(Policy).filter(Policy.customer_id == customer_id).order_by(Policy.id.desc()).all()


def create_policy(db: Session, customer_id: int, data: dict) -> Policy:
    """Insert a new policy row for the customer."""
    valid_keys = {c.name for c in Policy.__table__.columns}
    clean_data = {k: v for k, v in data.items() if k in valid_keys}
    clean_data["customer_id"] = customer_id
    db_policy = Policy(**clean_data)
    db.add(db_policy)
    db.commit()
    db.refresh(db_policy)
    return db_policy


def get_policy_by_id(db: Session, policy_id: int) -> Policy | None:
    """Return a single policy by primary key, or None."""
    return db.query(Policy).filter(Policy.id == policy_id).first()


def get_policy_for_customer_by_id(db: Session, customer_id: int, policy_id: int) -> Policy | None:
    """Return a policy by ID only if it belongs to the given customer."""
    return db.query(Policy).filter(Policy.id == policy_id, Policy.customer_id == customer_id).first()


def update_policy(db: Session, db_policy: Policy, data: dict) -> Policy:
    """Apply a partial update to an existing policy row."""
    valid_keys = {c.name for c in Policy.__table__.columns}
    for key, value in data.items():
        if key in valid_keys:
            setattr(db_policy, key, value)
    db.commit()
    db.refresh(db_policy)
    return db_policy


def get_notes_by_customer_id(db: Session, customer_id: int) -> list[CustomerNote]:
    """Return all notes for the given customer ordered by newest first."""
    return db.query(CustomerNote).filter(CustomerNote.customer_id == customer_id).order_by(CustomerNote.id.desc()).all()


def get_note_by_id(db: Session, note_id: int) -> CustomerNote | None:
    """Return a single note by primary key, or None."""
    return db.query(CustomerNote).filter(CustomerNote.id == note_id).first()


def create_customer_note(db: Session, customer_id: int, data: dict) -> CustomerNote:
    """Insert a new customer note row."""
    valid_keys = {c.name for c in CustomerNote.__table__.columns}
    clean_data = {k: v for k, v in data.items() if k in valid_keys}
    clean_data["customer_id"] = customer_id
    
    from datetime import datetime
    clean_data["created_at"] = datetime.now().strftime("%m/%d/%Y %I:%M %p")
    
    db_note = CustomerNote(**clean_data)
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    return db_note


def update_customer_note(db: Session, db_note: CustomerNote, text: str) -> CustomerNote:
    """Update note content."""
    setattr(db_note, "text", text)
    db.commit()
    db.refresh(db_note)
    return db_note


def delete_customer_note(db: Session, db_note: CustomerNote) -> None:
    """Permanently remove a customer note."""
    db.delete(db_note)
    db.commit()


def get_gl_coverages(db: Session, policy_id: int) -> list:
    from app.modules.customer.model import GeneralLiabilityCoverage
    return db.query(GeneralLiabilityCoverage).filter(GeneralLiabilityCoverage.policy_id == policy_id).order_by(GeneralLiabilityCoverage.sortOrder).all()

def replace_gl_coverages(db: Session, policy_id: int, coverages: list) -> list:
    from app.modules.customer.model import GeneralLiabilityCoverage
    db.query(GeneralLiabilityCoverage).filter(GeneralLiabilityCoverage.policy_id == policy_id).delete()
    db_coverages = [GeneralLiabilityCoverage(**c, policy_id=policy_id) for c in coverages]
    db.add_all(db_coverages)
    db.commit()
    return db_coverages

def get_gl_info(db: Session, policy_id: int):
    from app.modules.customer.model import GeneralLiabilityInfo
    return db.query(GeneralLiabilityInfo).filter(GeneralLiabilityInfo.policy_id == policy_id).first()

def replace_gl_info(db: Session, policy_id: int, info: dict):
    from app.modules.customer.model import GeneralLiabilityInfo
    db.query(GeneralLiabilityInfo).filter(GeneralLiabilityInfo.policy_id == policy_id).delete()
    db_info = GeneralLiabilityInfo(**info, policy_id=policy_id)
    db.add(db_info)
    db.commit()
    return db_info

def get_ba_coverages(db: Session, policy_id: int) -> list:
    from app.modules.customer.model import BusinessAutoCoverage
    return db.query(BusinessAutoCoverage).filter(BusinessAutoCoverage.policy_id == policy_id).order_by(BusinessAutoCoverage.id).all()

def replace_ba_coverages(db: Session, policy_id: int, coverages: list) -> list:
    from app.modules.customer.model import BusinessAutoCoverage
    db.query(BusinessAutoCoverage).filter(BusinessAutoCoverage.policy_id == policy_id).delete()
    db_coverages = [BusinessAutoCoverage(**c, policy_id=policy_id) for c in coverages]
    db.add_all(db_coverages)
    db.commit()
    return db_coverages

def get_wc_coverages(db: Session, policy_id: int) -> list:
    from app.modules.customer.model import WorkersCompCoverage
    return db.query(WorkersCompCoverage).filter(WorkersCompCoverage.policy_id == policy_id).order_by(WorkersCompCoverage.id).all()

def replace_wc_coverages(db: Session, policy_id: int, coverages: list) -> list:
    from app.modules.customer.model import WorkersCompCoverage
    db.query(WorkersCompCoverage).filter(WorkersCompCoverage.policy_id == policy_id).delete()
    db_coverages = [WorkersCompCoverage(**c, policy_id=policy_id) for c in coverages]
    db.add_all(db_coverages)
    db.commit()
    return db_coverages


def get_ba_symbols(db: Session, policy_id: int):
    from app.modules.customer.model import BusinessAutoSymbol
    return db.query(BusinessAutoSymbol).filter(BusinessAutoSymbol.policy_id == policy_id).first()

def replace_ba_symbols(db: Session, policy_id: int, symbols: dict):
    from app.modules.customer.model import BusinessAutoSymbol
    db.query(BusinessAutoSymbol).filter(BusinessAutoSymbol.policy_id == policy_id).delete()
    db_symbols = BusinessAutoSymbol(**symbols, policy_id=policy_id)
    db.add(db_symbols)
    db.commit()
    return db_symbols

def get_wc_part2(db: Session, policy_id: int):
    from app.modules.customer.model import WorkersCompPart2
    return db.query(WorkersCompPart2).filter(WorkersCompPart2.policy_id == policy_id).first()

def replace_wc_part2(db: Session, policy_id: int, part2: dict):
    from app.modules.customer.model import WorkersCompPart2
    db.query(WorkersCompPart2).filter(WorkersCompPart2.policy_id == policy_id).delete()
    db_part2 = WorkersCompPart2(**part2, policy_id=policy_id)
    db.add(db_part2)
    db.commit()
    return db_part2

def get_umbrella_coverages(db: Session, policy_id: int) -> list:
    from app.modules.customer.model import UmbrellaCoverage
    return db.query(UmbrellaCoverage).filter(UmbrellaCoverage.policy_id == policy_id).order_by(UmbrellaCoverage.id).all()

def replace_umbrella_coverages(db: Session, policy_id: int, coverages: list) -> list:
    from app.modules.customer.model import UmbrellaCoverage
    db.query(UmbrellaCoverage).filter(UmbrellaCoverage.policy_id == policy_id).delete()
    db_coverages = [UmbrellaCoverage(**c, policy_id=policy_id) for c in coverages]
    db.add_all(db_coverages)
    db.commit()
    return db_coverages

def get_umbrella_info(db: Session, policy_id: int):
    from app.modules.customer.model import UmbrellaInfo
    return db.query(UmbrellaInfo).filter(UmbrellaInfo.policy_id == policy_id).first()

def replace_umbrella_info(db: Session, policy_id: int, info: dict):
    from app.modules.customer.model import UmbrellaInfo
    db.query(UmbrellaInfo).filter(UmbrellaInfo.policy_id == policy_id).delete()
    valid_keys = {c.name for c in UmbrellaInfo.__table__.columns}
    clean = {k: v for k, v in info.items() if k in valid_keys}
    db_info = UmbrellaInfo(**clean, policy_id=policy_id)
    db.add(db_info)
    db.commit()
    return db_info


def get_documents_by_customer_id(db: Session, customer_id: int) -> list:
    from app.modules.customer.model import CustomerDocument
    return db.query(CustomerDocument).filter(CustomerDocument.customer_id == customer_id).order_by(CustomerDocument.id.desc()).all()


def create_customer_document(db: Session, customer_id: int, data: dict):
    from app.modules.customer.model import CustomerDocument
    from datetime import datetime
    valid_keys = {c.name for c in CustomerDocument.__table__.columns}
    clean_data = {k: v for k, v in data.items() if k in valid_keys}
    clean_data["customer_id"] = customer_id
    if "created_at" not in clean_data or not clean_data["created_at"]:
        clean_data["created_at"] = datetime.now().strftime("%m/%d/%Y %I:%M %p")
    db_doc = CustomerDocument(**clean_data)
    db.add(db_doc)
    db.commit()
    db.refresh(db_doc)
    return db_doc


def get_master_certificates_by_customer_id(db: Session, customer_id: int) -> list:
    from app.modules.customer.model import MasterCertificate
    return db.query(MasterCertificate).filter(MasterCertificate.customer_id == customer_id).order_by(MasterCertificate.id.desc()).all()


def create_master_certificate(db: Session, customer_id: int, data: dict):
    from app.modules.customer.model import MasterCertificate
    valid_keys = {c.name for c in MasterCertificate.__table__.columns}
    clean_data = {k: v for k, v in data.items() if k in valid_keys}
    clean_data["customer_id"] = customer_id
    db_cert = MasterCertificate(**clean_data)
    db.add(db_cert)
    db.commit()
    db.refresh(db_cert)
    return db_cert


# ── Certificate Holders ─────────────────────────────────────────────────────────

def get_holders_by_certificate_id(db: Session, certificate_id: int) -> list:
    from app.modules.customer.model import CertificateHolder
    return db.query(CertificateHolder).filter(
        CertificateHolder.certificate_id == certificate_id
    ).order_by(CertificateHolder.id.asc()).all()


def create_certificate_holder(db: Session, customer_id: int, certificate_id: int, data: dict):
    from app.modules.customer.model import CertificateHolder
    from datetime import datetime
    valid_keys = {c.name for c in CertificateHolder.__table__.columns}
    clean_data = {k: v for k, v in data.items() if k in valid_keys}
    clean_data["customer_id"] = customer_id
    clean_data["certificate_id"] = certificate_id
    if "created_at" not in clean_data or not clean_data.get("created_at"):
        clean_data["created_at"] = datetime.now().strftime("%m/%d/%Y %I:%M %p")
    db_holder = CertificateHolder(**clean_data)
    db.add(db_holder)
    db.commit()
    db.refresh(db_holder)
    return db_holder


def update_certificate_holder(db: Session, holder_id: int, data: dict):
    from app.modules.customer.model import CertificateHolder
    db_holder = db.query(CertificateHolder).filter(CertificateHolder.id == holder_id).first()
    if not db_holder:
        return None
    for k, v in data.items():
        if hasattr(db_holder, k):
            setattr(db_holder, k, v)
    db.commit()
    db.refresh(db_holder)
    return db_holder


def delete_certificate_holder(db: Session, holder_id: int) -> bool:
    from app.modules.customer.model import CertificateHolder
    db_holder = db.query(CertificateHolder).filter(CertificateHolder.id == holder_id).first()
    if not db_holder:
        return False
    db.delete(db_holder)
    db.commit()
    return True
