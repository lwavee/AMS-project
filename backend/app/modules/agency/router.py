from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from sqlalchemy import text, func
from app.database.connection import get_db
from app.modules.auth.deps import require_role, get_current_user
from app.modules.customer.model import Customer, Agency, Agent, AgentInvitation, AgentMailbox, EmailAuditLog
from app.modules.agency.email_service import MicrosoftEmailService
from app.modules.agency.email_security import encrypt_token, decrypt_token
from app.core.config import settings
from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, List, cast, Any
from datetime import date, datetime, timedelta, timezone
import os
import jwt
import uuid
import bcrypt
import json
import logging
import secrets
import re

logger = logging.getLogger(__name__)
router = APIRouter()

# Schema definitions
class AgencyProfileResponse(BaseModel):
    id: int
    name: str
    email: str
    domain: str
    role: str = "agency"
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip: Optional[str] = None
    created_date: Optional[date] = None
    agency_id: Optional[int] = None
    agency_name: Optional[str] = None
    agency_email: Optional[str] = None
    mailbox_status: Optional[str] = "Not Connected"
    mailbox_email: Optional[str] = None
    mailbox_connected_at: Optional[datetime] = None

class AgencyProfileUpdateRequest(BaseModel):
    name: str
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip: Optional[str] = None

class AgentCreateRequest(BaseModel):
    name: str
    password: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None

class AgentResponse(BaseModel):
    id: int
    name: str
    email: str
    created_date: Optional[date] = None

