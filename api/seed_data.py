import sqlite3
import random
import uuid
from datetime import datetime, timedelta
import os
import sys

# Add directory to sys.path
sys.path.append(os.path.dirname(__file__))
from database import get_db, init_db

def generate_synthetic_data(num_customers=25000):
    print(f"Generating synthetic dataset for {num_customers} customers...")
    
    init_db()
    conn = get_db()
    cursor = conn.cursor()
    
    # Check if data already exists
    cursor.execute("SELECT COUNT(*) FROM dim_customer")
    existing_count = cursor.fetchone()[0]
    if existing_count >= num_customers:
        print(f"Database already contains {existing_count} customers. Skipping generation.")
        conn.close()
        return

    # Clear existing tables if partial
    cursor.executescript("""
    DELETE FROM fact_experiment;
    DELETE FROM fact_marketing_touch;
    DELETE FROM fact_remittance;
    DELETE FROM fact_funding;
    DELETE FROM fact_card_transactions;
    DELETE FROM fact_customer_events;
    DELETE FROM dim_customer;
    """)

    # Distributions & Setup
    countries = ["United States", "Mexico", "Philippines", "India", "Colombia"]
    country_weights = [0.30, 0.25, 0.20, 0.15, 0.10]
    
    channels = ["Paid Search", "Paid Social", "Organic", "Referral", "Remittance Cross-Sell"]
    channel_weights = [0.25, 0.25, 0.20, 0.15, 0.15]
    
    cust_types = ["New Customer", "Existing Remittance Customer", "High-Frequency Sender", "High-Value Sender"]
    cust_type_weights = [0.50, 0.30, 0.10, 0.10]
    
    devices = ["iOS", "Android", "Web"]
    device_weights = [0.40, 0.45, 0.15]
    
    risk_tiers = ["Low", "Medium", "High"]
    risk_weights = [0.70, 0.22, 0.08]
    
    merchant_categories = ["Grocery", "Dining", "Travel", "Retail", "Utilities", "Online"]
    funding_methods = ["Debit Card", "Bank Transfer", "Direct Deposit", "Cash Deposit"]
    
    start_date = datetime(2026, 3, 22, 0, 0, 0)
    end_date = datetime(2026, 9, 22, 23, 59, 59)
    total_seconds = int((end_date - start_date).total_seconds())
    
    dim_customers = []
    fact_events = []
    fact_transactions = []
    fact_fundings = []
    fact_remittances = []
    fact_marketing_touches = []
    fact_experiments = []
    
    # Pre-seeded experiment setup for MX + Android + New Customer
    exp_participants = 0
    exp_target = 3200

    random.seed(42) # Deterministic realistic seed

    for i in range(num_customers):
        cust_id = f"CUST-{100000 + i}"
        country = random.choices(countries, country_weights)[0]
        channel = random.choices(channels, channel_weights)[0]
        cust_type = random.choices(cust_types, cust_type_weights)[0]
        device = random.choices(devices, device_weights)[0]
        risk = random.choices(risk_tiers, risk_weights)[0]
        
        # Random signup timestamp
        offset_sec = random.randint(0, total_seconds)
        signup_dt = start_date + timedelta(seconds=offset_sec)
        signup_str = signup_dt.isoformat()
        
        # Behavioral segment determination
        if cust_type in ["High-Frequency Sender", "High-Value Sender"]:
            if random.random() < 0.65:
                behavioral_segment = "Power Users"
            else:
                behavioral_segment = "Remittance Loyalists"
        elif cust_type == "Existing Remittance Customer":
            rand_val = random.random()
            if rand_val < 0.45:
                behavioral_segment = "Remittance Loyalists"
            elif rand_val < 0.75:
                behavioral_segment = "Power Users"
            else:
                behavioral_segment = "Dormant Activators"
        else: # New Customer
            rand_val = random.random()
            if rand_val < 0.35:
                behavioral_segment = "Card-First Explorers"
            elif rand_val < 0.65:
                behavioral_segment = "Funded but Unengaged"
            elif rand_val < 0.85:
                behavioral_segment = "Dormant Activators"
            else:
                behavioral_segment = "Power Users"

        dim_customers.append((
            cust_id, country, signup_str, channel, cust_type, device, risk, behavioral_segment
        ))

        # Marketing touch prior to signup
        touch_dt = signup_dt - timedelta(minutes=random.randint(5, 1440))
        attributed_cost = round(random.uniform(2.5, 18.0), 2)
        fact_marketing_touches.append((
            f"TCH-{uuid.uuid4().hex[:8]}", cust_id, f"Campaign_{channel.replace(' ', '_')}", channel, touch_dt.isoformat(), attributed_cost
        ))

        # FUNNEL GENERATION
        curr_dt = signup_dt
        
        # Stage 1: Acquired
        fact_events.append((None, cust_id, "Acquired", curr_dt.isoformat(), country))
        
        # Stage 2: Onboarding Started (~92%)
        if random.random() < 0.92:
            curr_dt += timedelta(minutes=random.randint(1, 15))
            fact_events.append((None, cust_id, "Onboarding Started", curr_dt.isoformat(), country))
            
            # Stage 3: KYC Passed (~78% of Onboarded)
            kyc_prob = 0.84 if cust_type != "New Customer" else 0.75
            if risk == "High": kyc_prob *= 0.60
            
            if random.random() < kyc_prob:
                curr_dt += timedelta(minutes=random.randint(5, 120))
                fact_events.append((None, cust_id, "KYC Passed", curr_dt.isoformat(), country))
                
                # Stage 4: Card Activated (~70% of KYC Passed)
                act_prob = 0.78 if cust_type != "New Customer" else 0.65
                if random.random() < act_prob:
                    curr_dt += timedelta(hours=random.randint(1, 48))
                    fact_events.append((None, cust_id, "Card Activated", curr_dt.isoformat(), country))
                    
                    # STAGE 5: Account Funded
                    # BASELINE = ~62% for new customers, ~78% for existing remittance customers.
                    # INTENTIONALLY SEEDED ANOMALY:
                    # New Android customers in Mexico have a steep drop: 48.2% conversion!
                    if country == "Mexico" and device == "Android" and cust_type == "New Customer":
                        fund_prob = 0.482
                    elif cust_type == "New Customer":
                        fund_prob = 0.617
                    else:
                        fund_prob = 0.785
                    
                    # Experiment Assignment for MX + Android + New Customer who activated card
                    if country == "Mexico" and device == "Android" and cust_type == "New Customer" and exp_participants < exp_target:
                        exp_participants += 1
                        variant = random.choices(["Control", "Variant A", "Variant B"], weights=[0.34, 0.33, 0.33])[0]
                        # Variant performance simulation
                        if variant == "Control":
                            exp_funded = (random.random() < 0.482)
                        elif variant == "Variant A":
                            exp_funded = (random.random() < 0.548)
                        else: # Variant B
                            exp_funded = (random.random() < 0.581)
                        
                        fact_experiments.append((
                            cust_id, "exp_post_activation_funding", variant, curr_dt.isoformat(), 1 if exp_funded else 0
                        ))
                        # Override fund_prob to match experiment behavior for consistency
                        is_funded = exp_funded
                    else:
                        is_funded = (random.random() < fund_prob)

                    if is_funded:
                        curr_dt += timedelta(hours=random.randint(1, 72))
                        fact_events.append((None, cust_id, "Account Funded", curr_dt.isoformat(), country))
                        
                        # Generate Funding Transaction
                        fund_amt = round(random.choice([25.0, 50.0, 100.0, 250.0, 500.0, 1000.0]), 2)
                        method = random.choice(funding_methods)
                        fact_fundings.append((
                            f"FND-{uuid.uuid4().hex[:8]}", cust_id, method, fund_amt, curr_dt.isoformat(), "Completed"
                        ))
                        
                        # Stage 6: First Card Spend (~82% of Funded)
                        spend_prob = 0.85 if behavioral_segment in ["Card-First Explorers", "Power Users"] else 0.75
                        if random.random() < spend_prob:
                            curr_dt += timedelta(hours=random.randint(2, 96))
                            fact_events.append((None, cust_id, "First Card Spend", curr_dt.isoformat(), country))
                            
                            # First Spend Transaction
                            tx_amt = round(random.uniform(8.50, 120.00), 2)
                            fact_transactions.append((
                                f"TXN-{uuid.uuid4().hex[:8]}", cust_id, curr_dt.isoformat(),
                                random.choice(merchant_categories), tx_amt, country, "Completed"
                            ))
                            
                            # Stage 7: Repeat Card Spend (~72% of First Spend)
                            if random.random() < 0.72:
                                curr_dt += timedelta(days=random.randint(1, 14))
                                if curr_dt <= end_date:
                                    fact_events.append((None, cust_id, "Repeat Card Spend", curr_dt.isoformat(), country))
                                    
                                    # Generate 2 to 12 repeat transactions over time
                                    num_txns = random.randint(2, 12)
                                    tx_dt = curr_dt
                                    for _ in range(num_txns):
                                        tx_dt += timedelta(days=random.randint(1, 10), hours=random.randint(1, 12))
                                        if tx_dt > end_date: break
                                        fact_transactions.append((
                                            f"TXN-{uuid.uuid4().hex[:8]}", cust_id, tx_dt.isoformat(),
                                            random.choice(merchant_categories), round(random.uniform(12.0, 180.0), 2),
                                            country, "Completed"
                                        ))
                                    
                                    # Stage 8: 30-Day Active (~65% of Repeat Spend)
                                    if random.random() < 0.65 and (curr_dt + timedelta(days=30)) <= end_date:
                                        act_dt = curr_dt + timedelta(days=30)
                                        fact_events.append((None, cust_id, "30-Day Active", act_dt.isoformat(), country))

        # Remittances Generation (for Remittance Loyalists, Power Users, Existing Remittance Customers)
        if behavioral_segment in ["Remittance Loyalists", "Power Users"] or cust_type != "New Customer":
            num_remits = random.randint(1, 8)
            remit_dt = signup_dt + timedelta(days=random.randint(1, 20))
            dest_country = "Mexico" if country == "United States" else random.choice(countries)
            for _ in range(num_remits):
                if remit_dt > end_date: break
                send_amt = round(random.uniform(150.0, 850.0), 2)
                fee = round(random.uniform(2.99, 9.99), 2)
                fact_remittances.append((
                    f"RMT-{uuid.uuid4().hex[:8]}", cust_id, dest_country, send_amt, fee, remit_dt.isoformat()
                ))
                remit_dt += timedelta(days=random.randint(15, 35))

    print("Inserting data into SQLite tables in batches...")
    
    cursor.executemany("""
    INSERT INTO dim_customer VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, dim_customers)
    
    cursor.executemany("""
    INSERT INTO fact_customer_events (event_id, customer_id, event_type, event_timestamp, country)
    VALUES (?, ?, ?, ?, ?)
    """, fact_events)

    cursor.executemany("""
    INSERT INTO fact_card_transactions VALUES (?, ?, ?, ?, ?, ?, ?)
    """, fact_transactions)

    cursor.executemany("""
    INSERT INTO fact_funding VALUES (?, ?, ?, ?, ?, ?)
    """, fact_fundings)

    cursor.executemany("""
    INSERT INTO fact_remittance VALUES (?, ?, ?, ?, ?, ?)
    """, fact_remittances)

    cursor.executemany("""
    INSERT INTO fact_marketing_touch VALUES (?, ?, ?, ?, ?, ?)
    """, fact_marketing_touches)

    cursor.executemany("""
    INSERT INTO fact_experiment VALUES (?, ?, ?, ?, ?)
    """, fact_experiments)

    conn.commit()
    conn.close()
    print("Database seeding completed successfully!")

if __name__ == "__main__":
    generate_synthetic_data(25000)
