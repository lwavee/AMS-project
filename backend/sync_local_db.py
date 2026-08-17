import sqlite3
import bcrypt
import json
import uuid
from datetime import datetime, timezone, date

def sync_db():
    conn = sqlite3.connect("ams360.db")
    c = conn.cursor()

    # 1. Update/insert users with password Capco@2026# and password123 support
    password = "Capco@2026#"
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

    users = [
        ("agency@capco.com", "agency", "Capco Agency"),
        ("agent@capco.com", "agent", "Capco Agent"),
        ("admin@capco.com", "admin", "System Admin"),
    ]

    for email, role, name in users:
        meta = json.dumps({"role": role, "full_name": name})
        c.execute("SELECT id FROM users WHERE email = ?", (email,))
        row = c.fetchone()
        if row:
            c.execute("UPDATE users SET encrypted_password = ?, raw_user_meta_data = ? WHERE email = ?", (hashed, meta, email))
        else:
            uid = str(uuid.uuid4())
            c.execute("INSERT INTO users (id, email, encrypted_password, raw_user_meta_data, role, aud) VALUES (?, ?, ?, ?, ?, ?)",
                      (uid, email, hashed, meta, role, "authenticated"))

    # 2. Make sure agency profile exists
    c.execute("SELECT id FROM agencies WHERE email = 'agency@capco.com'")
    ag_row = c.fetchone()
    if not ag_row:
        c.execute("INSERT INTO agencies (name, email, domain, phone, address, city, state, zip, created_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                  ("Capco Agency", "agency@capco.com", "capco.com", "305-555-0100", "100 Brickell Ave", "Miami", "FL", "33131", "2026-01-01"))

    # 3. Add / sync all 10 live customers
    live_customers = [
        {"id": 1, "match_code": "ACMECO", "name": "Acme Corporation", "type": "Commercial", "address": "123 Industrial Way", "city": "San Jose", "state": "CA", "zip": "95110", "phone": "408-555-0199", "email": "info@acme.com", "status": "Active", "primary_exec": "Solender, Ben"},
        {"id": 2, "match_code": "GLOBALTECH", "name": "Global Tech Industries", "type": "Commercial", "address": "456 Innovation Blvd", "city": "Austin", "state": "TX", "zip": "78701", "phone": "512-555-0244", "email": "contact@globaltech.com", "status": "Active", "primary_exec": "Capco Agent"},
        {"id": 3, "match_code": "SMITHJ", "name": "John Smith", "type": "Personal", "address": "789 Maple Lane", "city": "Orlando", "state": "FL", "zip": "32801", "phone": "407-555-0322", "email": "john.smith@gmail.com", "status": "Active", "primary_exec": "Capco Agent"},
        {"id": 4, "match_code": "WATSONE", "name": "Emma Watson", "type": "Personal", "address": "321 Oak Road", "city": "Miami", "state": "FL", "zip": "33101", "phone": "305-555-0455", "email": "emma.watson@yahoo.com", "status": "Inactive", "primary_exec": "Capco Agent"},
        {"id": 5, "match_code": "SSSS9469", "name": "aaa sssss", "type": "Commercial", "address": "Gayatri Nagar", "city": "Udaipur", "state": "CA", "zip": "31300", "phone": "305-555-0999", "email": "asasz@gmail.com", "status": "Active", "primary_exec": "Unassigned"},
        {"id": 6, "match_code": "KOM89001", "name": "Acant kom", "type": "Commercial", "address": "Gayatri Nagar", "city": "Udaipur", "state": "CA", "zip": "31300", "phone": "305-555-0998", "email": "acant@gmail.com", "status": "Active", "primary_exec": "Unassigned"},
        {"id": 7, "match_code": "HUIP9002", "name": "Naran Huippa", "type": "Commercial", "address": "2906 fortuba road", "city": "Fortune", "state": "TX", "zip": "30000", "phone": "305-555-0997", "email": "naran@gmail.com", "status": "Active", "primary_exec": "Capco Agent"},
        {"id": 8, "match_code": "LN7470", "name": "fn ln", "type": "Commercial", "address": "address", "city": "city", "state": "FL", "zip": "40000", "phone": "407-555-0996", "email": "fnln@gmail.com", "status": "Active", "primary_exec": "HOUSE"},
        {"id": 9, "match_code": "MOON7001", "name": "moon construction", "type": "Commercial", "address": "123 xyz road", "city": "LA", "state": "CA", "zip": "10000", "phone": "100-555-0995", "email": "moon@gmail.com", "status": "Active", "primary_exec": "Unassigned"},
        {"id": 10, "match_code": "SHAR6001", "name": "krish", "type": "Commercial", "address": "Gayatri Nagar", "city": "Palos Verdes", "state": "CA", "zip": "90274", "phone": "900-555-0994", "email": "krish@gmail.com", "status": "Active", "primary_exec": "Unassigned"},
    ]

    for cust in live_customers:
        c.execute("SELECT id FROM customers WHERE id = ?", (cust["id"],))
        if c.fetchone():
            c.execute("""
                UPDATE customers SET match_code=?, name=?, type=?, address=?, city=?, state=?, zip=?, phone=?, email=?, status=?, primary_exec=?
                WHERE id=?
            """, (cust["match_code"], cust["name"], cust["type"], cust["address"], cust["city"], cust["state"], cust["zip"], cust["phone"], cust["email"], cust["status"], cust["primary_exec"], cust["id"]))
        else:
            c.execute("""
                INSERT INTO customers (id, match_code, name, type, address, city, state, zip, phone, email, status, primary_exec)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (cust["id"], cust["match_code"], cust["name"], cust["type"], cust["address"], cust["city"], cust["state"], cust["zip"], cust["phone"], cust["email"], cust["status"], cust["primary_exec"]))

    # 4. Seed policies for Customer 7 (Naran Huippa)
    c.execute("SELECT id FROM policies WHERE customer_id = 7")
    if not c.fetchall():
        c.execute("""
            INSERT INTO policies (id, customer_id, policy_num, status, term, type, company, description, eff_date, exp_date)
            VALUES (10, 7, 'GL-2026-7011', 'Active', '1 Year', 'General Liability', 'Travelers Property Casualty', 'Commercial General Liability', '01/01/2026', '01/01/2027')
        """)
        c.execute("""
            INSERT INTO policies (id, customer_id, policy_num, status, term, type, company, description, eff_date, exp_date)
            VALUES (11, 7, 'BA-2026-7022', 'Active', '1 Year', 'Business Auto', 'Progressive Commercial', 'Commercial Automobile Coverage', '01/01/2026', '01/01/2027')
        """)
        c.execute("""
            INSERT INTO policies (id, customer_id, policy_num, status, term, type, company, description, eff_date, exp_date)
            VALUES (12, 7, 'WC-2026-7033', 'Active', '1 Year', 'Workers Comp', 'Hartford Underwriters', 'Workers Compensation & Employers Liability', '01/01/2026', '01/01/2027')
        """)
        c.execute("""
            INSERT INTO policies (id, customer_id, policy_num, status, term, type, company, description, eff_date, exp_date)
            VALUES (13, 7, 'UMB-2026-7044', 'Active', '1 Year', 'Umbrella', 'Chubb Custom Insurance', 'Commercial Umbrella Liability', '01/01/2026', '01/01/2027')
        """)

        # Seed GL coverages for policy 10
        c.execute("""
            INSERT INTO general_liability_coverages (policy_id, coverage, limit1, limit2)
            VALUES (10, 'General Aggregate', '2000000', NULL)
        """)
        c.execute("""
            INSERT INTO general_liability_coverages (policy_id, coverage, limit1, limit2)
            VALUES (10, 'Products - Comp/Op Agg', '2000000', NULL)
        """)
        c.execute("""
            INSERT INTO general_liability_coverages (policy_id, coverage, limit1, limit2)
            VALUES (10, 'Personal & Adv Injury', '1000000', NULL)
        """)
        c.execute("""
            INSERT INTO general_liability_coverages (policy_id, coverage, limit1, limit2)
            VALUES (10, 'Each Occurrence', '1000000', NULL)
        """)
        c.execute("""
            INSERT INTO general_liability_coverages (policy_id, coverage, limit1, limit2)
            VALUES (10, 'Damage to Rented Premises', '300000', NULL)
        """)
        c.execute("""
            INSERT INTO general_liability_coverages (policy_id, coverage, limit1, limit2)
            VALUES (10, 'Med Exp (Any one person)', '10000', NULL)
        """)

    # 5. Seed Master Certificates and Certificate Holders for Customer 7
    c.execute("SELECT id FROM master_certificates WHERE customer_id = 7")
    if not c.fetchall():
        c.execute("""
            INSERT INTO master_certificates (id, customer_id, description, form_type, form_data, created_date)
            VALUES (1, 7, '2026 Master Certificate', 'ACORD 25 (2016/03)', '{}', '2026-01-15')
        """)
        c.execute("""
            INSERT INTO certificate_holders (
                id, certificate_id, customer_id, name, contact, address, address2, city, state, zip,
                email, fax, fax_ext, issue_date, written_notice_days, desc_of_ops, same_as_master, created_at
            ) VALUES (
                1, 1, 7, 'Texas Department of Transportation', 'Contract Admin', '125 E 11th St', 'Dept of Highway Ops', 'Austin', 'TX', '78701',
                'cert@txdot.gov', '512-555-0199', NULL, '01/15/2026', 30,
                'Certificate holder is named as additional insured as respects to General Liability and Auto Liability per written contract.', 1, '2026-01-15'
            )
        """)
        c.execute("""
            INSERT INTO certificate_holders (
                id, certificate_id, customer_id, name, contact, address, address2, city, state, zip,
                email, fax, fax_ext, issue_date, written_notice_days, desc_of_ops, same_as_master, created_at
            ) VALUES (
                2, 1, 7, 'Acme Construction & Development', 'John Miller', '500 Commerce Way', 'Suite 200', 'Dallas', 'TX', '75201',
                'insurance@acmeconstruction.com', '214-555-0188', NULL, '01/20/2026', 30,
                'Project: Hwy 290 Expansion. Certificate holder is included as Additional Insured on a primary and non-contributory basis.', 1, '2026-01-20'
            )
        """)

    # Also seed master certificates for Customer 1 (Acme Corporation) if none exist
    c.execute("SELECT id FROM master_certificates WHERE customer_id = 1")
    if not c.fetchall():
        c.execute("""
            INSERT INTO master_certificates (id, customer_id, description, form_type, form_data, created_date)
            VALUES (2, 1, '2026 Commercial Master Certificate', 'ACORD 25 (2016/03)', '{}', '2026-01-10')
        """)
        c.execute("""
            INSERT INTO certificate_holders (
                id, certificate_id, customer_id, name, contact, address, address2, city, state, zip,
                email, fax, fax_ext, issue_date, written_notice_days, desc_of_ops, same_as_master, created_at
            ) VALUES (
                3, 2, 1, 'City of San Jose Public Works', 'Building Inspector', '200 E Santa Clara St', NULL, 'San Jose', 'CA', '95113',
                'pw@sanjoseca.gov', '408-555-0155', NULL, '01/10/2026', 30,
                'Certificate holder is listed as additional insured with respect to General Liability as required by contract.', 1, '2026-01-10'
            )
        """)

    conn.commit()
    conn.close()
    print("Database sync completed successfully with policies, master certificates, and holders!")

if __name__ == "__main__":
    sync_db()
