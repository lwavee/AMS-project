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

import asyncio
import time
import httpx
import logging

logger = logging.getLogger("ams360.server")
START_TIME = time.time()

async def background_keepalive():
    """
    Continuous background keepalive (heartbeat) running every 4 minutes:
    - Pings primary database to prevent Supabase PgBouncer pooler and database from sleeping.
    - Pings external server URL (if on cloud like Render) to prevent idle server shutdown.
    """
    await asyncio.sleep(15)  # initial wait after startup
    while True:
        try:
            # 1. Keep database connection alive and warm
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
        except Exception as e:
            logger.warning(f"Database keepalive ping exception: {e}")

        # 2. Keep cloud server alive (Render, Railway, etc.)
        external_url = os.getenv("RENDER_EXTERNAL_URL") or os.getenv("SERVER_URL")
        if external_url:
            try:
                async with httpx.AsyncClient() as client:
                    await client.get(f"{external_url.rstrip('/')}/health/", timeout=10.0)
            except Exception:
                pass

        await asyncio.sleep(240)  # repeat every 4 minutes

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Validation 1: Environment Variables & Security Checks
    if not settings.DATABASE_URL:
        print(" CRITICAL: DATABASE_URL not found in environment!")
        os._exit(1)

    is_production = settings.APP_ENV.lower() in ("production", "prod")
    if is_production:
        if not settings.SECRET_KEY or settings.SECRET_KEY in settings.INSECURE_SECRET_KEYS or len(settings.SECRET_KEY) < 32:
            print("==================================================================")
            print(" CRITICAL SECURITY ERROR: Weak or default SECRET_KEY in production!")
            print(" Startup aborted. You must set a strong, random SECRET_KEY (min 32 chars).")
            print("==================================================================")
            os._exit(1)
    elif not settings.SECRET_KEY or settings.SECRET_KEY in settings.INSECURE_SECRET_KEYS:
        print(" [SECURITY WARNING] Insecure or default SECRET_KEY in non-production. Ensure a strong key is set in production.")

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
    
    # Validation 3: Background Keep-Alive Task
    # Runs every 4 minutes to keep Supabase PgBouncer and cloud hosting servers awake permanently
    keepalive_task = asyncio.create_task(background_keepalive())

    yield

    keepalive_task.cancel()

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

from app.database.connection import test_connection, engine, Base, get_db_status

@app.get("/health/")
@app.get("/api/health/db")
def health_check():
    db_info = get_db_status()
    return {
        "status": "ok",
        "environment": settings.APP_ENV,
        "active_database_mode": db_info["active_mode"],
        "primary_database": db_info["primary"],
        "backup_database": db_info["backup"],
    }