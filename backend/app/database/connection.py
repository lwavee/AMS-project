import logging
from sqlalchemy import create_engine, text, event
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.exc import OperationalError, DatabaseError
from app.core.config import settings

logger = logging.getLogger("ams360.database")

def normalize_db_url(url: str | None) -> str | None:
    if not url:
        return url
    # Render and Heroku often provide URLs starting with postgres://, which SQLAlchemy deprecated
    if url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql://", 1)
    return url


primary_db_url = normalize_db_url(settings.DATABASE_URL)
if not primary_db_url:
    raise ValueError("DATABASE_URL is not set in environment or .env")

# 1. Primary Engine Setup (Main Supabase Instance)
is_sqlite = primary_db_url.startswith("sqlite")

if is_sqlite:
    primary_engine = create_engine(
        primary_db_url,
        connect_args={"timeout": 10},
    )
else:
    primary_engine = create_engine(
        primary_db_url,
        pool_pre_ping=True,
        pool_size=20,
        max_overflow=10,
        pool_timeout=30,
        pool_recycle=300,  # Recycles connection every 5 minutes to prevent stale PgBouncer sockets
        connect_args={
            "connect_timeout": 15,
            "keepalives": 1,
            "keepalives_idle": 30,
            "keepalives_interval": 10,
            "keepalives_count": 5,
        },
    )

# 2. Backup Engine Setup (Secondary Supabase Instance - validated on load)
backup_engine = None
BackupSessionLocal = None

backup_db_url = normalize_db_url(settings.BACKUP_DATABASE_URL)
if backup_db_url:
    try:
        temp_backup_engine = create_engine(
            backup_db_url,
            pool_pre_ping=True,
            pool_size=5,
            max_overflow=5,
            pool_timeout=10,
            pool_recycle=300,
            connect_args={"connect_timeout": 5},
        )
        with temp_backup_engine.connect() as test_conn:
            test_conn.execute(text("SELECT 1"))
        backup_engine = temp_backup_engine
        BackupSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=backup_engine)
        logger.info("🟢 Backup Supabase DB connection verified and ready.")
    except Exception as e:
        logger.warning(
            f"⚠️ Backup DB configured but unreachable ({e}). "
            "Disabled backup failover to prevent application crashes."
        )
        backup_engine = None
        BackupSessionLocal = None

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
    if is_sqlite and primary_db_url:
        try:
            cursor = dbapi_connection.cursor()
            db_name = primary_db_url.split("///")[-1]
            cursor.execute(f"ATTACH DATABASE '{db_name}' AS auth")
            cursor.close()
        except Exception:
            pass

def get_db():
    """
    High-Availability Session Generator:
    Yields a session from Primary Supabase DB with zero redundant roundtrips.
    pool_pre_ping handles reconnection automatically.
    """
    global active_db_mode
    db: Session | None = None

    # 1. Acquire connection (fast, pool_pre_ping verified)
    try:
        db = PrimarySessionLocal()
        if active_db_mode != "primary":
            active_db_mode = "primary"
    except (OperationalError, DatabaseError, Exception) as primary_err:
        if db:
            try:
                db.close()
            except Exception:
                pass
            db = None

        if BackupSessionLocal:
            logger.warning(
                f"[FAILOVER] Primary Supabase DB error ({primary_err}). "
                "Switching to Backup Supabase DB..."
            )
            try:
                db = BackupSessionLocal()
                active_db_mode = "backup"
            except Exception as backup_err:
                logger.error(f"❌ Backup DB connection failed: {backup_err}")
                active_db_mode = "primary"
                raise backup_err
        else:
            logger.error(f"❌ Primary DB failed and no valid Backup DB available: {primary_err}")
            raise primary_err

    # 2. Yield session to endpoint and ensure cleanup
    try:
        yield db
    finally:
        if db:
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