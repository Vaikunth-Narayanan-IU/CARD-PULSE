import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "card_pulse.db")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    
    # Create DDL
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

    CREATE TABLE IF NOT EXISTS fact_customer_events (
        event_id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id TEXT NOT NULL,
        event_type TEXT NOT NULL,
        event_timestamp TEXT NOT NULL,
        country TEXT NOT NULL,
        FOREIGN KEY (customer_id) REFERENCES dim_customer (customer_id)
    );

    CREATE TABLE IF NOT EXISTS fact_card_transactions (
        transaction_id TEXT PRIMARY KEY,
        customer_id TEXT NOT NULL,
        transaction_date TEXT NOT NULL,
        merchant_category TEXT NOT NULL,
        amount REAL NOT NULL,
        transaction_country TEXT NOT NULL,
        transaction_status TEXT NOT NULL,
        FOREIGN KEY (customer_id) REFERENCES dim_customer (customer_id)
    );

    CREATE TABLE IF NOT EXISTS fact_funding (
        funding_id TEXT PRIMARY KEY,
        customer_id TEXT NOT NULL,
        funding_method TEXT NOT NULL,
        funding_amount REAL NOT NULL,
        funding_timestamp TEXT NOT NULL,
        funding_status TEXT NOT NULL,
        FOREIGN KEY (customer_id) REFERENCES dim_customer (customer_id)
    );

    CREATE TABLE IF NOT EXISTS fact_remittance (
        remittance_id TEXT PRIMARY KEY,
        customer_id TEXT NOT NULL,
        destination_country TEXT NOT NULL,
        send_amount REAL NOT NULL,
        fee REAL NOT NULL,
        send_timestamp TEXT NOT NULL,
        FOREIGN KEY (customer_id) REFERENCES dim_customer (customer_id)
    );

    CREATE TABLE IF NOT EXISTS fact_marketing_touch (
        touch_id TEXT PRIMARY KEY,
        customer_id TEXT NOT NULL,
        campaign TEXT NOT NULL,
        channel TEXT NOT NULL,
        touch_timestamp TEXT NOT NULL,
        attributed_cost REAL NOT NULL,
        FOREIGN KEY (customer_id) REFERENCES dim_customer (customer_id)
    );

    CREATE TABLE IF NOT EXISTS fact_experiment (
        customer_id TEXT NOT NULL,
        experiment_id TEXT NOT NULL,
        variant TEXT NOT NULL,
        exposure_timestamp TEXT NOT NULL,
        converted INTEGER NOT NULL,
        PRIMARY KEY (customer_id, experiment_id),
        FOREIGN KEY (customer_id) REFERENCES dim_customer (customer_id)
    );

    -- Create Indexes for fast querying
    CREATE INDEX IF NOT EXISTS idx_cust_country ON dim_customer(country);
    CREATE INDEX IF NOT EXISTS idx_cust_channel ON dim_customer(acquisition_channel);
    CREATE INDEX IF NOT EXISTS idx_cust_type ON dim_customer(customer_type);
    CREATE INDEX IF NOT EXISTS idx_cust_device ON dim_customer(device);
    CREATE INDEX IF NOT EXISTS idx_cust_segment ON dim_customer(behavioral_segment);
    
    CREATE INDEX IF NOT EXISTS idx_evt_cust ON fact_customer_events(customer_id);
    CREATE INDEX IF NOT EXISTS idx_evt_type ON fact_customer_events(event_type);
    CREATE INDEX IF NOT EXISTS idx_evt_time ON fact_customer_events(event_timestamp);
    CREATE INDEX IF NOT EXISTS idx_evt_country ON fact_customer_events(country);

    CREATE INDEX IF NOT EXISTS idx_card_cust ON fact_card_transactions(customer_id);
    CREATE INDEX IF NOT EXISTS idx_card_date ON fact_card_transactions(transaction_date);

    CREATE INDEX IF NOT EXISTS idx_fund_cust ON fact_funding(customer_id);
    CREATE INDEX IF NOT EXISTS idx_fund_time ON fact_funding(funding_timestamp);

    CREATE INDEX IF NOT EXISTS idx_remit_cust ON fact_remittance(customer_id);
    CREATE INDEX IF NOT EXISTS idx_remit_time ON fact_remittance(send_timestamp);
    
    CREATE INDEX IF NOT EXISTS idx_exp_expid ON fact_experiment(experiment_id);
    """)

    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    print("Database initialized successfully.")