class AgentInvitationCreateRequest(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    location: Optional[str] = None

    @field_validator("name")
    def validate_name(cls, v: str) -> str:
        v = v.strip()
        if not v or len(v) < 2:
            raise ValueError("Full Name is required and must be at least 2 characters.")
        if len(v) > 100:
            raise ValueError("Full Name cannot exceed 100 characters.")
        return v

    @field_validator("email")
    def validate_email(cls, v: str) -> str:
        v = v.strip().lower()
        if not v:
            raise ValueError("Business Email is required.")
        return v

    @field_validator("phone")
    def validate_phone(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v = v.strip()
            if v:
                digits = re.sub(r'\D', '', v)
                if len(digits) < 7 or len(digits) > 15:
                    raise ValueError("Phone number must contain between 7 and 15 digits.")
                return v
        return None

class AgentInvitationResponse(BaseModel):
    id: int
    agency_id: int
    name: str
    email: str
    phone: Optional[str] = None
    location: Optional[str] = None
    status: str
    token: Optional[str] = None
    code: Optional[str] = None
    verification_url: Optional[str] = None
    expires_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    agency_name: Optional[str] = None
    agency_email: Optional[str] = None
    admin_name: Optional[str] = None
    admin_email: Optional[str] = None
    demo_mode: bool = True

class AgentInvitationStatusUpdateRequest(BaseModel):
    status: str

    @field_validator("status")
    def validate_status(cls, v: str) -> str:
        allowed = {"Draft", "Invitation Prepared", "Pending Verification", "Verified", "Expired", "Cancelled"}
        if v not in allowed:
            raise ValueError(f"Invalid status '{v}'. Allowed statuses: {', '.join(sorted(allowed))}")
        return v

class AgentInvitationActivateRequest(BaseModel):
    token: str
    code: str
    password: str
    confirm_password: str

    @field_validator("token")
    def validate_token(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Token is required.")
        return v

    @field_validator("code")
    def validate_code(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Verification code is required.")
        return v

    @field_validator("password")
    def validate_password(cls, v: str) -> str:
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters long.")
        return v

class EmailAttachmentPayload(BaseModel):
    name: str
    content_bytes_b64: str
    content_type: str = "application/pdf"

    @field_validator("name")
    def validate_name(cls, v: str) -> str:
        name = v.strip()
        if not name:
            raise ValueError("Attachment filename cannot be empty.")
        if len(name) > 255:
            raise ValueError("Attachment filename is too long.")
        return name

    @field_validator("content_bytes_b64")
    def validate_content_size(cls, v: str) -> str:
        v_clean = v.strip()
        if not v_clean:
            raise ValueError("Attachment content cannot be empty.")
        # Check base64 size: Graph sendMail payload limit is 4MB total.
        raw_size = (len(v_clean) * 3) // 4
        MAX_ATTACHMENT_SIZE = 3_500_000  # 3.5 MB
        if raw_size > MAX_ATTACHMENT_SIZE:
            raise ValueError(
                f"Attachment exceeds safe Microsoft Graph size limit ({raw_size // 1024} KB). "
                f"Maximum allowed size for direct send is {MAX_ATTACHMENT_SIZE // (1024 * 1024)} MB."
            )
        return v_clean


class SendEmailRequest(BaseModel):
    recipient_email: str
    subject: str
    body_html: str
    attachments: Optional[List[EmailAttachmentPayload]] = None
    customer_id: Optional[int] = None
    policy_id: Optional[int] = None
    cc_email: Optional[str] = None
    bcc_email: Optional[str] = None

    @field_validator("recipient_email")
    def validate_recipient(cls, v: str) -> str:
        v_clean = v.strip()
        if not v_clean or "@" not in v_clean:
            raise ValueError("A valid recipient email address is required.")
        return v_clean

    @field_validator("subject")
    def validate_subject(cls, v: str) -> str:
        s = v.strip()
        if not s:
            raise ValueError("Subject cannot be empty.")
        return s

# Dependencies
agency_or_admin_dependency = Depends(require_role(["agency", "admin", "agent"]))
agency_only_dependency = Depends(require_role(["agency"]))

@router.get("/reports", dependencies=[agency_or_admin_dependency])
def get_reports(db: Session = Depends(get_db)):
    try:
        counts = db.execute(text(
            "select "
            "count(*) as total_customers, "
            "sum(case when status = 'Active' then 1 else 0 end) as active_customers, "
            "sum(case when status = 'Inactive' then 1 else 0 end) as inactive_customers, "
            "sum(case when type = 'Commercial' then 1 else 0 end) as commercial_customers, "
            "sum(case when type = 'Personal' then 1 else 0 end) as personal_customers "
            "from customers"
        )).mappings().first()

        if not counts:
            counts = {
                "total_customers": 0,
                "active_customers": 0,
                "inactive_customers": 0,
                "commercial_customers": 0,
                "personal_customers": 0
            }

        state_result = db.execute(text(
            "select state, count(*) as count from customers "
            "where state is not null and state != '' "
            "group by state "
            "order by count desc "
            "limit 5"
        ))
        state_distribution = {row[0]: row[1] for row in state_result}
        total_policies = 0
        try:
            total_policies = db.execute(text("select count(*) from policies")).scalar() or 0
        except Exception:
            pass
        total_agents = 0
        try:
            total_agents = db.execute(text("select count(*) from agents")).scalar() or 0
        except Exception:
            pass

        return {
            "total_customers": counts["total_customers"] or 0,
            "active_customers": counts["active_customers"] or 0,
            "inactive_customers": counts["inactive_customers"] or 0,
            "total_agents": total_agents,
            "total_policies": total_policies,
            "type_distribution": {
                "Commercial": counts["commercial_customers"] or 0,
                "Personal": counts["personal_customers"] or 0
            },
            "state_distribution": state_distribution
        }
    except Exception as e:
        logger.error(f"Failed to generate reports: {e}")
        return {
            "total_customers": 0,
            "active_customers": 0,
            "inactive_customers": 0,
            "type_distribution": {
                "Commercial": 0,
                "Personal": 0
            },
            "state_distribution": {}
        }

@router.get("/profile", response_model=AgencyProfileResponse)
def get_profile(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    user_id = str(current_user.get("id")) if current_user.get("id") else None
    user_email = (current_user.get("email") or "").strip().lower()
    user_role = (current_user.get("role") or "").strip().lower()

    # 1. Check if user is an Agent
    agent = None
    if user_role == "agent" or not user_role or user_role != "agency":
        if user_id:
            agent = db.query(Agent).filter(Agent.user_id == user_id).first()
        if not agent and user_email:
            agent = db.query(Agent).filter(func.lower(Agent.email) == user_email).first()

    if agent:
        agency = db.query(Agency).filter(Agency.id == agent.agency_id).first() if agent.agency_id else None
        mailbox = db.query(AgentMailbox).filter(AgentMailbox.agent_id == agent.id).first()
        if not mailbox and agent.email:
            mailbox = db.query(AgentMailbox).filter(func.lower(AgentMailbox.email) == agent.email.lower()).first()

        has_token = bool(mailbox and mailbox.encrypted_refresh_token)
        mb_status = mailbox.status if (mailbox and has_token) else "Not Connected"
        domain = agent.email.split("@")[-1] if "@" in agent.email else "capco.com"

        return AgencyProfileResponse(
            id=agent.id,
            name=agent.name,
            email=agent.email,
            domain=domain,
            role="agent",
            phone=agency.phone if agency else None,
            address=agency.address if agency else None,
            city=agency.city if agency else None,
            state=agency.state if agency else None,
            zip=agency.zip if agency else None,
            created_date=agent.created_date,
            agency_id=agency.id if agency else None,
            agency_name=agency.name if agency else "Sterling Insurance Agency",
            agency_email=agency.email if agency else None,
            mailbox_status=mb_status,
            mailbox_email=mailbox.email if mailbox else agent.email,
            mailbox_connected_at=mailbox.connected_at if mailbox else None
        )

    # 2. Otherwise Agency profile
    agency = None
    if user_id:
        agency = db.query(Agency).filter(Agency.user_id == user_id).first()
    if not agency and user_email:
        agency = db.query(Agency).filter(func.lower(Agency.email) == user_email).first()

    if not agency:
        # Create a default record for this logged-in agency account if it somehow doesn't exist
        agency = Agency(
            name=user_email.split("@")[0].capitalize() + " Agency" if user_email else "Sterling Agency",
            email=user_email,
            user_id=user_id
        )
        db.add(agency)
        db.commit()
        db.refresh(agency)

    agency_any: Any = agency
    domain = agency_any.email.split("@")[-1] if "@" in agency_any.email else "capco.com"

    mailbox = db.query(AgentMailbox).filter(func.lower(AgentMailbox.email) == agency_any.email.lower()).first()
    has_token = bool(mailbox and mailbox.encrypted_refresh_token)
    mb_status = mailbox.status if (mailbox and has_token) else "Not Connected"

    return AgencyProfileResponse(
        id=agency_any.id,
        name=agency_any.name,
        email=agency_any.email,
        domain=domain,
        role="agency",
        phone=agency_any.phone,
        address=agency_any.address,
        city=agency_any.city,
        state=agency_any.state,
        zip=agency_any.zip,
        created_date=agency_any.created_date,
        agency_id=agency_any.id,
        agency_name=agency_any.name,
        agency_email=agency_any.email,
        mailbox_status=mb_status,
        mailbox_email=mailbox.email if mailbox else agency_any.email,
        mailbox_connected_at=mailbox.connected_at if mailbox else None
    )

@router.put("/profile", response_model=AgencyProfileResponse)
def update_profile(req: AgencyProfileUpdateRequest, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    user_id = str(current_user.get("id")) if current_user.get("id") else None
    user_email = (current_user.get("email") or "").strip().lower()
    user_role = (current_user.get("role") or "").strip().lower()

    # 1. Check if user is an Agent
    agent = None
    if user_role == "agent" or not user_role or user_role != "agency":
        if user_id:
            agent = db.query(Agent).filter(Agent.user_id == user_id).first()
        if not agent and user_email:
            agent = db.query(Agent).filter(func.lower(Agent.email) == user_email).first()

    if agent:
        if req.name and req.name.strip():
            setattr(agent, "name", req.name.strip())
        db.commit()
        db.refresh(agent)

        agency = db.query(Agency).filter(Agency.id == agent.agency_id).first() if agent.agency_id else None
        mailbox = db.query(AgentMailbox).filter(AgentMailbox.agent_id == agent.id).first()
        has_token = bool(mailbox and mailbox.encrypted_refresh_token)
        domain = agent.email.split("@")[-1] if "@" in agent.email else "capco.com"

        return AgencyProfileResponse(
            id=agent.id,
            name=agent.name,
            email=agent.email,
            domain=domain,
            role="agent",
            phone=agency.phone if agency else None,
            address=agency.address if agency else None,
            city=agency.city if agency else None,
            state=agency.state if agency else None,
            zip=agency.zip if agency else None,
            created_date=agent.created_date,
            agency_id=agency.id if agency else None,
            agency_name=agency.name if agency else "Sterling Insurance Agency",
            agency_email=agency.email if agency else None,
            mailbox_status=mailbox.status if (mailbox and has_token) else "Not Connected",
            mailbox_email=mailbox.email if mailbox else agent.email,
            mailbox_connected_at=mailbox.connected_at if mailbox else None
        )

    # 2. Agency update
    agency = None
    if user_id:
        agency = db.query(Agency).filter(Agency.user_id == user_id).first()
    if not agency and user_email:
        agency = db.query(Agency).filter(func.lower(Agency.email) == user_email).first()

    if not agency:
        raise HTTPException(status_code=404, detail="Agency profile not found")

    setattr(agency, "name", req.name)
    setattr(agency, "phone", req.phone)
    setattr(agency, "address", req.address)
    setattr(agency, "city", req.city)
    setattr(agency, "state", req.state)
    setattr(agency, "zip", req.zip)

    db.commit()
    db.refresh(agency)

    agency_any: Any = agency
    domain = agency_any.email.split("@")[-1] if "@" in agency_any.email else "capco.com"
    mailbox = db.query(AgentMailbox).filter(func.lower(AgentMailbox.email) == agency_any.email.lower()).first()
    has_token = bool(mailbox and mailbox.encrypted_refresh_token)

    return AgencyProfileResponse(
        id=agency_any.id,
        name=agency_any.name,
        email=agency_any.email,
        domain=domain,
        role="agency",
        phone=agency_any.phone,
        address=agency_any.address,
        city=agency_any.city,
        state=agency_any.state,
        zip=agency_any.zip,
        created_date=agency_any.created_date,
        agency_id=agency_any.id,
        agency_name=agency_any.name,
        agency_email=agency_any.email,
        mailbox_status=mailbox.status if (mailbox and has_token) else "Not Connected",
        mailbox_email=mailbox.email if mailbox else agency_any.email,
        mailbox_connected_at=mailbox.connected_at if mailbox else None
    )

@router.get("/agents", response_model=List[AgentResponse])
def list_agents(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    user_id = str(current_user.get("id")) if current_user.get("id") else None
    user_email = (current_user.get("email") or "").strip().lower()

    agency = None
    if user_id:
        agency = db.query(Agency).filter(Agency.user_id == user_id).first()
    if not agency and user_email:
        agency = db.query(Agency).filter(func.lower(Agency.email) == user_email).first()

    if not agency:
        # Check if caller is an agent belonging to an agency
        agent = None
        if user_id:
            agent = db.query(Agent).filter(Agent.user_id == user_id).first()
        if not agent and user_email:
            agent = db.query(Agent).filter(func.lower(Agent.email) == user_email).first()
        if agent and agent.agency_id:
            agency = db.query(Agency).filter(Agency.id == agent.agency_id).first()

    if not agency:
        return []

    # Auto-sync any invitations under this agency that do not yet have an Agent row
    try:
        pending_invs = db.query(AgentInvitation).filter(
            AgentInvitation.agency_id == agency.id,
            AgentInvitation.status.in_(["Draft", "Invitation Prepared", "Pending Verification", "Verified"])
        ).all()
        for inv in pending_invs:
            inv_email = inv.email.strip().lower()
            found_agent = db.query(Agent).filter(
                func.lower(Agent.email) == inv_email,
                Agent.agency_id == agency.id
            ).first()
            if not found_agent:
                db.add(Agent(
                    name=inv.name.strip(),
                    email=inv_email,
                    agency_id=agency.id,
                    created_date=inv.created_at.date() if inv.created_at else date.today()
                ))
                db.commit()
    except Exception as e:
        logger.warning(f"Failed to auto-sync pending invitations to agents: {e}")
        db.rollback()

    agents: List[Any] = db.query(Agent).filter(Agent.agency_id == agency.id).order_by(Agent.name.asc()).all()
    return [
        AgentResponse(
            id=a.id,
            name=a.name,
            email=a.email,
            created_date=a.created_date
        ) for a in agents
    ]

@router.post("/agents", response_model=AgentResponse, dependencies=[agency_only_dependency])
def create_agent(req: AgentCreateRequest, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    agency = db.query(Agency).filter(Agency.user_id == current_user["id"]).first()
    if not agency:
        agency = db.query(Agency).filter(Agency.email == current_user["email"]).first()
        if not agency:
            raise HTTPException(status_code=404, detail="Agency profile not found. Cannot add agent.")
            
    # Extract domain from agency email
    domain = agency.email.split("@")[-1] if "@" in agency.email else "capco.com"
    
    # Deriving or using provided agent's email
    if req.email and req.email.strip():
        agent_email = req.email.strip().lower()
    else:
        username = req.name.lower().strip().replace(" ", "")
        agent_email = f"{username}@{domain}"
    
    # Check if agent email already exists in auth.users or users
    user_exists = False
    try:
        user_exists = db.execute(
            text("select id from auth.users where email = :email"),
            {"email": agent_email}
        ).first() is not None
    except Exception:
        pass
        
    if not user_exists:
        try:
            user_exists = db.execute(
                text("select id from users where email = :email"),
                {"email": agent_email}
            ).first() is not None
        except Exception:
            pass
            
    if user_exists:
        raise HTTPException(status_code=400, detail=f"Agent with email '{agent_email}' already exists.")
        
    # Create Agent user credentials in auth.users or users
    new_user_id = str(uuid.uuid4())
    meta_str = json.dumps({"role": "agent", "full_name": req.name})
    
    # Hash password in python
    salt = bcrypt.gensalt()
    password_to_hash = req.password if req.password else secrets.token_urlsafe(16)
    hashed_password = bcrypt.hashpw(password_to_hash.encode('utf-8'), salt).decode('utf-8')
    
    user_inserted = False
    try:
        db.execute(
            text("""
                insert into auth.users (id, email, encrypted_password, raw_user_meta_data, email_confirmed_at, role, aud)
                values (:id, :email, :password, :meta, now(), 'agent', 'authenticated')
            """),
            {"id": new_user_id, "email": agent_email, "password": hashed_password, "meta": meta_str}
        )
        user_inserted = True
    except Exception as e:
        logger.warning(f"Could not insert agent into auth.users: {e}. Trying public.users fallback.")
        db.rollback()
        
    if not user_inserted:
        try:
            db.execute(
                text("""
                    insert into users (id, email, encrypted_password, raw_user_meta_data, email_confirmed_at, role, aud)
                    values (:id, :email, :password, :meta, :confirmed_at, 'agent', 'authenticated')
                """),
                {
                    "id": new_user_id,
                    "email": agent_email,
                    "password": hashed_password,
                    "meta": meta_str,
                    "confirmed_at": datetime.now()
                }
            )
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to insert agent user credentials: {e}")
            raise HTTPException(status_code=500, detail="Failed to create agent credentials in database.")
            
    # Insert Agent row
    try:
        new_agent = Agent(name=req.name, email=agent_email, agency_id=agency.id, user_id=new_user_id)
        db.add(new_agent)
        db.commit()
        db.refresh(new_agent)
    except Exception as e:
        db.rollback()
        # Clean up created user credentials to maintain consistency
        try:
            db.execute(text("delete from auth.users where id = :id"), {"id": new_user_id})
        except Exception:
            pass
        try:
            db.execute(text("delete from users where id = :id"), {"id": new_user_id})
        except Exception:
            pass
        db.commit()
        logger.error(f"Failed to create Agent record: {e}")
        raise HTTPException(status_code=500, detail="Failed to create agent profile.")
        
    new_agent_any: Any = new_agent
    return AgentResponse(
        id=new_agent_any.id,
        name=new_agent_any.name,
        email=new_agent_any.email,
        created_date=new_agent_any.created_date
    )

@router.delete("/agents/{agent_id}", dependencies=[agency_only_dependency])
def delete_agent(agent_id: int, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    agency = db.query(Agency).filter(Agency.user_id == current_user["id"]).first()
    if not agency:
        agency = db.query(Agency).filter(Agency.email == current_user["email"]).first()
        if not agency:
            raise HTTPException(status_code=404, detail="Agency profile not found")
            
    agent = db.query(Agent).filter(Agent.id == agent_id, Agent.agency_id == agency.id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found under this Agency")
        
    # Delete from auth.users or users if user_id exists
    if agent.user_id:
        try:
            db.execute(text("delete from auth.users where id = :id"), {"id": agent.user_id})
        except Exception:
            pass
        try:
            db.execute(text("delete from users where id = :id"), {"id": agent.user_id})
        except Exception:
            pass
            
    try:
        try:
            db.execute(text("delete from agent_invitations where lower(email) = :email and agency_id = :agency_id"), {"email": agent.email.lower(), "agency_id": agency.id})
        except Exception:
            pass
            
        db.delete(agent)
        db.commit()
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to delete agent: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete agent profile.")
        
    return {"message": "Agent deleted successfully"}


# =========================================================================
# Agent Invitation Workflow Endpoints (Demo Mode)
# =========================================================================

def _format_invitation_response(inv: AgentInvitation, agency: Agency, current_user: Optional[dict] = None) -> AgentInvitationResponse:
    frontend_base = settings.FRONTEND_URL.rstrip('/') if settings.FRONTEND_URL else "http://localhost:3000"
    verification_url = f"{frontend_base}/verify-invitation?token={inv.token}&demo=true" if inv.token else None

    admin_name = agency.name
    admin_email = agency.email
    if current_user and current_user.get("email"):
        admin_email = current_user.get("email")

    return AgentInvitationResponse(
        id=inv.id,
        agency_id=inv.agency_id,
        name=inv.name,
        email=inv.email,
        phone=inv.phone,
        location=inv.location,
        status=inv.status,
        token=inv.token,
        code=inv.code,
        verification_url=verification_url,
        expires_at=inv.expires_at,
        created_at=inv.created_at,
        agency_name=agency.name,
        agency_email=agency.email,
        admin_name=admin_name,
        admin_email=admin_email,
        demo_mode=True
    )

@router.post("/invitations", response_model=AgentInvitationResponse, dependencies=[agency_only_dependency])
def create_agent_invitation(
    req: AgentInvitationCreateRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Creates an Agent Invitation in DEMO MODE.
    Validates agent details, ensures email uniqueness across auth tables, agents,
    and active invitations, and prepares the invitation while adding the agent to the team roster.
    """
    # Enforce Agency Admin multi-tenant isolation
    agency = db.query(Agency).filter(Agency.user_id == current_user["id"]).first()
    if not agency:
        agency = db.query(Agency).filter(Agency.email == current_user["email"]).first()
        if not agency:
            raise HTTPException(status_code=404, detail="Agency profile not found. Cannot invite agent.")

    agent_email = req.email.strip().lower()

    # Compute location
    location = None
    if req.location and req.location.strip():
        location = req.location.strip()
    elif req.city or req.state:
        parts = [p.strip() for p in [req.city, req.state] if p and p.strip()]
        location = ", ".join(parts) if parts else None

    # Check if an invitation already exists for this agency
    existing_agency_inv = db.query(AgentInvitation).filter(
        func.lower(AgentInvitation.email) == agent_email,
        AgentInvitation.agency_id == agency.id
    ).first()

    existing_agent = db.query(Agent).filter(
        func.lower(Agent.email) == agent_email,
        Agent.agency_id == agency.id
    ).first()

    if existing_agency_inv:
        # Re-using / updating existing invitation for this agency
        existing_agency_inv.name = req.name.strip()
        if req.phone:
            existing_agency_inv.phone = req.phone.strip()
        if location:
            existing_agency_inv.location = location
        existing_agency_inv.status = "Pending Verification"
        existing_agency_inv.updated_at = datetime.now(timezone.utc)

        if not existing_agent:
            new_agent = Agent(
                name=req.name.strip(),
                email=agent_email,
                agency_id=agency.id,
                created_date=date.today()
            )
            db.add(new_agent)
        else:
            existing_agent.name = req.name.strip()

        db.commit()
        db.refresh(existing_agency_inv)
        return _format_invitation_response(existing_agency_inv, agency, current_user)

    # Check if agent email is already registered under another agency
    other_agency_agent = db.query(Agent).filter(
        func.lower(Agent.email) == agent_email,
        Agent.agency_id != agency.id
    ).first()
    if other_agency_agent:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"An agent with email '{agent_email}' is already registered with another agency."
        )

    # Cryptographically secure URL-safe token for demo verification
    token = secrets.token_urlsafe(32)
    # 6-digit numeric verification code to include in email
    code = f"{secrets.randbelow(900000) + 100000}"
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)

    # 1. Ensure Agent record is created immediately so agent appears in active team roster
    if not existing_agent:
        try:
            new_agent = Agent(
                name=req.name.strip(),
                email=agent_email,
                agency_id=agency.id,
                created_date=date.today()
            )
            db.add(new_agent)
            db.commit()
        except Exception as e:
            logger.warning(f"Could not create Agent record on invitation: {e}")
            db.rollback()

    # 2. Create the invitation record
    invitation = AgentInvitation(
        agency_id=agency.id,
        name=req.name.strip(),
        email=agent_email,
        phone=req.phone.strip() if req.phone else None,
        location=location,
        status="Invitation Prepared",
        token=token,
        code=code,
        expires_at=expires_at,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )

    try:
        db.add(invitation)
        db.commit()
        db.refresh(invitation)
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to persist agent invitation: {e}")
        raise HTTPException(status_code=500, detail="Failed to save agent invitation.")

    return _format_invitation_response(invitation, agency, current_user)

@router.get("/invitations", response_model=List[AgentInvitationResponse], dependencies=[agency_only_dependency])
def list_agent_invitations(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns all invitations issued by the current agency.
    """
    agency = db.query(Agency).filter(Agency.user_id == current_user["id"]).first()
    if not agency:
        agency = db.query(Agency).filter(Agency.email == current_user["email"]).first()
        if not agency:
            return []

    invitations = db.query(AgentInvitation).filter(
        AgentInvitation.agency_id == agency.id
    ).order_by(AgentInvitation.created_at.desc()).all()

    return [_format_invitation_response(inv, agency, current_user) for inv in invitations]

@router.patch("/invitations/{invitation_id}/status", response_model=AgentInvitationResponse, dependencies=[agency_only_dependency])
def update_invitation_status(
    invitation_id: int,
    req: AgentInvitationStatusUpdateRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Updates status of an invitation for the agency (e.g. to 'Pending Verification' upon opening Outlook).
    """
    agency = db.query(Agency).filter(Agency.user_id == current_user["id"]).first()
    if not agency:
        agency = db.query(Agency).filter(Agency.email == current_user["email"]).first()
        if not agency:
            raise HTTPException(status_code=404, detail="Agency profile not found")

    invitation = db.query(AgentInvitation).filter(
        AgentInvitation.id == invitation_id,
        AgentInvitation.agency_id == agency.id
    ).first()
    if not invitation:
        raise HTTPException(status_code=404, detail="Invitation not found under this Agency")

    invitation.status = req.status
    invitation.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(invitation)

    return _format_invitation_response(invitation, agency, current_user)

@router.delete("/invitations/{invitation_id}", dependencies=[agency_only_dependency])
def delete_invitation(
    invitation_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Deletes or cancels an invitation under the agency.
    """
    agency = db.query(Agency).filter(Agency.user_id == current_user["id"]).first()
    if not agency:
        agency = db.query(Agency).filter(Agency.email == current_user["email"]).first()
        if not agency:
            raise HTTPException(status_code=404, detail="Agency profile not found")

    invitation = db.query(AgentInvitation).filter(
        AgentInvitation.id == invitation_id,
        AgentInvitation.agency_id == agency.id
    ).first()
    if not invitation:
        raise HTTPException(status_code=404, detail="Invitation not found under this Agency")

    try:
        db.execute(
            text("delete from agents where lower(email) = :email and agency_id = :agency_id and user_id is null"),
            {"email": invitation.email.lower(), "agency_id": agency.id}
        )
    except Exception:
        pass

    db.delete(invitation)
    db.commit()
    return {"message": "Invitation deleted successfully"}

@router.get("/invitations/verify")
def verify_invitation_token(
    token: str = Query(..., min_length=10),
    db: Session = Depends(get_db)
):
    """
    Public demo verification endpoint preparing for Phase 2.
    Validates token integrity and expiry, returning clear status without premature activation.
    """
    invitation = db.query(AgentInvitation).filter(AgentInvitation.token == token).first()
    if not invitation:
        raise HTTPException(status_code=404, detail="Invalid or non-existent invitation token.")

    if invitation.status == "Cancelled":
        raise HTTPException(status_code=400, detail="This invitation has been cancelled. Please request a new invitation.")

    if invitation.expires_at:
        exp = invitation.expires_at if invitation.expires_at.tzinfo else invitation.expires_at.replace(tzinfo=timezone.utc)
        if datetime.now(timezone.utc) > exp:
            if invitation.status != "Expired":
                invitation.status = "Expired"
                db.commit()
            raise HTTPException(status_code=400, detail="This invitation link has expired. Please contact your agency administrator.")

    agency = db.query(Agency).filter(Agency.id == invitation.agency_id).first()
    agency_name = agency.name if agency else "Sterling Agency"

    # Ensure invitation has a 6-digit code
    if not invitation.code:
        invitation.code = f"{secrets.randbelow(900000) + 100000}"
        try:
            db.commit()
            db.refresh(invitation)
        except Exception:
            db.rollback()

    return {
        "valid": True,
        "demo_mode": True,
        "status": invitation.status,
        "invitation_id": invitation.id,
        "name": invitation.name,
        "email": invitation.email,
        "phone": invitation.phone,
        "location": invitation.location,
        "agency_name": agency_name,
        "code": invitation.code,
        "created_at": invitation.created_at,
        "expires_at": invitation.expires_at,
        "message": (
            "Demo invitation verification link is valid. Enter your verification code and set your password to activate your account."
        )
    }

@router.post("/invitations/activate")
def activate_agent_account(
    req: AgentInvitationActivateRequest,
    db: Session = Depends(get_db)
):
    """
    Validates token, code, and sets password, then activates agent account and marks invitation as Verified.
    """
    if req.password != req.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match.")

    invitation = db.query(AgentInvitation).filter(AgentInvitation.token == req.token).first()
    if not invitation:
        raise HTTPException(status_code=404, detail="Invalid invitation token.")

    if invitation.status == "Cancelled":
        raise HTTPException(status_code=400, detail="This invitation has been cancelled. Please request a new invitation.")

    if invitation.expires_at:
        exp = invitation.expires_at if invitation.expires_at.tzinfo else invitation.expires_at.replace(tzinfo=timezone.utc)
        if datetime.now(timezone.utc) > exp:
            raise HTTPException(status_code=400, detail="This invitation link has expired. Please request a new invitation.")

    # Ensure invitation has a 6-digit verification code
    if not invitation.code:
        invitation.code = f"{secrets.randbelow(900000) + 100000}"
        try:
            db.commit()
            db.refresh(invitation)
        except Exception:
            db.rollback()

    # Validate verification code strictly
    if not req.code or req.code.strip() != invitation.code.strip():
        raise HTTPException(
            status_code=400,
            detail="Verification code is incorrect. Please check the code sent in your invitation email."
        )

    agent_email = invitation.email.strip().lower()

    # Look up user existence
    user_exists = False
    existing_user_id = None
    try:
        user_row = db.execute(
            text("select id from auth.users where lower(email) = :email"),
            {"email": agent_email}
        ).first()
        if user_row:
            user_exists = True
            existing_user_id = str(user_row.id)
    except Exception:
        pass

    if not user_exists:
        try:
            user_row = db.execute(
                text("select id from users where lower(email) = :email"),
                {"email": agent_email}
            ).first()
            if user_row:
                user_exists = True
                existing_user_id = str(user_row.id)
        except Exception:
            pass

    # Hash new password
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(req.password.encode('utf-8'), salt).decode('utf-8')
    meta_str = json.dumps({"role": "agent", "full_name": invitation.name})

    if user_exists and existing_user_id:
        new_user_id = existing_user_id
        # Update existing credentials
        try:
            db.execute(
                text("update auth.users set encrypted_password = :pwd, raw_user_meta_data = :meta where id = :id"),
                {"pwd": hashed_password, "meta": meta_str, "id": new_user_id}
            )
        except Exception:
            pass
        try:
            db.execute(
                text("update users set encrypted_password = :pwd, raw_user_meta_data = :meta where id = :id"),
                {"pwd": hashed_password, "meta": meta_str, "id": new_user_id}
            )
        except Exception:
            pass
    else:
        new_user_id = str(uuid.uuid4())
        user_inserted = False
        try:
            db.execute(
                text("""
                    insert into auth.users (id, email, encrypted_password, raw_user_meta_data, email_confirmed_at, role, aud)
                    values (:id, :email, :password, :meta, now(), 'agent', 'authenticated')
                """),
                {"id": new_user_id, "email": agent_email, "password": hashed_password, "meta": meta_str}
            )
            user_inserted = True
        except Exception as e:
            logger.warning(f"Could not insert agent into auth.users: {e}. Trying public.users fallback.")
            db.rollback()

        if not user_inserted:
            try:
                db.execute(
                    text("""
                        insert into users (id, email, encrypted_password, raw_user_meta_data, email_confirmed_at, role, aud)
                        values (:id, :email, :password, :meta, :confirmed_at, 'agent', 'authenticated')
                    """),
                    {
                        "id": new_user_id,
                        "email": agent_email,
                        "password": hashed_password,
                        "meta": meta_str,
                        "confirmed_at": datetime.now()
                    }
                )
            except Exception as e:
                db.rollback()
                logger.error(f"Failed to create agent user credentials: {e}")
                raise HTTPException(status_code=500, detail="Failed to create agent credentials in database.")

    # Create Agent profile if not exists
    existing_agent = db.query(Agent).filter(func.lower(Agent.email) == agent_email).first()
    if not existing_agent:
        new_agent = Agent(
            name=invitation.name,
            email=agent_email,
            agency_id=invitation.agency_id,
            user_id=new_user_id
        )
        db.add(new_agent)
    else:
        existing_agent.user_id = new_user_id

    invitation.status = "Verified"
    invitation.updated_at = datetime.now(timezone.utc)
    db.commit()

    # Create JWT access token
    ALGORITHM = os.getenv("ALGORITHM", "HS256")
    expire = datetime.now(timezone.utc) + timedelta(minutes=43200)
    payload = {
        "sub": new_user_id,
        "email": agent_email,
        "role": "agent",
        "exp": expire
    }
    access_token = jwt.encode(payload, settings.SECRET_KEY, algorithm=ALGORITHM)

    agency = db.query(Agency).filter(Agency.id == invitation.agency_id).first()
    agency_name = agency.name if agency else "Sterling Agency"

    return {
        "success": True,
        "message": "Account successfully verified and activated! Please connect your Outlook mailbox.",
        "email": agent_email,
        "name": invitation.name,
        "agency_name": agency_name,
        "access_token": access_token,
        "role": "agent"
    }


# =========================================================================
# Business Mailbox Connection & OAuth Integration Endpoints (Task 5 & 7)
# Visible Agent-Facing Button: "Connect Email" (provider-neutral)
# =========================================================================

@router.get("/mail/status")
def get_mailbox_status(
    email: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Returns current mailbox connection status.
    States: Not Connected, Connecting, Connected, Connection Expired, Connection Error.
    If OAuth credentials are not configured, returns clear configuration message.
    """
    configured = MicrosoftEmailService.is_configured()
    target_email = email.strip().lower() if email else ""

    if not target_email:
        return {
            "configured": configured,
            "provider": "microsoft",
            "status": "Not Connected",
            "has_token": False,
            "email": None,
            "display_name": None,
            "connected_at": None,
            "message": "Mailbox is not connected."
        }

    # Strictly find the specific agent's own mailbox
    agent = db.query(Agent).filter(func.lower(Agent.email) == target_email).first()
    mailbox = None
    if agent:
        mailbox = db.query(AgentMailbox).filter(AgentMailbox.agent_id == agent.id).first()
    if not mailbox:
        mailbox = db.query(AgentMailbox).filter(func.lower(AgentMailbox.email) == target_email).first()

    if not mailbox:
        return {
            "configured": configured,
            "provider": "microsoft",
            "status": "Not Connected",
            "has_token": False,
            "email": target_email,
            "display_name": None,
            "connected_at": None,
            "message": f"Mailbox for {target_email} is not connected."
        }

    has_token = bool(mailbox.encrypted_refresh_token)
    effective_status = mailbox.status if has_token else "Not Connected"

    return {
        "configured": configured,
        "provider": mailbox.provider,
        "status": effective_status,
        "has_token": has_token,
        "email": mailbox.email,
        "display_name": mailbox.display_name,
        "connected_at": mailbox.connected_at.isoformat() if mailbox.connected_at else None,
        "last_error": mailbox.last_error,
        "message": (
            f"Successfully connected to business mailbox: {mailbox.email}"
            if has_token and mailbox.status == "Connected"
            else f"Mailbox for {mailbox.email} requires Microsoft Outlook authorization."
        )
    }


@router.get("/mail/oauth/authorize")
def authorize_mailbox_oauth(
    email: str = Query(...),
    db: Session = Depends(get_db)
):
    """
    Initiates Microsoft OAuth 2.0 authorization code flow.
    Rejects with 400 if credentials are unconfigured without faking a connection.
    """
    if not MicrosoftEmailService.is_configured():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Microsoft OAuth 2.0 is not configured on the server. "
                "Please configure MICROSOFT_CLIENT_ID and MICROSOFT_CLIENT_SECRET in backend environment variables."
            )
        )

    target_email = email.strip().lower()
    agent = db.query(Agent).filter(func.lower(Agent.email) == target_email).first()
    if not agent:
        agency = db.query(Agency).filter(func.lower(Agency.email) == target_email).first()
        if agency:
            agent = db.query(Agent).filter(Agent.agency_id == agency.id).first()
        if not agent:
            agency = db.query(Agency).first()
            agency_id = agency.id if agency else 1
            agent = Agent(name=target_email.split('@')[0], email=target_email, agency_id=agency_id)
            db.add(agent)
            db.commit()
            db.refresh(agent)

    state_payload = {
        "agent_id": agent.id,
        "agency_id": agent.agency_id,
        "email": target_email,
        "nonce": secrets.token_hex(16),
        "exp": datetime.now(timezone.utc) + timedelta(minutes=15)
    }
    state_token = jwt.encode(state_payload, settings.SECRET_KEY, algorithm="HS256")
    auth_url = MicrosoftEmailService.get_authorization_url(agent.id, agent.agency_id, state_token, login_hint=target_email)

    return {
        "authorize_url": auth_url,
        "state": state_token,
        "provider": "microsoft"
    }


@router.post("/mail/sandbox-connect")
def sandbox_connect_mailbox(
    email: str = Query(...),
    db: Session = Depends(get_db)
):
    """
    Connects mailbox in sandbox/dev mode when OAuth credentials are not configured
    or during development/demo testing.
    """
    target_email = email.strip().lower()
    agent = db.query(Agent).filter(func.lower(Agent.email) == target_email).first()
    agency_id = agent.agency_id if agent else 1
    agent_id = agent.id if agent else 1
    display_name = agent.name if agent else target_email.split("@")[0]

    mailbox = db.query(AgentMailbox).filter(
        (AgentMailbox.agent_id == agent_id) | (func.lower(AgentMailbox.email) == target_email)
    ).first()

    now = datetime.now(timezone.utc)
    if not mailbox:
        mailbox = AgentMailbox(
            agent_id=agent_id,
            agency_id=agency_id,
            provider="microsoft",
            email=target_email,
            display_name=display_name,
            status="Connected",
            scopes="openid profile offline_access User.Read Mail.Send (Sandbox)",
            connected_at=now,
            updated_at=now,
            expires_at=now + timedelta(days=365)
        )
        db.add(mailbox)
    else:
        mailbox.email = target_email
        mailbox.display_name = display_name
        mailbox.status = "Connected"
        mailbox.last_error = None
        mailbox.scopes = "openid profile offline_access User.Read Mail.Send (Sandbox)"
        mailbox.connected_at = now
        mailbox.updated_at = now
        mailbox.expires_at = now + timedelta(days=365)

    db.commit()
    db.refresh(mailbox)

    return {
        "success": True,
        "status": "Connected",
        "email": mailbox.email,
        "display_name": mailbox.display_name,
        "provider": "microsoft",
        "mode": "sandbox",
        "message": f"Successfully connected {mailbox.email} in Sandbox/Demo mode."
    }


@router.get("/mail/oauth/callback")
async def mailbox_oauth_callback(
    code: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    error: Optional[str] = Query(None),
    error_description: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Handles OAuth 2.0 callback from Microsoft.
    Retrieves and validates mailbox identity, encrypts refresh token at rest, and redirects to frontend.
    """
    frontend_base = settings.FRONTEND_URL.rstrip('/') if settings.FRONTEND_URL else "http://localhost:3000"

    if error:
        logger.error(f"OAuth callback error from Microsoft: {error} - {error_description}")
        return RedirectResponse(
            url=f"{frontend_base}/verify-invitation?mail_status=error&error_msg={error_description or error}"
        )

    if not code or not state:
        return RedirectResponse(
            url=f"{frontend_base}/verify-invitation?mail_status=error&error_msg=Missing+code+or+state"
        )

    try:
        decoded_state = jwt.decode(state, settings.SECRET_KEY, algorithms=["HS256"])
        agent_id = decoded_state["agent_id"]
        agency_id = decoded_state["agency_id"]
        expected_email = decoded_state.get("email", "").strip().lower()
    except Exception as e:
        logger.error(f"Invalid OAuth state token: {e}")
        return RedirectResponse(
            url=f"{frontend_base}/verify-invitation?mail_status=error&error_msg=Invalid+or+expired+OAuth+session"
        )

    try:
        token_data = await MicrosoftEmailService.exchange_code_for_tokens(code)
    except Exception as e:
        logger.error(f"Error exchanging OAuth code: {e}")
        return RedirectResponse(
            url=f"{frontend_base}/verify-invitation?mail_status=error&error_msg=Token+exchange+failed"
        )

    access_token = token_data.get("access_token")
    refresh_token = token_data.get("refresh_token")
    expires_in = token_data.get("expires_in", 3600)

    if not access_token or not isinstance(access_token, str):
        logger.error("OAuth token response is missing a valid access_token")
        return RedirectResponse(
            url=f"{frontend_base}/verify-invitation?mail_status=error&error_msg=Missing+access+token+in+provider+response"
        )

    try:
        mailbox_identity = await MicrosoftEmailService.get_user_mailbox_identity(access_token)
    except Exception as e:
        logger.error(f"Error fetching user mailbox identity: {e}")
        return RedirectResponse(
            url=f"{frontend_base}/verify-invitation?mail_status=error&error_msg=Could+not+retrieve+mailbox+profile"
        )

    connected_email = mailbox_identity["email"]
    display_name = mailbox_identity["display_name"]

    # Note business organization domain if different
    if expected_email and connected_email != expected_email:
        logger.info(f"Agent {agent_id} connected Microsoft mailbox: {connected_email} (agent profile email: {expected_email})")

    encrypted_rt = encrypt_token(refresh_token) if refresh_token else None

    # Upsert AgentMailbox
    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    official_email = agent.email if agent and agent.email else (expected_email or connected_email)

    mailbox = db.query(AgentMailbox).filter(AgentMailbox.agent_id == agent_id).first()
    if not mailbox:
        mailbox = AgentMailbox(
            agent_id=agent_id,
            agency_id=agency_id,
            provider="microsoft",
            email=official_email,
            display_name=display_name or (agent.name if agent else ""),
            encrypted_refresh_token=encrypted_rt,
            status="Connected",
            scopes=token_data.get("scope"),
            connected_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
            expires_at=datetime.now(timezone.utc) + timedelta(seconds=expires_in)
        )
        db.add(mailbox)
    else:
        mailbox.email = official_email
        mailbox.display_name = display_name or mailbox.display_name
        if encrypted_rt:
            mailbox.encrypted_refresh_token = encrypted_rt
        mailbox.status = "Connected"
        mailbox.last_error = None
        mailbox.scopes = token_data.get("scope")
        mailbox.updated_at = datetime.now(timezone.utc)
        mailbox.expires_at = datetime.now(timezone.utc) + timedelta(seconds=expires_in)

    db.commit()

    from fastapi.responses import HTMLResponse
    target_url = f"{frontend_base}/verify-invitation?mail_status=connected&email={connected_email}"
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>Microsoft Outlook Connected</title>
        <style>
            body {{ font-family: system-ui, -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f8fafc; }}
            .card {{ background: white; padding: 32px 40px; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.06); text-align: center; max-width: 420px; }}
            h2 {{ color: #059669; margin: 0 0 12px; font-size: 20px; }}
            p {{ color: #64748b; font-size: 13px; line-height: 1.5; margin: 0 0 16px; }}
            .email {{ color: #0f172a; font-weight: 700; background: #f1f5f9; padding: 4px 10px; border-radius: 6px; }}
        </style>
    </head>
    <body>
        <div class="card">
            <h2>✓ Microsoft Outlook Connected!</h2>
            <p>Your mailbox <span class="email">{connected_email}</span> is now authorized for real email sending.</p>
            <p>This window will close automatically...</p>
        </div>
        <script>
            try {{
                if (window.opener) {{
                    window.opener.postMessage({{ type: 'OUTLOOK_CONNECTED', email: '{connected_email}' }}, '*');
                    setTimeout(function() {{ window.close(); }}, 1200);
                }} else {{
                    setTimeout(function() {{ window.location.href = "{target_url}"; }}, 1500);
                }}
            }} catch(e) {{
                window.location.href = "{target_url}";
            }}
        </script>
    </body>
    </html>
    """
    return HTMLResponse(content=html_content)


@router.post("/mail/disconnect")
def disconnect_mailbox(
    email: str = Query(...),
    db: Session = Depends(get_db)
):
    """
    Disconnects the agent's business mailbox and purges tokens.
    """
    target_email = email.strip().lower()
    agent = db.query(Agent).filter(func.lower(Agent.email) == target_email).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent profile not found.")

    mailbox = db.query(AgentMailbox).filter(AgentMailbox.agent_id == agent.id).first()
    if mailbox:
        mailbox.status = "Not Connected"
        mailbox.encrypted_refresh_token = None
        mailbox.updated_at = datetime.now(timezone.utc)
        db.commit()

    return {"success": True, "message": "Business mailbox disconnected successfully."}


@router.post("/mail/send")
async def send_mailbox_email(
    payload: SendEmailRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Directly dispatches an email with attachments from the authenticated agent's
    connected Microsoft Outlook/365 mailbox via Microsoft Graph API.
    Enforces that only the authenticated user's own connected mailbox is used.
    """
    user_email = (current_user.get("email") or "").strip().lower()
    user_id = str(current_user.get("id") or "")
    if not user_email and not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required to send emails."
        )

    # 1. Identify agent and associated mailbox from authenticated user identity
    agent = db.query(Agent).filter((func.lower(Agent.email) == user_email) | (Agent.user_id == user_id)).first()
    mailbox = None
    agent_id = None

    if agent:
        agent_id = agent.id
        mailbox = db.query(AgentMailbox).filter(AgentMailbox.agent_id == agent.id).first()
        if not mailbox:
            mailbox = db.query(AgentMailbox).filter(func.lower(AgentMailbox.email) == user_email).first()
    else:
        # Check if caller is an Agency operator
        agency = db.query(Agency).filter((Agency.user_id == user_id) | (func.lower(Agency.email) == user_email)).first()
        if agency:
            mailbox = db.query(AgentMailbox).filter(
                (func.lower(AgentMailbox.email) == user_email) | (AgentMailbox.agency_id == agency.id)
            ).first()
            if mailbox:
                agent_id = mailbox.agent_id
            else:
                first_agent = db.query(Agent).filter(Agent.agency_id == agency.id).first()
                if first_agent:
                    agent_id = first_agent.id
                    mailbox = db.query(AgentMailbox).filter(AgentMailbox.agent_id == first_agent.id).first()
        else:
            # Check for direct mailbox by user email
            mailbox = db.query(AgentMailbox).filter(func.lower(AgentMailbox.email) == user_email).first()
            if mailbox:
                agent_id = mailbox.agent_id

    # 2. Verify mailbox is connected with real Microsoft OAuth authorization strictly for this agent
    if not mailbox or mailbox.status != "Connected" or not mailbox.encrypted_refresh_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Your business mailbox ({user_email}) is not connected with Microsoft OAuth authorization. "
                "Please connect your own Microsoft Outlook / 365 mailbox before sending real emails."
            )
        )

    if not agent_id:
        agent_id = mailbox.agent_id

    # 3. Customer validation (if customer_id provided)
    if payload.customer_id:
        customer = db.query(Customer).filter(Customer.id == payload.customer_id).first()
        if not customer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Customer #{payload.customer_id} not found."
            )

    # 4. Total attachment size validation (Graph 4MB payload limit)
    attachments_dict = []
    if payload.attachments:
        total_size = sum((len(att.content_bytes_b64) * 3) // 4 for att in payload.attachments)
        MAX_TOTAL_BYTES = 4_000_000
        if total_size > MAX_TOTAL_BYTES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Total attachment size ({total_size // 1024} KB) exceeds the Microsoft Graph "
                    f"limit of {MAX_TOTAL_BYTES // (1024 * 1024)} MB. Please reduce the number of forms."
                )
            )
        attachments_dict = [att.model_dump() for att in payload.attachments]

    # 5. Parse optional CC and BCC
    cc_list = [c.strip() for c in re.split(r"[,;]", payload.cc_email) if c.strip()] if payload.cc_email else None
    bcc_list = [b.strip() for b in re.split(r"[,;]", payload.bcc_email) if b.strip()] if payload.bcc_email else None

    # 6. Execute direct send via MicrosoftEmailService
    try:
        result = await MicrosoftEmailService.send_agent_email(
            agent_id=agent_id,
            recipient_email=payload.recipient_email,
            subject=payload.subject,
            body_html=payload.body_html,
            attachments=attachments_dict,
            customer_id=payload.customer_id,
            policy_id=payload.policy_id,
            cc_recipients=cc_list,
            bcc_recipients=bcc_list,
            db=db
        )
        return result
    except ValueError as e:
        err_msg = str(e)
        logger.error(f"send_mailbox_email ValueError: {err_msg}")
        if "expired" in err_msg.lower() or "re-authenticate" in err_msg.lower():
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=err_msg)
        elif "not connected" in err_msg.lower():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=err_msg)
        else:
            raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=err_msg)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in send_mailbox_email: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while dispatching email via Microsoft Graph."
        )

