import logging
from sqlalchemy import create_engine, text, event
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.exc import OperationalError, DatabaseError
from app.core.config import settings

logger = logging.getLogger("ams360.database")

if not settings.DATABASE_URL:
    raise ValueError("DATABASE_URL is not set in environment or .env")

# 1. Primary Engine Setup (Main Supabase Instance)
is_sqlite = settings.DATABASE_URL.startswith("sqlite")

if is_sqlite:
    primary_engine = create_engine(
        settings.DATABASE_URL,
        connect_args={"timeout": 10},
    )
else:
    primary_engine = create_engine(
        settings.DATABASE_URL,
        pool_pre_ping=True,
        pool_size=10,
        max_overflow=20,
        pool_timeout=5,
        pool_recycle=1800,
        connect_args={"connect_timeout": 5},
    )

# 2. Backup Engine Setup (Secondary Supabase Instance)
backup_engine = None
BackupSessionLocal = None

if settings.BACKUP_DATABASE_URL:
    backup_engine = create_engine(
        settings.BACKUP_DATABASE_URL,
        pool_pre_ping=True,
        pool_size=10,
        max_overflow=20,
        pool_timeout=5,
        pool_recycle=1800,
        connect_args={"connect_timeout": 5},
    )
    BackupSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=backup_engine)

PrimarySessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=primary_engine)

# Backward-compatibility alias
engine = primary_engine
SessionLocal = PrimarySessionLocal
Base = declarative_base()

# Track active database mode ("primary" or "backup")
active_db_mode = "primary"

# For SQLite, attach database
@event.listens_for(primary_engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    if is_sqlite:
        cursor = dbapi_connection.cursor()
        db_name = settings.DATABASE_URL.split("///")[-1]
        cursor.execute(f"ATTACH DATABASE '{db_name}' AS auth")
        cursor.close()

def get_db():
    """
    High-Availability Session Generator:
    Yields a session from Primary Supabase DB.
    If Primary is down or unreachable, automatically fails over to Backup Supabase DB!
    """
    global active_db_mode
    db: Session | None = None
    used_backup = False

    # Try Primary first
    try:
        db = PrimarySessionLocal()
        # Verify connection with a quick ping
        db.execute(text("SELECT 1"))
        if active_db_mode != "primary":
            logger.info("🟢 Restored connection to Primary Supabase DB!")
            active_db_mode = "primary"
        yield db
    except (OperationalError, DatabaseError, Exception) as primary_err:
        if db:
            try:
                db.close()
            except Exception:
                pass

        if BackupSessionLocal:
            logger.warning(
                f"[FAILOVER] Primary Supabase DB error ({primary_err}). "
                f"Switching to Backup Supabase DB..."
            )
            active_db_mode = "backup"
            used_backup = True
            backup_db = BackupSessionLocal()
            try:
                yield backup_db
            finally:
                backup_db.close()
        else:
            logger.error(f"❌ Primary DB failed and no Backup DB configured: {primary_err}")
            raise primary_err
    finally:
        if db and not used_backup:
            db.close()

def get_db_status():
    """Returns the live status of both Primary and Backup Supabase instances."""
    primary_ok = False
    backup_ok = False

    try:
        with primary_engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        primary_ok = True
    except Exception:
        primary_ok = False

    if backup_engine:
        try:
            with backup_engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            backup_ok = True
        except Exception:
            backup_ok = False

    return {
        "active_mode": active_db_mode,
        "primary": {
            "url": settings.DATABASE_URL.split("@")[-1] if settings.DATABASE_URL else None,
            "status": "online" if primary_ok else "offline"
        },
        "backup": {
            "url": settings.BACKUP_DATABASE_URL.split("@")[-1] if settings.BACKUP_DATABASE_URL else None,
            "status": "online" if backup_ok else "offline"
        }
    }

def test_connection():
    try:
        with primary_engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            print("✅ Primary Database Connected Successfully")
    except Exception as e:
        print("❌ Primary Connection Failed:", e)

    if backup_engine:
        try:
            with backup_engine.connect() as conn:
                result = conn.execute(text("SELECT 1"))
                print("✅ Backup Database Connected Successfully")
        except Exception as e:
            print("❌ Backup Connection Failed:", e)