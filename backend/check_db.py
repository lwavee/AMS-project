import sqlite3

conn = sqlite3.connect('ams360.db')
c = conn.cursor()
c.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = [r[0] for r in c.fetchall()]
print("Tables:", tables)

# Check for users table
for t in tables:
    if 'user' in t.lower() or 'auth' in t.lower():
        c.execute(f"SELECT * FROM '{t}' LIMIT 3")
        rows = c.fetchall()
        c.execute(f"PRAGMA table_info('{t}')")
        cols = [r[1] for r in c.fetchall()]
        print(f"\nTable '{t}' columns: {cols}")
        print(f"Rows: {rows[:3]}")

conn.close()
