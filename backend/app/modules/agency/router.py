from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database.connection import get_db
from app.modules.auth.deps import require_role, get_current_user
from app.modules.customer.model import Agency, Agent
from pydantic import BaseModel, EmailStr
from typing import Optional, List, cast, Any
from datetime import date, datetime
import uuid
import bcrypt
import json
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

# Schema definitions
class AgencyProfileResponse(BaseModel):
    id: int
    name: str
    email: str
    domain: str
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip: Optional[str] = None
    created_date: Optional[date] = None

class AgencyProfileUpdateRequest(BaseModel):
    name: str
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip: Optional[str] = None

class AgentCreateRequest(BaseModel):
    name: str
    password: str
    email: Optional[str] = None
    phone: Optional[str] = None

class AgentResponse(BaseModel):
    id: int
    name: str
    email: str
    created_date: Optional[date] = None

# Dependencies
agency_or_admin_dependency = Depends(require_role(["agency", "admin"]))
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

        return {
            "total_customers": counts["total_customers"] or 0,
            "active_customers": counts["active_customers"] or 0,
            "inactive_customers": counts["inactive_customers"] or 0,
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

@router.get("/profile", response_model=AgencyProfileResponse, dependencies=[agency_only_dependency])
def get_profile(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    agency = db.query(Agency).filter(Agency.user_id == current_user["id"]).first()
    if not agency:
        # Fallback to matching by email
        agency = db.query(Agency).filter(Agency.email == current_user["email"]).first()
        if not agency:
            # Create a default record for this logged-in agency account if it somehow doesn't exist
            agency = Agency(
                name=current_user["email"].split("@")[0].capitalize() + " Agency",
                email=current_user["email"],
                user_id=current_user["id"]
            )
            db.add(agency)
            db.commit()
            db.refresh(agency)
            
    agency_any: Any = agency
    domain = agency_any.email.split("@")[-1] if "@" in agency_any.email else "capco.com"
    return AgencyProfileResponse(
        id=agency_any.id,
        name=agency_any.name,
        email=agency_any.email,
        domain=domain,
        phone=agency_any.phone,
        address=agency_any.address,
        city=agency_any.city,
        state=agency_any.state,
        zip=agency_any.zip,
        created_date=agency_any.created_date
    )

@router.put("/profile", response_model=AgencyProfileResponse, dependencies=[agency_only_dependency])
def update_profile(req: AgencyProfileUpdateRequest, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    agency = db.query(Agency).filter(Agency.user_id == current_user["id"]).first()
    if not agency:
        agency = db.query(Agency).filter(Agency.email == current_user["email"]).first()
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
    return AgencyProfileResponse(
        id=agency_any.id,
        name=agency_any.name,
        email=agency_any.email,
        domain=domain,
        phone=agency_any.phone,
        address=agency_any.address,
        city=agency_any.city,
        state=agency_any.state,
        zip=agency_any.zip,
        created_date=agency_any.created_date
    )

@router.get("/agents", response_model=List[AgentResponse], dependencies=[agency_only_dependency])
def list_agents(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    agency = db.query(Agency).filter(Agency.user_id == current_user["id"]).first()
    if not agency:
        agency = db.query(Agency).filter(Agency.email == current_user["email"]).first()
        if not agency:
            return []
            
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
    hashed_password = bcrypt.hashpw(req.password.encode('utf-8'), salt).decode('utf-8')
    
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
        db.delete(agent)
        db.commit()
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to delete agent: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete agent profile.")
        
    return {"message": "Agent deleted successfully"}

