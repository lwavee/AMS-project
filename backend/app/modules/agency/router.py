from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database.connection import get_db
from app.modules.auth.deps import require_role
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

agency_dependency = Depends(require_role(["agency", "admin"]))

@router.get("/reports", dependencies=[agency_dependency])
def get_reports(db: Session = Depends(get_db)):
    try:
        total_customers = db.execute(text("select count(*) from customers")).scalar() or 0
        active_customers = db.execute(text("select count(*) from customers where status = 'Active'")).scalar() or 0
        inactive_customers = db.execute(text("select count(*) from customers where status = 'Inactive'")).scalar() or 0

        commercial_customers = db.execute(text("select count(*) from customers where type = 'Commercial'")).scalar() or 0
        personal_customers = db.execute(text("select count(*) from customers where type = 'Personal'")).scalar() or 0

        state_result = db.execute(text("select state, count(*) from customers where state is not null and state != '' group by state order by count(*) desc limit 5"))
        state_distribution = {row[0]: row[1] for row in state_result}

        return {
            "total_customers": total_customers,
            "active_customers": active_customers,
            "inactive_customers": inactive_customers,
            "type_distribution": {
                "Commercial": commercial_customers,
                "Personal": personal_customers
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
