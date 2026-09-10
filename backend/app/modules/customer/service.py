"""
Customer Service
----------------
Business logic for the Customer domain.
Validates inputs, enforces rules, and delegates DB work to the repository.
Routers call service functions — services call repository functions.
"""
import logging
import traceback
from datetime import datetime
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.modules.customer.model import Customer, Policy, CustomerNote
from app.modules.customer import repository as repo

logger = logging.getLogger(__name__)


def _get_agent_and_agency_cache(db: Session):
    from app.modules.customer.model import Agent, Agency
    try:
        agents = db.query(Agent).all()
    except Exception:
        agents = []
    try:
        agencies = {a.id: a for a in db.query(Agency).all()}
    except Exception:
        agencies = {}

    agents_map = {}
    for a in agents:
        if not a.name:
            continue
        agents_map[a.name.strip().lower()] = a
        if ',' in a.name:
            parts = [p.strip() for p in a.name.split(',')]
            if len(parts) >= 2:
                agents_map[f"{parts[1]} {parts[0]}".strip().lower()] = a
                agents_map[f"{parts[0]}, {parts[1]}".strip().lower()] = a
                agents_map[f"{parts[0]} {parts[1]}".strip().lower()] = a

    default_agent = agents[0] if agents else None
    return agents_map, agencies, default_agent


def get_contact_person_for_customer(db: Session, customer: Customer, cache=None) -> dict:
    if cache is None:
        cache = _get_agent_and_agency_cache(db)
    agents_map, agencies, default_agent = cache

    agent_name = (customer.primary_exec or customer.executive or "").strip()
    agent = None
    if agent_name:
        agent = agents_map.get(agent_name.lower())
        if not agent and ',' in agent_name:
            parts = [p.strip() for p in agent_name.split(',')]
            if len(parts) >= 2:
                alt_name = f"{parts[1]} {parts[0]}".strip().lower()
                agent = agents_map.get(alt_name)

    if not agent:
        agent = default_agent

    if not agent:
        return {
            "name": "Ben Solender",
            "phone": "(310) 492-2007",
            "email": "ben@capcoinsurance.com",
            "fax": "(310) 525-5292"
        }

    agency = agencies.get(agent.agency_id) if agent.agency_id else None

    return {
        "name": agent.name,
        "phone": agency.phone if (agency and agency.phone) else "(310) 492-2007",
        "email": agent.email,
        "fax": agency.fax if (agency and agency.fax) else "(310) 525-5292"
    }


def list_customers(db: Session) -> list[Customer]:
    """Fetch all customers. Pre-caches agents to eliminate N+1 roundtrips."""
    try:
        customers = repo.get_all(db)
        logger.info(f"list_customers: found {len(customers)} records")
        cache = _get_agent_and_agency_cache(db)
        for customer in customers:
            customer.contact_person = get_contact_person_for_customer(db, customer, cache=cache)
        return customers
    except Exception as e:
        logger.error(f"list_customers failed: {e}")
        raise HTTPException(status_code=500, detail="Error fetching customers")


def get_customer(db: Session, customer_id: int) -> Customer:
    """Fetch a single customer by ID. Raises 404 if not found."""
    customer = repo.get_by_id(db, customer_id)
    if not customer:
        logger.warning(f"get_customer: ID {customer_id} not found")
        raise HTTPException(status_code=404, detail="Customer not found")
    logger.info(f"get_customer: fetched {customer.name} (ID {customer_id})")
    customer.contact_person = get_contact_person_for_customer(db, customer)
    return customer


def create_customer(db: Session, data: dict) -> Customer:
    """
    Create a new customer record.
    Validates required fields before writing to DB.
    """
    # Business rule: name and match_code are required
    if not data.get("name"):
        raise HTTPException(status_code=422, detail="Customer name is required")
    if not data.get("match_code"):
        raise HTTPException(status_code=422, detail="Match code is required")

    try:
        customer = repo.create(db, data)
        logger.info(
            f"create_customer: created '{customer.name}' (ID {customer.id}) "
            f"at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
        )
        return customer
    except Exception as e:
        logger.error(f"create_customer failed: {e}")
        traceback.print_exc()
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


