import os
import sys
import json
import uuid
import bcrypt
from datetime import datetime
from sqlalchemy import text

# Add the backend directory to sys.path so we can import app
sys.path.append(os.path.join(os.getcwd(), "backend"))

from app.database.connection import engine, Base, SessionLocal

def seed():
    print("Initializing database and seeding...")
    
    # 1. Create all tables managed by SQLAlchemy models
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()

    # 2. Create the 'users' table for auth (if not exists)
    # This table is used by auth.users queries in the backend
    try:
        db.execute(text("""
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                email TEXT UNIQUE,
                encrypted_password TEXT,
                raw_user_meta_data TEXT,
                email_confirmed_at TIMESTAMP,
                role TEXT,
                aud TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """))
        db.commit()
    except Exception as e:
        print(f"Note: Table 'users' might already exist or failed to create: {e}")

    # 3. Prepare default users
    users_to_seed = [
        {
            "email": "agency@capco.com",
            "password": "password123",
            "role": "agency",
            "name": "Capco Agency"
        },
        {
            "email": "agent@capco.com",
            "password": "password123",
            "role": "agent",
            "name": "Capco Agent"
        },
        {
            "email": "admin@capco.com",
            "password": "password123",
            "role": "admin",
            "name": "System Admin"
        }
    ]

    for user_info in users_to_seed:
        email = user_info["email"]
        password = user_info["password"]
        role = user_info["role"]
        
        # Check if exists
        result = db.execute(text("SELECT id FROM users WHERE email = :email"), {"email": email}).first()
        if result:
            print(f"User {email} already exists, skipping.")
            continue

        # Hash password
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
        
        user_id = str(uuid.uuid4())
        meta = json.dumps({"role": role, "full_name": user_info["name"]})
        
        db.execute(text("""
            INSERT INTO users (id, email, encrypted_password, raw_user_meta_data, email_confirmed_at, role, aud)
            VALUES (:id, :email, :password, :meta, :confirmed_at, :role, :aud)
        """), {
            "id": user_id, 
            "email": email, 
            "password": hashed, 
            "meta": meta, 
            "confirmed_at": datetime.now(), 
            "role": role, 
            "aud": 'authenticated'
        })
        
        print(f"Created {role} user: {email}")

        # 4. Also seed the Agency/Agent tables
        if role == "agency":
            res = db.execute(text("SELECT id FROM agencies WHERE email = :email"), {"email": email}).first()
            if not res:
                db.execute(text("INSERT INTO agencies (name, email, user_id, created_date) VALUES (:name, :email, :user_id, :created_date)"),
                             {"name": user_info["name"], "email": email, "user_id": user_id, "created_date": datetime.now().date()})
        elif role == "agent":
            res = db.execute(text("SELECT id FROM agents WHERE email = :email"), {"email": email}).first()
            if not res:
                # Link to the first agency
                agency_row = db.execute(text("SELECT id FROM agencies LIMIT 1")).first()
                if agency_row:
                    db.execute(text("INSERT INTO agents (name, email, agency_id, user_id, created_date) VALUES (:name, :email, :agency_id, :user_id, :created_date)"),
                                 {"name": user_info["name"], "email": email, "agency_id": agency_row[0], "user_id": user_id, "created_date": datetime.now().date()})

    # 5. Seed dummy customers and policies
    try:
        customer_count = db.execute(text("SELECT count(*) FROM customers")).scalar()
        if customer_count == 0:
            print("Seeding dummy customers and policies...")
            from app.modules.customer.model import Customer, Policy
            from datetime import date

            c1 = Customer(
                match_code="ACMECO",
                name="Acme Corporation",
                type="Commercial",
                address="123 Industrial Way",
                city="San Jose",
                state="CA",
                zip="95110",
                phone="408-555-0199",
                email="info@acme.com",
                status="Active",
                primary_exec="Solender, Ben",
                customer_type="Customer"
            )
            c2 = Customer(
                match_code="GLOBALTECH",
                name="Global Tech Industries",
                type="Commercial",
                address="456 Innovation Blvd",
                city="Austin",
                state="TX",
                zip="78701",
                phone="512-555-0244",
                email="contact@globaltech.com",
                status="Active",
                primary_exec="Capco Agent",
                customer_type="Customer"
            )
            c3 = Customer(
                match_code="SMITHJ",
                name="John Smith",
                type="Personal",
                address="789 Maple Lane",
                city="Orlando",
                state="FL",
                zip="32801",
                phone="407-555-0322",
                email="john.smith@gmail.com",
                status="Active",
                primary_exec="Capco Agent",
                customer_type="Customer"
            )
            c4 = Customer(
                match_code="WATSONE",
                name="Emma Watson",
                type="Personal",
                address="321 Oak Road",
                city="Miami",
                state="FL",
                zip="33101",
                phone="305-555-0455",
                email="emma.watson@yahoo.com",
                status="Inactive",
                primary_exec="Capco Agent",
                customer_type="Prospect"
            )
            db.add_all([c1, c2, c3, c4])
            db.commit()

            p1 = Policy(
                customer_id=c1.id,
                policy_num="GL-2026-8831",
                status="Active",
                term="1 Year",
                type="General Liability",
                company="Travelers Insurance",
                description="Commercial General Liability",
                eff_date="01/01/2026",
                exp_date="01/01/2027"
            )
            p2 = Policy(
                customer_id=c1.id,
                policy_num="BA-2026-9921",
                status="Active",
                term="1 Year",
                type="Business Auto",
                company="Progressive Commercial",
                description="Commercial Auto Policy",
                eff_date="01/01/2026",
                exp_date="01/01/2027"
            )
            p3 = Policy(
                customer_id=c2.id,
                policy_num="WC-2026-1122",
                status="Active",
                term="1 Year",
                type="Workers Compensation",
                company="Hartford Insurance",
                description="Workers Compensation coverage",
                eff_date="03/15/2026",
                exp_date="03/15/2027"
            )
            p4 = Policy(
                customer_id=c3.id,
                policy_num="PP-2026-7741",
                status="Active",
                term="1 Year",
                type="Personal Property",
                company="Geico",
                description="Personal Homeowner's Policy",
                eff_date="05/10/2026",
                exp_date="05/10/2027"
            )
            db.add_all([p1, p2, p3, p4])
            db.commit()
            print("Successfully seeded dummy customers and policies!")
    except Exception as e:
        print(f"Error seeding customers/policies: {e}")

    db.commit()
    db.close()
    print("Seeding complete!")

if __name__ == "__main__":
    seed()
