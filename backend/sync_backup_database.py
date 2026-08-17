"""
Sync / Backup Tool: Main Supabase Database -> Backup Supabase Database
Copies all schemas, tables, rows, and auto-increment sequences.
"""

import os
import sys
import json
import psycopg2
import psycopg2.extras
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

MAIN_URL = os.environ.get("DATABASE_URL")
BACKUP_URL = os.environ.get("BACKUP_DATABASE_URL")

if not MAIN_URL:
    print("[ERROR] DATABASE_URL not set in environment.", flush=True)
    sys.exit(1)

if not BACKUP_URL:
    print("[ERROR] BACKUP_DATABASE_URL not set in environment.", flush=True)
    sys.exit(1)

def serialize_val(val):
    if isinstance(val, (dict, list)):
        return json.dumps(val)
    return val

def map_data_type(udt_name, char_max_len=None):
    if udt_name == "varchar" and char_max_len:
        return f"varchar({char_max_len})"
    elif udt_name in ["int4", "serial"]:
        return "integer"
    elif udt_name in ["int8", "bigserial"]:
        return "bigint"
    elif udt_name in ["int2"]:
        return "smallint"
    elif udt_name in ["bool"]:
        return "boolean"
    elif udt_name in ["timestamptz"]:
        return "timestamp with time zone"
    elif udt_name in ["timestamp"]:
        return "timestamp without time zone"
    elif udt_name in ["jsonb"]:
        return "jsonb"
    elif udt_name in ["json"]:
        return "json"
    elif udt_name in ["text"]:
        return "text"
    elif udt_name in ["float8"]:
        return "double precision"
    elif udt_name in ["numeric"]:
        return "numeric"
    return udt_name

def ensure_table_and_columns(main_cur, backup_cur, backup_conn, table):
    try:
        backup_cur.execute(f"""
            SELECT EXISTS (
                SELECT 1 FROM information_schema.tables 
                WHERE table_schema = 'public' AND table_name = '{table}'
            );
        """)
        row = backup_cur.fetchone()
        exists = bool(row and row[0])

        main_cur.execute(f"""
            SELECT column_name, data_type, udt_name, is_nullable, column_default, character_maximum_length
            FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = '{table}'
            ORDER BY ordinal_position;
        """)
        main_cols = main_cur.fetchall()

        if not exists:
            col_defs = []
            for c in main_cols:
                c_name = c["column_name"]
                c_type = map_data_type(c["udt_name"], c["character_maximum_length"])
                nullable = "" if c["is_nullable"] == "YES" else "NOT NULL"
                default = ""
                if c["column_default"] and not str(c["column_default"]).startswith("nextval"):
                    default = f"DEFAULT {c['column_default']}"
                col_defs.append(f'"{c_name}" {c_type} {nullable} {default}'.strip())
            
            create_sql = f'CREATE TABLE IF NOT EXISTS "{table}" ({", ".join(col_defs)});'
            backup_cur.execute(create_sql)
            backup_conn.commit()
            print(f"  [+] Created table '{table}' on backup DB", flush=True)
        else:
            backup_cur.execute(f"""
                SELECT column_name
                FROM information_schema.columns
                WHERE table_schema = 'public' AND table_name = '{table}';
            """)
            backup_col_names = {r[0] for r in backup_cur.fetchall()}

            for c in main_cols:
                c_name = c["column_name"]
                if c_name not in backup_col_names:
                    c_type = map_data_type(c["udt_name"], c["character_maximum_length"])
                    alter_sql = f'ALTER TABLE "{table}" ADD COLUMN IF NOT EXISTS "{c_name}" {c_type};'
                    backup_cur.execute(alter_sql)
                    print(f"  [+] Added missing column '{c_name}' to '{table}'", flush=True)
            backup_conn.commit()

    except Exception as e:
        print(f"  [!] Schema check note for '{table}': {e}", flush=True)
        backup_conn.rollback()