def update_customer(db: Session, customer_id: int, data: dict) -> Customer:
    """
    Apply a partial update to an existing customer.
    Raises 404 if customer does not exist.
    """
    customer = repo.get_by_id(db, customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    try:
        updated = repo.update(db, customer, data)
        logger.info(
            f"update_customer: updated ID {customer_id} "
            f"| fields={list(data.keys())}"
        )
        return updated
    except Exception as e:
        logger.error(f"update_customer failed for ID {customer_id}: {e}")
        traceback.print_exc()
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


def delete_customer(db: Session, customer_id: int) -> str:
    """
    Delete a customer by ID.
    Raises 404 if customer does not exist.
    Returns the deleted customer's name for confirmation logging.
    """
    customer = repo.get_by_id(db, customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    name = str(customer.name)
    try:
        repo.delete(db, customer)
        logger.info(
            f"delete_customer: deleted '{name}' (ID {customer_id})"
        )
        return name
    except Exception as e:
        logger.error(f"delete_customer failed for ID {customer_id}: {e}")
        traceback.print_exc()
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


def list_policies(db: Session, customer_id: int) -> list[Policy]:
    """Fetch all policies for the given customer ID."""
    # Validate customer exists first
    get_customer(db, customer_id)
    try:
        policies = repo.get_policies_by_customer_id(db, customer_id)
        logger.info(f"list_policies: found {len(policies)} policies for customer ID {customer_id}")
        return policies
    except Exception as e:
        logger.error(f"list_policies failed: {e}")
        raise HTTPException(status_code=500, detail="Error fetching customer policies")


def create_policy(db: Session, customer_id: int, data: dict) -> Policy:
    """Create a new policy record for a customer."""
    # Validate customer exists first
    get_customer(db, customer_id)
    if not data.get("policy_num"):
        raise HTTPException(status_code=422, detail="Policy number is required")
    if not data.get("eff_date"):
        raise HTTPException(status_code=422, detail="Effective date is required")

    try:
        policy = repo.create_policy(db, customer_id, data)
        logger.info(f"create_policy: created Policy '{policy.policy_num}' (ID {policy.id}) for customer ID {customer_id}")
        return policy
    except Exception as e:
        logger.error(f"create_policy failed: {e}")
        traceback.print_exc()
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


def ensure_policy_belongs_to_customer(db: Session, customer_id: int, policy_id: int) -> Policy:
    policy = repo.get_policy_for_customer_by_id(db, customer_id, policy_id)
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    return policy


def update_policy(db: Session, customer_id: int, policy_id: int, data: dict) -> Policy:
    """Update an existing policy for a customer."""
    policy = ensure_policy_belongs_to_customer(db, customer_id, policy_id)
    try:
        updated = repo.update_policy(db, policy, data)
        logger.info(f"update_policy: updated Policy '{updated.policy_num}' (ID {policy_id}) for customer ID {customer_id}")
        return updated
    except Exception as e:
        logger.error(f"update_policy failed for ID {policy_id}: {e}")
        traceback.print_exc()
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


def list_customer_notes(db: Session, customer_id: int) -> list[CustomerNote]:
    """Fetch all notes for a customer."""
    # Validate customer exists first
    get_customer(db, customer_id)
    try:
        notes = repo.get_notes_by_customer_id(db, customer_id)
        logger.info(f"list_customer_notes: found {len(notes)} notes for customer ID {customer_id}")
        return notes
    except Exception as e:
        logger.error(f"list_customer_notes failed: {e}")
        raise HTTPException(status_code=500, detail="Error fetching customer notes")


def create_customer_note(db: Session, customer_id: int, data: dict) -> CustomerNote:
    """Create a new note for a customer."""
    # Validate customer exists first
    get_customer(db, customer_id)
    if not data.get("text"):
        raise HTTPException(status_code=422, detail="Note text is required")
    if not data.get("author"):
        raise HTTPException(status_code=422, detail="Author is required")
    if not data.get("role"):
        raise HTTPException(status_code=422, detail="Role is required")

    try:
        note = repo.create_customer_note(db, customer_id, data)
        logger.info(f"create_customer_note: created Note (ID {note.id}) for customer ID {customer_id}")
        return note
    except Exception as e:
        logger.error(f"create_customer_note failed: {e}")
        traceback.print_exc()
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


def update_customer_note(db: Session, customer_id: int, note_id: int, text: str) -> CustomerNote:
    """Update a customer note's text content."""
    get_customer(db, customer_id)
    note = repo.get_note_by_id(db, note_id)
    if not note or note.customer_id != customer_id:
        raise HTTPException(status_code=404, detail="Note not found")

    try:
        updated = repo.update_customer_note(db, note, text)
        logger.info(f"update_customer_note: updated Note ID {note_id} for customer ID {customer_id}")
        return updated
    except Exception as e:
        logger.error(f"update_customer_note failed for ID {note_id}: {e}")
        traceback.print_exc()
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


def delete_customer_note(db: Session, customer_id: int, note_id: int) -> None:
    """Delete a customer note."""
    get_customer(db, customer_id)
    note = repo.get_note_by_id(db, note_id)
    if not note or note.customer_id != customer_id:
        raise HTTPException(status_code=404, detail="Note not found")

    try:
        repo.delete_customer_note(db, note)
        logger.info(f"delete_customer_note: deleted Note ID {note_id} for customer ID {customer_id}")
    except Exception as e:
        logger.error(f"delete_customer_note failed for ID {note_id}: {e}")
        traceback.print_exc()
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

def get_gl_coverages(db: Session, customer_id: int, policy_id: int) -> list:
    ensure_policy_belongs_to_customer(db, customer_id, policy_id)
    return repo.get_gl_coverages(db, policy_id)

def replace_gl_coverages(db: Session, customer_id: int, policy_id: int, coverages: list) -> list:
    policy = db.query(repo.Policy).with_for_update().filter(repo.Policy.id == policy_id, repo.Policy.customer_id == customer_id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    try:
        return repo.replace_gl_coverages(db, policy_id, coverages)
    except Exception as e:
        logger.error(f"replace_gl_coverages failed: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

def get_gl_info(db: Session, customer_id: int, policy_id: int):
    ensure_policy_belongs_to_customer(db, customer_id, policy_id)
    return repo.get_gl_info(db, policy_id)

def replace_gl_info(db: Session, customer_id: int, policy_id: int, info: dict):
    ensure_policy_belongs_to_customer(db, customer_id, policy_id)
    try:
        return repo.replace_gl_info(db, policy_id, info)
    except Exception as e:
        logger.error(f"replace_gl_info failed: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

def get_ba_coverages(db: Session, customer_id: int, policy_id: int) -> list:
    ensure_policy_belongs_to_customer(db, customer_id, policy_id)
    return repo.get_ba_coverages(db, policy_id)

def replace_ba_coverages(db: Session, customer_id: int, policy_id: int, coverages: list) -> list:
    policy = db.query(repo.Policy).with_for_update().filter(repo.Policy.id == policy_id, repo.Policy.customer_id == customer_id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    try:
        return repo.replace_ba_coverages(db, policy_id, coverages)
    except Exception as e:
        logger.error(f"replace_ba_coverages failed: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

def get_wc_coverages(db: Session, customer_id: int, policy_id: int) -> list:
    ensure_policy_belongs_to_customer(db, customer_id, policy_id)
    return repo.get_wc_coverages(db, policy_id)

def replace_wc_coverages(db: Session, customer_id: int, policy_id: int, coverages: list) -> list:
    policy = db.query(repo.Policy).with_for_update().filter(repo.Policy.id == policy_id, repo.Policy.customer_id == customer_id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    try:
        return repo.replace_wc_coverages(db, policy_id, coverages)
    except Exception as e:
        logger.error(f"replace_wc_coverages failed: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


def get_ba_symbols(db: Session, customer_id: int, policy_id: int):
    ensure_policy_belongs_to_customer(db, customer_id, policy_id)
    return repo.get_ba_symbols(db, policy_id)

def replace_ba_symbols(db: Session, customer_id: int, policy_id: int, symbols: dict):
    ensure_policy_belongs_to_customer(db, customer_id, policy_id)
    try:
        return repo.replace_ba_symbols(db, policy_id, symbols)
    except Exception as e:
        logger.error(f"replace_ba_symbols failed: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

def get_wc_part2(db: Session, customer_id: int, policy_id: int):
    ensure_policy_belongs_to_customer(db, customer_id, policy_id)
    return repo.get_wc_part2(db, policy_id)

def replace_wc_part2(db: Session, customer_id: int, policy_id: int, part2: dict):
    ensure_policy_belongs_to_customer(db, customer_id, policy_id)
    try:
        return repo.replace_wc_part2(db, policy_id, part2)
    except Exception as e:
        logger.error(f"replace_wc_part2 failed: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

def get_umbrella_coverages(db: Session, customer_id: int, policy_id: int) -> list:
    ensure_policy_belongs_to_customer(db, customer_id, policy_id)
    return repo.get_umbrella_coverages(db, policy_id)

def replace_umbrella_coverages(db: Session, customer_id: int, policy_id: int, coverages: list) -> list:
    policy = db.query(repo.Policy).with_for_update().filter(repo.Policy.id == policy_id, repo.Policy.customer_id == customer_id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    try:
        return repo.replace_umbrella_coverages(db, policy_id, coverages)
    except Exception as e:
        logger.error(f"replace_umbrella_coverages failed: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

def get_umbrella_info(db: Session, customer_id: int, policy_id: int):
    ensure_policy_belongs_to_customer(db, customer_id, policy_id)
    return repo.get_umbrella_info(db, policy_id)

def replace_umbrella_info(db: Session, customer_id: int, policy_id: int, info: dict):
    ensure_policy_belongs_to_customer(db, customer_id, policy_id)
    try:
        return repo.replace_umbrella_info(db, policy_id, info)
    except Exception as e:
        logger.error(f"replace_umbrella_info failed: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

def list_customer_documents(db: Session, customer_id: int) -> list:
    get_customer(db, customer_id)
    try:
        docs = repo.get_documents_by_customer_id(db, customer_id)
        logger.info(f"list_customer_documents: found {len(docs)} documents for customer ID {customer_id}")
        return docs
    except Exception as e:
        logger.error(f"list_customer_documents failed: {e}")
        raise HTTPException(status_code=500, detail="Error fetching customer documents")

def get_customer_document(db: Session, customer_id: int, doc_id: int):
    get_customer(db, customer_id)
    doc = repo.get_customer_document(db, customer_id, doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc

def create_customer_document(db: Session, customer_id: int, data: dict):
    get_customer(db, customer_id)
    if not data.get("file_name"):
        raise HTTPException(status_code=422, detail="File name is required")
        
    try:
        doc = repo.create_customer_document(db, customer_id, data)
        logger.info(f"create_customer_document: created Document (ID {doc.id}) for customer ID {customer_id}")
        return doc
    except Exception as e:
        logger.error(f"create_customer_document failed: {e}")
        traceback.print_exc()
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

def delete_customer_document(db: Session, customer_id: int, doc_id: int):
    get_customer(db, customer_id)
    doc = get_customer_document(db, customer_id, doc_id)
    try:
        repo.delete_customer_document(db, doc)
        logger.info(f"delete_customer_document: deleted Document (ID {doc_id}) for customer ID {customer_id}")
        return doc
    except Exception as e:
        logger.error(f"delete_customer_document failed: {e}")
        traceback.print_exc()
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


def list_master_certificates(db: Session, customer_id: int) -> list:
    get_customer(db, customer_id)
    try:
        certs = repo.get_master_certificates_by_customer_id(db, customer_id)
        logger.info(f"list_master_certificates: found {len(certs)} certificates for customer ID {customer_id}")
        return certs
    except Exception as e:
        logger.error(f"list_master_certificates failed: {e}")
        raise HTTPException(status_code=500, detail="Error fetching master certificates")

def create_master_certificate(db: Session, customer_id: int, data: dict):
    get_customer(db, customer_id)
    try:
        cert = repo.create_master_certificate(db, customer_id, data)
        logger.info(f"create_master_certificate: created Certificate (ID {cert.id}) for customer ID {customer_id}")
        return cert
    except Exception as e:
        logger.error(f"create_master_certificate failed: {e}")
        traceback.print_exc()
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


def get_master_certificate(db: Session, customer_id: int, certificate_id: int):
    get_customer(db, customer_id)
    cert = repo.get_master_certificate(db, certificate_id)
    if not cert or cert.customer_id != customer_id:
        raise HTTPException(status_code=404, detail="Master certificate not found")
    return cert

def update_master_certificate(db: Session, customer_id: int, certificate_id: int, data: dict):
    get_master_certificate(db, customer_id, certificate_id)
    try:
        cert = repo.update_master_certificate(db, certificate_id, data)
        logger.info(f"update_master_certificate: updated Certificate ID {certificate_id}")
        return cert
    except Exception as e:
        logger.error(f"update_master_certificate failed: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

def delete_master_certificate(db: Session, customer_id: int, certificate_id: int):
    get_master_certificate(db, customer_id, certificate_id)
    try:
        repo.delete_master_certificate(db, certificate_id)
        logger.info(f"delete_master_certificate: deleted Certificate ID {certificate_id}")
    except Exception as e:
        logger.error(f"delete_master_certificate failed: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# ── Certificate Holders ────────────────────────────────────────────────────────

def list_certificate_holders(db: Session, customer_id: int, certificate_id: int) -> list:
    get_customer(db, customer_id)
    try:
        holders = repo.get_holders_by_certificate_id(db, certificate_id)
        logger.info(f"list_certificate_holders: found {len(holders)} for cert ID {certificate_id}")
        return holders
    except Exception as e:
        logger.error(f"list_certificate_holders failed: {e}")
        raise HTTPException(status_code=500, detail="Error fetching certificate holders")


def create_certificate_holder(db: Session, customer_id: int, certificate_id: int, data: dict):
    get_customer(db, customer_id)
    if not data.get("name"):
        raise HTTPException(status_code=422, detail="Holder name is required")
    try:
        holder = repo.create_certificate_holder(db, customer_id, certificate_id, data)
        logger.info(f"create_certificate_holder: created Holder (ID {holder.id})")
        return holder
    except Exception as e:
        logger.error(f"create_certificate_holder failed: {e}")
        traceback.print_exc()
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


def update_certificate_holder(db: Session, customer_id: int, holder_id: int, data: dict):
    get_customer(db, customer_id)
    try:
        holder = repo.update_certificate_holder(db, holder_id, data)
        if not holder:
            raise HTTPException(status_code=404, detail="Certificate holder not found")
        logger.info(f"update_certificate_holder: updated Holder ID {holder_id}")
        return holder
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"update_certificate_holder failed: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


def delete_certificate_holder(db: Session, customer_id: int, holder_id: int):
    get_customer(db, customer_id)
    deleted = repo.delete_certificate_holder(db, holder_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Certificate holder not found")
    logger.info(f"delete_certificate_holder: deleted Holder ID {holder_id}")


def get_coverages_bundle(db: Session, customer_id: int) -> dict:
    """
    High-Performance Coverages Bundle:
    Returns all policies, their formatted coverages (GL, Umbrella, WC, Auto),
    and pre-indexed policyCoveragesMap in 4 fast batch queries instead of 25+ cascading HTTP calls.
    """
    from app.modules.customer.model import (
        Policy, GeneralLiabilityCoverage, UmbrellaCoverage, WorkersCompPart2, BusinessAutoCoverage
    )

    def _to_dict(model_obj) -> dict:
        if not model_obj:
            return {}
        res = {}
        for col in model_obj.__table__.columns:
            val = getattr(model_obj, col.name)
            res[col.name] = val
        return res

    policies = db.query(Policy).filter(Policy.customer_id == customer_id).all()
    if not policies:
        return {
            "policies": [],
            "policyCoveragesMap": {},
            "firstGl": None,
            "firstUmb": None,
            "firstWc": None,
            "firstBa": None,
        }

    policy_ids = [p.id for p in policies]

    # Query coverages for all policies in 4 parallel/batch queries
    all_gl = db.query(GeneralLiabilityCoverage).filter(GeneralLiabilityCoverage.policy_id.in_(policy_ids)).order_by(GeneralLiabilityCoverage.sortOrder).all()
    all_umb = db.query(UmbrellaCoverage).filter(UmbrellaCoverage.policy_id.in_(policy_ids)).order_by(UmbrellaCoverage.id).all()
    all_wc = db.query(WorkersCompPart2).filter(WorkersCompPart2.policy_id.in_(policy_ids)).all()
    all_ba = db.query(BusinessAutoCoverage).filter(BusinessAutoCoverage.policy_id.in_(policy_ids)).order_by(BusinessAutoCoverage.id).all()

    gl_by_pid = {}
    for item in all_gl:
        d = _to_dict(item)
        if d:
            gl_by_pid.setdefault(item.policy_id, []).append(d)

    umb_by_pid = {}
    for item in all_umb:
        d = _to_dict(item)
        if d:
            umb_by_pid.setdefault(item.policy_id, []).append(d)

    wc_by_pid = {}
    for item in all_wc:
        d = _to_dict(item)
        if d:
            wc_by_pid[item.policy_id] = d

    ba_by_pid = {}
    for item in all_ba:
        d = _to_dict(item)
        if d:
            ba_by_pid.setdefault(item.policy_id, []).append(d)

    formatted_policies = []
    policy_coverages_map = {}

    first_gl = None
    first_umb = None
    first_wc = None
    first_ba = None

    for p in policies:
        p_dict = {
            "id": str(p.id),
            "policyNum": p.policy_num or "",
            "effDate": p.eff_date or "",
            "expDate": p.exp_date or "",
            "type": p.description or p.type or "",
            "status": p.status or "Active",
            "term": p.term or "1 Year",
            "company": p.writing_company or p.parent_company or p.company or "",
        }
        formatted_policies.append(p_dict)

        pol_gl = gl_by_pid.get(p.id, [])
        pol_umb = umb_by_pid.get(p.id, [])
        pol_wc = wc_by_pid.get(p.id, None)
        pol_ba = ba_by_pid.get(p.id, [])

        if p.policy_num:
            policy_coverages_map[p.policy_num] = {
                "effDate": p_dict["effDate"],
                "expDate": p_dict["expDate"],
                "insurerName": p_dict["company"],
                "gl": pol_gl,
                "umb": pol_umb,
                "wc": pol_wc,
                "ba": pol_ba,
            }

        # Select first matching active items with actual limits
        if not first_gl and any(c.get("limit1") for c in pol_gl if isinstance(c, dict)):
            first_gl = {
                "policyNo": p_dict["policyNum"],
                "effDate": p_dict["effDate"],
                "expDate": p_dict["expDate"],
                "coverages": pol_gl,
            }
        if not first_umb and any(c.get("limit1") for c in pol_umb if isinstance(c, dict)):
            first_umb = {
                "policyNo": p_dict["policyNum"],
                "effDate": p_dict["effDate"],
                "expDate": p_dict["expDate"],
                "coverages": pol_umb,
            }
        if not first_wc and isinstance(pol_wc, dict) and (pol_wc.get("eachAccidentLimit") or pol_wc.get("diseasePolicyLimit")):
            first_wc = {
                "policyNo": p_dict["policyNum"],
                "effDate": p_dict["effDate"],
                "expDate": p_dict["expDate"],
                "part2": pol_wc,
            }
        if not first_ba and pol_ba:
            first_ba = {
                "policyNo": p_dict["policyNum"],
                "effDate": p_dict["effDate"],
                "expDate": p_dict["expDate"],
                "coverages": pol_ba,
            }

    return {
        "policies": formatted_policies,
        "policyCoveragesMap": policy_coverages_map,
        "firstGl": first_gl,
        "firstUmb": first_umb,
        "firstWc": first_wc,
        "firstBa": first_ba,
    }
