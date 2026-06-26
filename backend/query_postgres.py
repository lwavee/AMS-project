import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
import json

load_dotenv("c:/Users/hp/Desktop/AMS-project-main/backend/.env")
db_url = os.getenv("DATABASE_URL")

engine = create_engine(db_url)
with engine.connect() as conn:
    # Query customer 21 details
    res = conn.execute(text("SELECT * FROM customers WHERE id=21")).fetchone()
    if res:
        # Convert row to dict by keys
        keys = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name='customers'")).fetchall()
        keys = [k[0] for k in keys]
        cust_dict = dict(zip(keys, res))
        print("Customer 21 fields:")
        for k, v in cust_dict.items():
            print(f"  {k}: {repr(v)}")
    else:
        print("Customer 21 not found!")
