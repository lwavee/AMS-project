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
        counts = db.execute(text(
            "select "
            "count(*) as total_customers, "
            "sum(case when status = 'Active' then 1 else 0 end) as active_customers, "
            "sum(case when status = 'Inactive' then 1 else 0 end) as inactive_customers, "
            "sum(case when type = 'Commercial' then 1 else 0 end) as commercial_customers, "
            "sum(case when type = 'Personal' then 1 else 0 end) as personal_customers "
            "from customers"
        )).mappings().first()

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
