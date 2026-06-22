import sqlite3
import bcrypt

conn = sqlite3.connect('ams360.db')
c = conn.cursor()
c.execute("SELECT email, encrypted_password, raw_user_meta_data FROM users")
rows = c.fetchall()

# Test common passwords
test_passwords = [
    "capco2026#",
    "Capco@2026#",
    "Capco2026#",
    "capco@2026",
    "Capco2026",
    "capco2026",
    "password",
    "Password123",
    "Agency@2026",
    "agency2026",
    "Sterling2026",
]

for row in rows:
    email, hashed, meta = row
    print(f"\nEmail: {email}")
    print(f"Meta: {meta}")
    for pwd in test_passwords:
        try:
            if bcrypt.checkpw(pwd.encode('utf-8'), hashed.encode('utf-8')):
                print(f"  ✅ Password found: '{pwd}'")
                break
        except Exception as e:
            pass
    else:
        print(f"  ❌ No password matched from list")

conn.close()
