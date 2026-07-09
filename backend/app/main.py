from fastapi import FastAPI, HTTPException
from app.core.config import settings
from app.database.connection import test_connection, engine, Base
from app.api.v1.router import api_router
from app.modules.customer.model import Customer, Policy, Agency, Agent, MasterCertificate, CertificateHolder  # noqa: F401 — ensures tables are registered
from app.modules.eforms.model import CertificateFieldOverride # noqa: F401
from sqlalchemy import text
import os
from contextlib import asynccontextmanager

from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Validation 1: Environment Variables
    if not settings.DATABASE_URL:
        print(" CRITICAL: DATABASE_URL not found in environment!")
        os._exit(1)

    db_status = "Disconnected"
    api_status = "Unhealthy"

    # Validation 2: Database Connectivity
    try:
        Base.metadata.create_all(bind=engine)
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        db_status = "Connected"
        api_status = "Healthy"
    except Exception as e:
        print(f" DATABASE: Connection Failed: {str(e)}")

    print("================================")
    print("AMS360 STARTUP CHECK")
    print("================================")
    print(f"Environment: {settings.APP_ENV}")
    print(f"Database: {db_status}")
    print(f"Frontend URL: {settings.FRONTEND_URL}")
    print(f"API Status: {api_status}")
    print("================================")

    if db_status == "Connected":
        print("[OK] Database Connected")
    
    yield

app = FastAPI(
    title=settings.APP_NAME,
    debug=settings.DEBUG,
    lifespan=lifespan,
)

# CORS Configuration
cors_origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "https://ams-project-frontend.vercel.app"
]

if settings.FRONTEND_URL and settings.FRONTEND_URL not in cors_origins:
    cors_origins.append(settings.FRONTEND_URL)

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all v1 API routes under /api
app.include_router(api_router, prefix="/api")

# Mount uploads directory for documents
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    print("VALIDATION ERROR:", exc.errors())
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors()}
    )

@app.get("/")
def root():
    return {"message": "AMS360 API Running", "version": "1.0.0"}

@app.get("/health/")
def health_check():
    db_status = "connected"
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
    except Exception:
        db_status = "disconnected"

    from datetime import datetime

    return {
        "status": "ok",
        "environment": settings.APP_ENV,
        "database": db_status
    }