import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

# Load env variables from backend/.env
load_dotenv("c:/Users/lohar/OneDrive/Desktop/AMS-project-main/backend/.env")

db_url = os.getenv("DATABASE_URL")
print(f"DATABASE_URL: {db_url}")

if not db_url:
    print("Error: DATABASE_URL not set!")
    exit(1)

try:
    engine = create_engine(db_url)
    with engine.connect() as conn:
        print("Successfully connected to the database!")
        
        # Test 1: Simple select
        res1 = conn.execute(text("SELECT 1")).scalar()
        print(f"Test 1 (SELECT 1): {res1}")
        
        # Test 2: Check auth.users table query
        try:
            res2 = conn.execute(text("select count(*) from auth.users")).scalar()
            print(f"Test 2 (auth.users count): {res2}")
        except Exception as e:
            print(f"Test 2 (auth.users) Failed: {e}")
            
        # Test 3: Check customers table via SQLAlchemy
        try:
            from app.modules.customer.model import Customer
            from sqlalchemy.orm import sessionmaker
            SessionLocal = sessionmaker(bind=engine)
            session = SessionLocal()
            res3 = session.query(Customer).count()
            print(f"Test 3 (Customer count): {res3}")
            session.close()
        except Exception as e:
            print(f"Test 3 (Customer query) Failed: {e}")
            import traceback
            traceback.print_exc()
            
except Exception as e:
    print(f"Connection/execution failed: {e}")
