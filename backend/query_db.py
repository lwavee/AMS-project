import sqlite3

def run_queries():
    conn = sqlite3.connect('ams360.db')
    c = conn.cursor()
    
    # Get all tables
    c.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = [r[0] for r in c.fetchall()]
    print("Tables:", tables)
    
    # Check customers count
    c.execute("SELECT COUNT(*) FROM customers")
    print("Total Customers:", c.fetchone()[0])
    
    # Check policies count
    c.execute("SELECT COUNT(*) FROM policies")
    print("Total Policies:", c.fetchone()[0])
    
    # Show last 5 customers
    c.execute("SELECT id, name, email FROM customers ORDER BY id DESC LIMIT 5")
    print("\nLast 5 Customers:")
    for r in c.fetchall():
        print(f"ID={r[0]}, Name={r[1]}, Email={r[2]}")
        
    # Show last 5 policies
    c.execute("SELECT id, customer_id, policy_num, status, company, parent_company, writing_company FROM policies ORDER BY id DESC LIMIT 5")
    print("\nLast 5 Policies:")
    for r in c.fetchall():
        print(f"ID={r[0]}, CustID={r[1]}, Num={r[2]}, Status={r[3]}, Company={r[4]}, Parent={r[5]}, WritingCompany={r[6]}")
        
    # Query customer 18 and 21 policies specifically
    for cid in [18, 21]:
        c.execute("SELECT id, policy_num, status, company, parent_company, writing_company FROM policies WHERE customer_id=?", (cid,))
        rows = c.fetchall()
        print(f"\nPolicies for Customer {cid} (count={len(rows)}):")
        for r in rows:
            print(f"  ID={r[0]}, Num={r[1]}, Status={r[2]}, Company={r[3]}, Parent={r[4]}, WritingCompany={r[5]}")
            
    conn.close()

if __name__ == '__main__':
    run_queries()
