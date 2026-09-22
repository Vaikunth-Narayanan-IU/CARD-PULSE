import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "card_pulse.db")

def get_db():
    # Attempt URI read-only connection first for Vercel serverless environment
    if os.path.exists(DB_PATH):
        try:
            conn = sqlite3.connect(f"file:{DB_PATH}?mode=ro", uri=True)
            conn.row_factory = sqlite3.Row
            return conn
        except Exception:
            pass
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    # Only execute write operations if database is writable
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.executescript("""
        CREATE TABLE IF NOT EXISTS dim_customer (
            customer_id TEXT PRIMARY KEY,
            country TEXT NOT NULL,
            signup_date TEXT NOT NULL,
            acquisition_channel TEXT NOT NULL,
            customer_type TEXT NOT NULL,
            device TEXT NOT NULL,
            risk_tier TEXT NOT NULL,
            behavioral_segment TEXT NOT NULL
        );
        """)
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"Skipping DB write init: {e}")

if __name__ == "__main__":
    init_db()