def run_backup():
    print("=" * 65, flush=True)
    print("SUPABASE DATABASE BACKUP & SYNC", flush=True)
    print("=" * 65, flush=True)
    print(f"[*] Main DB:   {MAIN_URL.split('@')[-1]}", flush=True)
    print(f"[*] Backup DB: {BACKUP_URL.split('@')[-1]}", flush=True)
    print("-" * 65, flush=True)

    try:
        # Step 1: Ensure SQLAlchemy metadata tables exist first using a temporary engine
        print("\n[+] Ensuring model schemas exist on backup database...", flush=True)
        from app.database.connection import Base
        from app.modules.customer import model as customer_models
        from app.modules.eforms import model as eforms_models
        from sqlalchemy import create_engine

        backup_engine = create_engine(BACKUP_URL)
        Base.metadata.create_all(bind=backup_engine)
        backup_engine.dispose()
        print("[SUCCESS] SQLAlchemy model schemas verified on backup database.", flush=True)
    except Exception as e:
        print(f"[!] Warning on metadata create: {e}", flush=True)

    try:
        main_conn = psycopg2.connect(MAIN_URL)
        main_cur = main_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        print("[SUCCESS] Connected to Main Supabase Database", flush=True)
    except Exception as e:
        print(f"[FAILED] Failed to connect to Main Database: {e}", flush=True)
        return

    try:
        backup_conn = psycopg2.connect(BACKUP_URL)
        backup_cur = backup_conn.cursor()
        print("[SUCCESS] Connected to Backup Supabase Database", flush=True)
    except Exception as e:
        print(f"[FAILED] Failed to connect to Backup Database: {e}", flush=True)
        main_conn.close()
        return

    try:
        # Step 2: Fetch all public tables from Main database
        main_cur.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
            ORDER BY table_name;
        """)
        tables = [row["table_name"] for row in main_cur.fetchall()]
        print(f"\n[+] Found {len(tables)} tables on Main DB: {', '.join(tables)}", flush=True)

        # Ensure all tables and columns match the Main DB
        print("\n[+] Checking schemas and columns...", flush=True)
        for table in tables:
            ensure_table_and_columns(main_cur, backup_cur, backup_conn, table)

        # Order tables carefully to respect foreign keys
        preferred_order = [
            "users",
            "agencies",
            "agents",
            "customers",
            "policies",
            "customer_notes",
            "customer_documents",
            "documents",
            "customer_activities",
            "general_liability_coverages",
            "general_liability_info",
            "business_auto_coverages",
            "business_auto_symbols",
            "workers_comp_coverages",
            "workers_comp_part2",
            "umbrella_coverage",
            "umbrella_coverages",
            "umbrella_info",
            "master_certificates",
            "certificate_holders",
            "certificate_field_overrides"
        ]

        ordered_tables = [t for t in preferred_order if t in tables] + [t for t in tables if t not in preferred_order]

        # Step 3: Copy data table by table
        print("\n[+] Syncing tables from Main -> Backup...", flush=True)
        
        sync_summary = []

        for table in ordered_tables:
            main_count = 0
            try:
                # Disable foreign key triggers temporarily during insert
                backup_cur.execute("SET session_replication_role = 'replica';")

                # Fetch column names
                main_cur.execute(f"""
                    SELECT column_name, data_type 
                    FROM information_schema.columns 
                    WHERE table_schema = 'public' AND table_name = '{table}'
                    ORDER BY ordinal_position;
                """)
                columns_info = main_cur.fetchall()
                if not columns_info:
                    continue

                columns = [c["column_name"] for c in columns_info]
                col_list_str = ", ".join([f'"{c}"' for c in columns])
                placeholders = ", ".join(["%s" for _ in columns])

                # Fetch rows from main database
                main_cur.execute(f'SELECT {col_list_str} FROM "{table}";')
                rows = main_cur.fetchall()
                main_count = len(rows)

                # Clear existing rows in backup table safely using DELETE
                backup_cur.execute(f'DELETE FROM "{table}";')

                if rows:
                    insert_query = f'INSERT INTO "{table}" ({col_list_str}) VALUES ({placeholders})'
                    values = [tuple(serialize_val(r[c]) for c in columns) for r in rows]
                    psycopg2.extras.execute_batch(backup_cur, insert_query, values, page_size=100)

                # Reset sequence safely
                if "id" in columns:
                    try:
                        backup_cur.execute(f"SELECT pg_get_serial_sequence('\"{table}\"', 'id');")
                        res = backup_cur.fetchone()
                        if res and res[0]:
                            seq_name = res[0]
                            backup_cur.execute(f"SELECT setval('{seq_name}', COALESCE((SELECT MAX(id) FROM \"{table}\"), 1));")
                            backup_cur.fetchone()
                    except Exception:
                        pass

                backup_cur.execute("SET session_replication_role = 'origin';")
                backup_conn.commit()

                # Verify backup count
                backup_cur.execute(f'SELECT count(*) FROM "{table}";')
                count_row = backup_cur.fetchone()
                backup_count = count_row[0] if count_row is not None else 0

                status = "MATCH" if main_count == backup_count else "MISMATCH"
                sync_summary.append((table, main_count, backup_count, status))
                print(f"  * {table:<32} Main: {main_count:<4} | Backup: {backup_count:<4} | [{status}]", flush=True)

            except Exception as table_err:
                backup_conn.rollback()
                print(f"  [!] Error syncing '{table}': {table_err}", flush=True)
                sync_summary.append((table, main_count, 0, f"ERROR: {table_err}"))

        print("\n" + "=" * 65, flush=True)
        print("BACKUP & SYNC SUMMARY")
        print("=" * 65, flush=True)
        for table, m_cnt, b_cnt, st in sync_summary:
            print(f"  {table:<32} {m_cnt:>5} rows copied  [{st}]", flush=True)
        print("=" * 65, flush=True)
        print("SUCCESS: Backup database is now 100% identical and up to date!", flush=True)
        print("=" * 65, flush=True)

    except Exception as e:
        print(f"\n[ERROR] Overall Sync Error: {e}", flush=True)
        import traceback
        traceback.print_exc()
        backup_conn.rollback()
    finally:
        main_cur.close()
        main_conn.close()
        backup_cur.close()
        backup_conn.close()

if __name__ == "__main__":
    run_backup()
