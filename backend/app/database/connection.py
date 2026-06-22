from sqlalchemy import create_engine, text, event
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

if not settings.DATABASE_URL:
    raise ValueError("DATABASE_URL is not set in environment or .env")

# Build engine with connection timeout to prevent hanging on slow/unreachable DB
is_sqlite = settings.DATABASE_URL.startswith("sqlite")

if is_sqlite:
    engine = create_engine(
        settings.DATABASE_URL,
        connect_args={"timeout": 10},  # SQLite: 10s timeout
    )
else:
    engine = create_engine(
        settings.DATABASE_URL,
        pool_pre_ping=True,           # Test connection health before use
        pool_timeout=10,              # Max wait to get a connection from pool
        pool_recycle=1800,            # Recycle connections every 30 min
        connect_args={
            "connect_timeout": 10,    # TCP connection timeout (seconds)
        },
    )

# For SQLite, mock the 'auth' schema by attaching the main database to itself
@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    if is_sqlite:
        cursor = dbapi_connection.cursor()
        # Extract the db name from the URL (e.g. ams360.db)
        db_name = settings.DATABASE_URL.split("///")[-1]
        cursor.execute(f"ATTACH DATABASE '{db_name}' AS auth")
        cursor.close()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def test_connection():
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            print("✅ Database Connected Successfully")
            print(result.scalar())
    except Exception as e:
        print("❌ Connection Failed")
        print(e)