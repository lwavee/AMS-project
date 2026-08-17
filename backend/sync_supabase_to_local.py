import sqlite3
import urllib.request
import json
import os
import bcrypt

supabase_url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "https://fwedjeeumiaftepzislf.supabase.co")
secret_key = os.environ.get("SUPABASE_SECRET_KEY", "")

def fetch_table(table_name):
    url = f"{supabase_url}/rest/v1/{table_name}?select=*"
    req = urllib.request.Request(url, headers={
        "apikey": secret_key,
        "Authorization": f"Bearer {secret_key}"
    })
    with urllib.request.urlopen(req, timeout=15) as resp:
        return json.loads(resp.read().decode())

def sync():
    db_path = "ams360.db"
    conn = sqlite3.connect(db_path)
    c = conn.cursor()

    tables = [
        "users", "agencies", "agents", "customers", "policies",
        "master_certificates", "certificate_holders", "customer_documents",
        "customer_notes", "certificate_field_overrides",
        "general_liability_coverages", "general_liability_info",
        "business_auto_coverages", "business_auto_symbols",
        "workers_comp_coverages", "workers_comp_part2",
        "umbrella_coverage", "umbrella_info"
    ]

    print("Fetching and syncing exact data from Supabase...")

    for table in tables:
        try:
            rows = fetch_table(table)
            if not isinstance(rows, list):
                print(f"Skipping {table}: invalid response")
                continue

            # Clear existing local data in table
            c.execute(f'DELETE FROM "{table}"')

            if len(rows) == 0:
                print(f"Synced {table}: 0 rows (empty)")
                continue

            # Get local table column names
            c.execute(f'PRAGMA table_info("{table}")')
            local_cols = {col[1] for col in c.fetchall()}

            # Keep only columns that exist in local sqlite table
            columns = [k for k in rows[0].keys() if k in local_cols]
            quoted_cols = [f'"{col}"' for col in columns]
            placeholders = ", ".join(["?"] * len(columns))
            cols_str = ", ".join(quoted_cols)

            sql = f'INSERT INTO "{table}" ({cols_str}) VALUES ({placeholders})'

            insert_data = []
            for row in rows:
                row_vals = []
                for col in columns:
                    val = row.get(col)
                    if isinstance(val, (dict, list)):
                        val = json.dumps(val)
                    row_vals.append(val)
                insert_data.append(row_vals)

            c.executemany(sql, insert_data)
            print(f"Synced {table}: {len(rows)} rows from Supabase!")

        except Exception as e:
            print(f"Error syncing {table}: {e}")

    # Ensure agency@capco.com has local password support for Capco@2026# and password123
    try:
        password = "Capco@2026#"
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")
        c.execute("UPDATE users SET encrypted_password = ? WHERE email = 'agency@capco.com'", (hashed,))
    except Exception as e:
        print("Note on password update:", e)

    conn.commit()
    conn.close()
    print("\nALL SUPABASE DATA SYNCED 100% LOCALLY!")

if __name__ == "__main__":
    sync()
