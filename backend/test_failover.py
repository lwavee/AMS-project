"""
Test High-Availability Failover between Primary and Backup Supabase Databases
"""

import os
import sys
from dotenv import load_dotenv
from sqlalchemy import text, create_engine
from sqlalchemy.orm import sessionmaker

load_dotenv()

from app.core.config import settings
from app.database import connection
from app.modules.customer.model import Customer, Policy

def test_failover_mechanism():
    print("=" * 65)
    print("TESTING DATABASE FAILOVER SYSTEM")
    print("=" * 65)

    # 1. Test normal operation (Primary DB)
    print("\n1. Testing normal operation (Primary Supabase DB)...")
    db_gen = connection.get_db()
    db = next(db_gen)
    try:
        customers_count = db.query(Customer).count()
        policies_count = db.query(Policy).count()
        print(f"   [Primary OK] Customers: {customers_count}, Policies: {policies_count}")
        print(f"   Active Mode: {connection.active_db_mode}")
    finally:
        try:
            next(db_gen)
        except StopIteration:
            pass

    # 2. Simulate Primary DB Failure
    print("\n2. Simulating Primary DB Disconnection / Outage...")
    original_primary_session = connection.PrimarySessionLocal
    
    # Broken engine simulating primary failure
    broken_engine = create_engine("postgresql://invalid_user:invalid_pwd@127.0.0.1:9999/postgres", connect_args={"connect_timeout": 1})
    connection.PrimarySessionLocal = sessionmaker(bind=broken_engine)

    # 3. Test Automatic Failover to Backup DB
    print("\n3. Requesting database session during Primary failure...")
    failover_gen = connection.get_db()
    failover_db = next(failover_gen)
    try:
        backup_cust_count = failover_db.query(Customer).count()
        backup_pol_count = failover_db.query(Policy).count()
        print(f"   [FAILOVER SUCCESS] Serviced by Backup Supabase DB!")
        print(f"   Customers: {backup_cust_count}, Policies: {backup_pol_count}")
        print(f"   Active Mode: {connection.active_db_mode}")
        assert backup_cust_count == customers_count, "Backup customer count does not match!"
        assert backup_pol_count == policies_count, "Backup policy count does not match!"
        print("   [SUCCESS] Zero downtime failover verified!")
    finally:
        try:
            next(failover_gen)
        except StopIteration:
            pass

    # 4. Restore Primary Engine
    connection.PrimarySessionLocal = original_primary_session
    print("\n4. Restored Primary connection.")
    print("=" * 65)
    print("HIGH-AVAILABILITY FAILOVER SYSTEM FULLY FUNCTIONAL!")
    print("=" * 65)

if __name__ == "__main__":
    test_failover_mechanism()
