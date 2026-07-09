"""
API v1 Router Aggregator
------------------------
This module acts as the single registration point for all domain module routers.
Add new module routers here as the project grows.
"""
from fastapi import APIRouter
from app.modules.auth.router import router as auth_router
from app.modules.customer.router import router as customer_router
from app.modules.admin.router import router as admin_router
from app.modules.agency.router import router as agency_router
from app.modules.pdf.router import router as pdf_router
from app.modules.eforms.router import router as eforms_router

api_router = APIRouter()

api_router.include_router(auth_router, prefix="/auth", tags=["auth"])
api_router.include_router(customer_router, prefix="/customers", tags=["customers"])
api_router.include_router(admin_router, prefix="/admin", tags=["admin"])
api_router.include_router(agency_router, prefix="/agency", tags=["agency"])
api_router.include_router(pdf_router, prefix="/pdf", tags=["pdf"])
api_router.include_router(eforms_router, prefix="/eforms", tags=["eforms"])
