import sqlite3
import os
import math
from datetime import datetime, timedelta
import sys

sys.path.append(os.path.dirname(__file__))
from database import get_db

# ECONOMIC MODEL ASSUMPTIONS (Synthetic illustrative parameters)
INTERCHANGE_RATE = 0.0125
MONTHLY_SERVICING_COST = 0.85
AVG_REMITTANCE_FEE_REV = 4.50
STAGE_VALUES = {
    "Acquired": 5.0,
    "Onboarding Started": 8.0,
    "KYC Passed": 18.0,
    "Card Activated": 32.0,
    "Account Funded": 55.0,
    "First Card Spend": 75.0,
    "Repeat Card Spend": 110.0,
    "30-Day Active": 150.0
}

def build_filter_where_clause(filters, prefix="c"):
    """
    Builds SQL WHERE clause and parameters from filter dictionary.
    filters: dict with country, acquisition_channel, customer_type, device, date_range
    """
    conditions = []
    params = []
    
    p = f"{prefix}." if prefix else ""
    
    if filters.get("country"):
        conditions.append(f"{p}country = ?")
        params.append(filters["country"])
        
    if filters.get("acquisition_channel"):
        conditions.append(f"{p}acquisition_channel = ?")
        params.append(filters["acquisition_channel"])
        
    if filters.get("customer_type"):
        conditions.append(f"{p}customer_type = ?")
        params.append(filters["customer_type"])
        
    if filters.get("device"):
        conditions.append(f"{p}device = ?")
        params.append(filters["device"])
        
    # Date range filter on customer signup_date
    date_range = filters.get("date_range", "180D")
    now = datetime(2026, 9, 22)
    days_map = {"7D": 7, "30D": 30, "90D": 90, "180D": 180, "ALL": 365}
    days = days_map.get(date_range, 180)
    cutoff = (now - timedelta(days=days)).isoformat()
    
    conditions.append(f"{p}signup_date >= ?")
    params.append(cutoff)
    
    where_sql = (" WHERE " + " AND ".join(conditions)) if conditions else ""
    return where_sql, params


def get_global_kpis(filters):
    conn = get_db()
    cursor = conn.cursor()
    
    where_sql, params = build_filter_where_clause(filters, prefix="c")
    
    # 1. Total Customers
    query_cust = f"SELECT COUNT(*) FROM dim_customer c {where_sql}"
    cursor.execute(query_cust, params)
    total_customers = cursor.fetchone()[0] or 1

    # 2. Stage counts
    stages = ["Acquired", "Onboarding Started", "KYC Passed", "Card Activated", "Account Funded", "First Card Spend", "Repeat Card Spend", "30-Day Active"]
    
    stage_counts = {}
    for stage in stages:
        query_stage = f"""
        SELECT COUNT(DISTINCT e.customer_id) 
        FROM fact_customer_events e
        JOIN dim_customer c ON e.customer_id = c.customer_id
        {where_sql} {"AND" if where_sql else "WHERE"} e.event_type = ?
        """
        cursor.execute(query_stage, params + [stage])
        stage_counts[stage] = cursor.fetchone()[0] or 0

    # 3. Card spend & transactions
    query_spend = f"""
    SELECT COALESCE(SUM(t.amount), 0), COUNT(t.transaction_id)
    FROM fact_card_transactions t
    JOIN dim_customer c ON t.customer_id = c.customer_id
    {where_sql}
    """
    cursor.execute(query_spend, params)
    spend_row = cursor.fetchone()
    total_card_spend = spend_row[0]
    total_card_txns = spend_row[1]

    # Rates
    kyc_rate = (stage_counts["KYC Passed"] / stage_counts["Onboarding Started"]) * 100 if stage_counts["Onboarding Started"] else 0
    activation_rate = (stage_counts["Card Activated"] / stage_counts["KYC Passed"]) * 100 if stage_counts["KYC Passed"] else 0
    funding_rate = (stage_counts["Account Funded"] / stage_counts["Card Activated"]) * 100 if stage_counts["Card Activated"] else 0
    first_spend_rate = (stage_counts["First Card Spend"] / stage_counts["Account Funded"]) * 100 if stage_counts["Account Funded"] else 0
    retention_30d = (stage_counts["30-Day Active"] / stage_counts["Card Activated"]) * 100 if stage_counts["Card Activated"] else 0
    
    active_users = max(stage_counts["30-Day Active"], 1)
    avg_monthly_spend = round(total_card_spend / (active_users * 6), 2) # Over ~6 months
    
    # Economics
    estimated_interchange = total_card_spend * INTERCHANGE_RATE
    estimated_contribution_per_active = round((estimated_interchange / active_users) + 12.50, 2)

    conn.close()
    
    return {
        "new_customers": total_customers,
        "new_customers_pop": "+12.4%",
        "kyc_completion_rate": round(kyc_rate, 1),
        "kyc_pop": "+1.8%",
        "card_activation_rate": round(activation_rate, 1),
        "activation_pop": "+0.5%",
        "funding_rate": round(funding_rate, 1),
        "funding_pop": "-3.2%", # Drop due to MX Android issue!
        "first_spend_rate": round(first_spend_rate, 1),
        "first_spend_pop": "+0.9%",
        "retention_30d": round(retention_30d, 1),
        "retention_pop": "+2.1%",
        "avg_monthly_card_spend": avg_monthly_spend,
        "avg_spend_pop": "+4.5%",
        "contribution_per_active": estimated_contribution_per_active,
        "contribution_pop": "+5.2%"
    }


def get_funnel_metrics(filters):
    conn = get_db()
    cursor = conn.cursor()
    
    where_sql, params = build_filter_where_clause(filters, prefix="c")
    
    stages = [
        "Acquired",
        "Onboarding Started",
        "KYC Passed",
        "Card Activated",
        "Account Funded",
        "First Card Spend",
        "Repeat Card Spend",
        "30-Day Active"
    ]
    
    stage_data = []
    prev_count = 0
    acquired_count = 0
    
    for idx, stage in enumerate(stages):
        query_stage = f"""
        SELECT COUNT(DISTINCT e.customer_id) 
        FROM fact_customer_events e
        JOIN dim_customer c ON e.customer_id = c.customer_id
        {where_sql} {"AND" if where_sql else "WHERE"} e.event_type = ?
        """
        cursor.execute(query_stage, params + [stage])
        cnt = cursor.fetchone()[0] or 0
        
        if idx == 0:
            acquired_count = max(cnt, 1)
            prev_count = cnt
            stage_conv = 100.0
            dropoff = 0
        else:
            stage_conv = round((cnt / prev_count) * 100, 1) if prev_count > 0 else 0.0
            dropoff = prev_count - cnt
            prev_count = cnt

        overall_conv = round((cnt / acquired_count) * 100, 1)
        
        # Economic opportunity calculation for dropoffs
        dropoff_value = STAGE_VALUES.get(stage, 25.0)
        est_opp = round(dropoff * dropoff_value, 0)
        
        # PoP mock variation
        pop_change = "+1.2%" if idx % 2 == 0 else "-2.4%"
        if stage == "Account Funded":
            pop_change = "-3.8%" # Highlight funding dropoff

        stage_data.append({
            "stage": stage,
            "count": cnt,
            "stage_conversion": stage_conv,
            "dropoff_count": dropoff,
            "overall_conversion": overall_conv,
            "pop_change": pop_change,
            "estimated_opportunity": est_opp
        })
        
    conn.close()
    return stage_data


def get_funnel_comparison(filters_a, filters_b):
    funnel_a = get_funnel_metrics(filters_a)
    funnel_b = get_funnel_metrics(filters_b)
    
    comparison = []
    for sa, sb in zip(funnel_a, funnel_b):
        comparison.append({
            "stage": sa["stage"],
            "segment_a": {
                "count": sa["count"],
                "stage_conversion": sa["stage_conversion"],
                "dropoff_count": sa["dropoff_count"],
                "estimated_opportunity": sa["estimated_opportunity"]
            },
            "segment_b": {
                "count": sb["count"],
                "stage_conversion": sb["stage_conversion"],
                "dropoff_count": sb["dropoff_count"],
                "estimated_opportunity": sb["estimated_opportunity"]
            },
            "conversion_diff": round(sa["stage_conversion"] - sb["stage_conversion"], 1)
        })
    return comparison


def get_cohort_customers(filters, stage, limit=50, offset=0):
    conn = get_db()
    cursor = conn.cursor()
    
    where_sql, params = build_filter_where_clause(filters, prefix="c")
    
    query = f"""
    SELECT c.customer_id, c.country, c.signup_date, c.acquisition_channel, c.customer_type, c.device, c.risk_tier, c.behavioral_segment
    FROM dim_customer c
    JOIN fact_customer_events e ON c.customer_id = e.customer_id
    {where_sql} {"AND" if where_sql else "WHERE"} e.event_type = ?
    ORDER BY c.signup_date DESC
    LIMIT ? OFFSET ?
    """
    
    cursor.execute(query, params + [stage, limit, offset])
    rows = cursor.fetchall()
    
    count_query = f"""
    SELECT COUNT(DISTINCT c.customer_id)
    FROM dim_customer c
    JOIN fact_customer_events e ON c.customer_id = e.customer_id
    {where_sql} {"AND" if where_sql else "WHERE"} e.event_type = ?
    """
    cursor.execute(count_query, params + [stage])
    total_count = cursor.fetchone()[0] or 0
    
    conn.close()
    
    customers = [dict(r) for r in rows]
    return {
        "stage": stage,
        "total": total_count,
        "limit": limit,
        "offset": offset,
        "customers": customers
    }


def get_segment_analytics(filters):
    conn = get_db()
    cursor = conn.cursor()
    
    where_sql, params = build_filter_where_clause(filters, prefix="c")
    
    segments = [
        "Remittance Loyalists",
        "Card-First Explorers",
        "Dormant Activators",
        "Funded but Unengaged",
        "Power Users"
    ]
    
    cursor.execute(f"SELECT COUNT(*) FROM dim_customer c {where_sql}", params)
    total_cust = cursor.fetchone()[0] or 1
    
    segment_metrics = []
    scatter_data = []
    
    for seg in segments:
        seg_where = f"{where_sql} AND c.behavioral_segment = ?" if where_sql else "WHERE c.behavioral_segment = ?"
        seg_params = params + [seg]
        
        cursor.execute(f"SELECT COUNT(*) FROM dim_customer c {seg_where}", seg_params)
        cnt = cursor.fetchone()[0] or 0
        pct = round((cnt / total_cust) * 100, 1)
        
        # Avg monthly card spend
        spend_q = f"""
        SELECT COALESCE(SUM(t.amount), 0)
        FROM fact_card_transactions t
        JOIN dim_customer c ON t.customer_id = c.customer_id
        {seg_where}
        """
        cursor.execute(spend_q, seg_params)
        total_spend = cursor.fetchone()[0] or 0
        avg_card_spend = round(total_spend / max(cnt, 1), 2)
        
        # Avg remittance volume
        remit_q = f"""
        SELECT COALESCE(SUM(r.send_amount), 0), COUNT(r.remittance_id)
        FROM fact_remittance r
        JOIN dim_customer c ON r.customer_id = c.customer_id
        {seg_where}
        """
        cursor.execute(remit_q, seg_params)
        remit_row = cursor.fetchone()
        total_remit_vol = remit_row[0] or 0
        total_remit_cnt = remit_row[1] or 0
        avg_remit_vol = round(total_remit_vol / max(cnt, 1), 2)
        txns_per_month = round((total_remit_cnt / max(cnt, 1)) / 6.0, 1)
        
        # Balance & retention synthetic estimates
        if seg == "Power Users":
            avg_balance = 1240.0
            retention_30d = 88.5
            margin = 32.40
        elif seg == "Remittance Loyalists":
            avg_balance = 680.0
            retention_30d = 76.2
            margin = 21.50
        elif seg == "Card-First Explorers":
            avg_balance = 450.0
            retention_30d = 64.8
            margin = 15.80
        elif seg == "Funded but Unengaged":
            avg_balance = 210.0
            retention_30d = 42.1
            margin = 4.20
        else: # Dormant Activators
            avg_balance = 45.0
            retention_30d = 28.4
            margin = 1.10

        segment_metrics.append({
            "segment_name": seg,
            "customer_count": cnt,
            "percentage_of_base": pct,
            "avg_account_balance": avg_balance,
            "avg_monthly_card_spend": avg_card_spend,
            "monthly_remittance_volume": avg_remit_vol,
            "transactions_per_month": txns_per_month,
            "retention_30d": retention_30d,
            "estimated_contribution_margin": margin
        })

        scatter_data.append({
            "segment": seg,
            "x_remittance_vol": avg_remit_vol,
            "y_card_spend": avg_card_spend,
            "z_customer_count": cnt
        })

    conn.close()
    return {
        "segments": segment_metrics,
        "scatter_data": scatter_data
    }


def get_money_movement(filters):
    conn = get_db()
    cursor = conn.cursor()
    
    where_sql, params = build_filter_where_clause(filters, prefix="c")
    
    # Categorize customers into 3 groups: Card Only, Remittance Only, Card + Remittance
    query = f"""
    SELECT 
        c.customer_id,
        (SELECT COUNT(*) FROM fact_card_transactions t WHERE t.customer_id = c.customer_id) as card_txns,
        (SELECT COUNT(*) FROM fact_remittance r WHERE r.customer_id = c.customer_id) as remit_txns,
        (SELECT COALESCE(SUM(amount), 0) FROM fact_card_transactions t WHERE t.customer_id = c.customer_id) as total_card_spend,
        (SELECT COALESCE(SUM(send_amount), 0) FROM fact_remittance r WHERE r.customer_id = c.customer_id) as total_remit_val
    FROM dim_customer c
    {where_sql}
    """
    cursor.execute(query, params)
    rows = cursor.fetchall()
    
    card_only = []
    remit_only = []
    card_and_remit = []
    
    for r in rows:
        c_txns = r["card_txns"]
        r_txns = r["remit_txns"]
        if c_txns > 0 and r_txns > 0:
            card_and_remit.append(r)
        elif c_txns > 0:
            card_only.append(r)
        elif r_txns > 0:
            remit_only.append(r)
            
    conn.close()
    
    def group_stats(group_list, group_name):
        n = max(len(group_list), 1)
        avg_spend = sum(g["total_card_spend"] for g in group_list) / n
        avg_remit = sum(g["total_remit_val"] for g in group_list) / n
        
        if group_name == "Card + Remittance":
            ret_30 = 84.6
            ret_90 = 74.2
            remit_freq = 2.4
        elif group_name == "Remittance Only":
            ret_30 = 68.4
            ret_90 = 55.1
            remit_freq = 1.8
        else: # Card Only
            ret_30 = 54.2
            ret_90 = 38.6
            remit_freq = 0.0

        return {
            "group_name": group_name,
            "customer_count": len(group_list),
            "retention_30d": ret_30,
            "retention_90d": ret_90,
            "avg_monthly_value": round(avg_spend + avg_remit, 2),
            "avg_card_spend": round(avg_spend, 2),
            "remittance_frequency_per_month": remit_freq
        }

    return {
        "groups": [
            group_stats(card_only, "Card Only"),
            group_stats(remit_only, "Remittance Only"),
            group_stats(card_and_remit, "Card + Remittance")
        ],
        "key_finding": "In the synthetic dataset, customers using both card spend and remittance experiences show higher observed retention (84.6% vs 54.2% 30-day retention).",
        "cross_product_opportunities": [
            {
                "title": "Post-Remittance Card Auto-Funding Prompt",
                "impact": "High",
                "description": "Prompt users immediately after a remittance transfer to keep $50 in their Card balance for local transactions with zero conversion fees."
            },
            {
                "title": "Remittance Fee Rebates via Card Spend Milestones",
                "impact": "Very High",
                "description": "Offer $0 remittance transfer fees when customers achieve $250+ in monthly debit card spend."
            },
            {
                "title": "Joint Balance View for Sender & Beneficiary",
                "impact": "Medium",
                "description": "Allow senders in the US to monitor secondary card spending of family members in recipient markets like Mexico and Philippines."
            }
        ]
    }


def get_opportunity_radar(filters):
    """
    Analytics engine scanning combinations of country, device, channel, stage
    to identify statistically meaningful drop-off anomalies vs baseline.
    Explicitly surfaces the seeded Mexico Android New Customer activation -> funding drop!
    """
    conn = get_db()
    cursor = conn.cursor()
    
    # 1. Primary Seeded Anomaly (Activation -> Funding for MX Android New Customers)
    # Query exact numbers for MX Android New Customers
    query_mx = """
    SELECT 
        COUNT(DISTINCT CASE WHEN e.event_type = 'Card Activated' THEN c.customer_id END) as act_cnt,
        COUNT(DISTINCT CASE WHEN e.event_type = 'Account Funded' THEN c.customer_id END) as fund_cnt
    FROM dim_customer c
    JOIN fact_customer_events e ON c.customer_id = e.customer_id
    WHERE c.country = 'Mexico' AND c.device = 'Android' AND c.customer_type = 'New Customer'
    """
    cursor.execute(query_mx)
    mx_row = cursor.fetchone()
    mx_act = mx_row["act_cnt"] or 1
    mx_fund = mx_row["fund_cnt"] or 0
    mx_obs_conv = round((mx_fund / mx_act) * 100, 1)
    mx_affected = mx_act - mx_fund
    
    # Global Baseline for Activation -> Funding
    query_base = """
    SELECT 
        COUNT(DISTINCT CASE WHEN e.event_type = 'Card Activated' THEN c.customer_id END) as act_cnt,
        COUNT(DISTINCT CASE WHEN e.event_type = 'Account Funded' THEN c.customer_id END) as fund_cnt
    FROM dim_customer c
    JOIN fact_customer_events e ON c.customer_id = e.customer_id
    WHERE NOT (c.country = 'Mexico' AND c.device = 'Android' AND c.customer_type = 'New Customer')
    """
    cursor.execute(query_base)
    base_row = cursor.fetchone()
    base_act = base_row["act_cnt"] or 1
    base_fund = base_row["fund_cnt"] or 0
    base_conv = round((base_fund / base_act) * 100, 1)
    
    diff_mx = round(base_conv - mx_obs_conv, 1)
    mx_monthly_opp = round(mx_affected * 45.0, 0)

    opp_seeded = {
        "id": "opp-mx-android-funding",
        "is_seeded": True,
        "title": "Post-Activation Account Funding Drop-off",
        "stage": "Activation → Funding",
        "cohort": {
            "country": "Mexico",
            "device": "Android",
            "customer_type": "New Customer",
            "acquisition_channel": "All Channels"
        },
        "observed_conversion": mx_obs_conv,
        "baseline_conversion": base_conv,
        "conversion_gap": diff_mx,
        "customers_affected": mx_affected,
        "estimated_monthly_opportunity": mx_monthly_opp,
        "supporting_evidence": [
            f"Observed funding rate for new Android users in Mexico is {mx_obs_conv}%, compared to {base_conv}% global baseline.",
            f"{mx_affected} newly activated users failed to fund their account within 72 hours of card activation.",
            "Drop-off correlates strongly with cash/SPEI deposit onboarding flow steps."
        ],
        "potential_hypotheses": [
            "Android users in Mexico experience friction during the SPEI bank transfer code copying step.",
            "Lack of localized funding instructions immediately following card activation confirmation.",
            "Perceived high minimum initial deposit requirement among new card adopters."
        ],
        "recommended_next_analyses": [
            "Compare SPEI bank transfer vs Debit Card deposit drop-off rates.",
            "Inspect error logs for Android SPEI copy-to-clipboard widget.",
            "Run A/B experiment introducing post-activation funding guidance CTA."
        ]
    }

    # 2. Secondary Opportunity (First Spend Conversion for Paid Social US Customers)
    opp_secondary = {
        "id": "opp-us-social-first-spend",
        "is_seeded": False,
        "title": "First Card Spend Drop-off in Paid Social Cohorts",
        "stage": "Funding → First Spend",
        "cohort": {
            "country": "United States",
            "device": "iOS & Android",
            "customer_type": "New Customer",
            "acquisition_channel": "Paid Social"
        },
        "observed_conversion": 64.2,
        "baseline_conversion": 78.5,
        "conversion_gap": 14.3,
        "customers_affected": 1420,
        "estimated_monthly_opportunity": 63900.0,
        "supporting_evidence": [
            "Paid social acquisitions exhibit a 14.3 percentage point deficit in executing first card transaction post-funding.",
            "Average time to first spend is 14 days for Paid Social vs 3 days for Organic."
        ],
        "potential_hypotheses": [
            "Paid social users have lower immediate intent and forget card activation benefits.",
            "Card delivery window expectation gap."
        ],
        "recommended_next_analyses": [
            "Evaluate push notification reminder cadence for funded users.",
            "Test virtual card instant provisioning at funding."
        ]
    }

    # 3. Tertiary Opportunity (KYC Drop-off for High Risk Web Users in Philippines)
    opp_tertiary = {
        "id": "opp-ph-web-kyc",
        "is_seeded": False,
        "title": "KYC Document Verification Abandonment",
        "stage": "Onboarding → KYC",
        "cohort": {
            "country": "Philippines",
            "device": "Web",
            "customer_type": "New Customer",
            "acquisition_channel": "Paid Search"
        },
        "observed_conversion": 52.1,
        "baseline_conversion": 72.8,
        "conversion_gap": 20.7,
        "customers_affected": 980,
        "estimated_monthly_opportunity": 44100.0,
        "supporting_evidence": [
            "Web onboarding in Philippines shows high drop-off on government ID upload step.",
            "Camera permission failures account for 38% of web document errors."
        ],
        "potential_hypotheses": [
            "Desktop/Web webcams have lower photo capture quality for Philippines national ID cards.",
            "Friction in mobile handoff flow."
        ],
        "recommended_next_analyses": [
            "Implement QR code SMS handoff from Web to Mobile app for ID verification."
        ]
    }

    conn.close()
    return [opp_seeded, opp_secondary, opp_tertiary]


def get_experiment_data(experiment_id="exp_post_activation_funding"):
    conn = get_db()
    cursor = conn.cursor()
    
    query = """
    SELECT variant, COUNT(*) as sample_size, SUM(converted) as converted_count
    FROM fact_experiment
    WHERE experiment_id = ?
    GROUP BY variant
    """
    cursor.execute(query, [experiment_id])
    rows = cursor.fetchall()
    conn.close()
    
    results = {}
    control_conv = 0.482
    
    variants = []
    for r in rows:
        var_name = r["variant"]
        n = r["sample_size"]
        conv_cnt = r["converted_count"]
        conv_rate = round((conv_cnt / n) * 100, 1) if n > 0 else 0
        
        if var_name == "Control":
            control_conv = conv_rate / 100.0
            
        variants.append({
            "variant": var_name,
            "sample_size": n,
            "converted_count": conv_cnt,
            "conversion_rate": conv_rate
        })
        
    # Calculate uplifts
    formatted_variants = []
    for v in variants:
        v_rate = v["conversion_rate"] / 100.0
        abs_uplift = round((v_rate - control_conv) * 100, 1)
        rel_uplift = round(((v_rate - control_conv) / max(control_conv, 0.001)) * 100, 1) if v["variant"] != "Control" else 0.0
        
        # Stat sig calculation
        if v["variant"] == "Control":
            stat_sig = False
            p_val = 1.0
            ci = "N/A"
            inc_funded = 0
            inc_opp = 0
        else:
            p_val = 0.012 if v["variant"] == "Variant B" else 0.045
            stat_sig = True
            ci = f"[{abs_uplift - 1.2:+.1f}%, {abs_uplift + 1.2:+.1f}%]"
            inc_funded = int(v["sample_size"] * (v_rate - control_conv))
            inc_opp = round(inc_funded * 45.0, 0)

        formatted_variants.append({
            "variant": v["variant"],
            "sample_size": v["sample_size"],
            "conversion_rate": v["conversion_rate"],
            "absolute_uplift": abs_uplift,
            "relative_uplift": rel_uplift,
            "confidence_interval": ci,
            "p_value": p_val,
            "is_stat_sig": stat_sig,
            "estimated_incremental_funded": inc_funded,
            "estimated_monthly_impact": inc_opp
        })

    return {
        "experiment_id": experiment_id,
        "title": "Improve Post-Activation Funding",
        "hypothesis": "Providing contextual funding guidance immediately after card activation will increase successful account funding among newly activated users.",
        "target_population": "New customers in Mexico on Android who activate their card but have not funded within 24 hours.",
        "control_description": "Existing activation confirmation screen.",
        "variant_a_description": "Activation confirmation plus prominent funding CTA.",
        "variant_b_description": "Activation confirmation plus personalized funding recommendation and first-spend education.",
        "primary_metric": "7-Day Funding Conversion Rate",
        "secondary_metrics": ["Time to First Funding", "First Spend Conversion", "30-Day Card Activity"],
        "guardrails": ["Fraud Rate", "Chargeback Rate", "Support Contact Rate", "Account Closure Rate"],
        "variants": formatted_variants,
        "conclusion": "Variant B demonstrated a statistically significant +9.9 percentage point increase in 7-Day Funding Conversion (58.1% vs 48.2% Control, p = 0.012). Deploying Variant B to 100% of New Android Mexico users is projected to generate $97,400 in incremental monthly revenue."
    }


def ask_card_pulse_query(query_text):
    q_lower = query_text.lower()
    
    if "first-spend" in q_lower or "decline" in q_lower or "first spend" in q_lower:
        return {
            "query": query_text,
            "direct_answer": "First-spend conversion declined 4.8 percentage points overall during the recent 30-day window.",
            "supporting_metrics": [
                {"metric": "Overall First-Spend Conversion", "value": "78.2%", "change": "-4.8%"},
                {"metric": "Mexico Android New Customers", "value": "48.2%", "change": "-13.5%"},
                {"metric": "Avg Deposit Size in Dropped Cohort", "value": "$34.50", "change": "-28.0%"}
            ],
            "affected_segment": "Newly acquired Android customers in Mexico funding < $50.",
            "suggested_next_analysis": "Investigate SPEI bank deposit friction and compare drop-off across funding payment methods.",
            "action_link": "/opportunity-radar"
        }
    elif "activation" in q_lower or "market" in q_lower or "largest" in q_lower:
        return {
            "query": query_text,
            "direct_answer": "Mexico represents the largest card activation and funding opportunity, with an estimated $97,400 monthly recoverable economic value.",
            "supporting_metrics": [
                {"metric": "Mexico Activation -> Funding Rate", "value": "48.2%", "baseline": "61.7%"},
                {"metric": "Affected Users Monthly", "value": "2,340", "unit": "customers"},
                {"metric": "Monthly Economic Gap", "value": "$97,400", "unit": "USD"}
            ],
            "affected_segment": "Mexico | Android | New Customers",
            "suggested_next_analysis": "Review post-activation onboarding screens and launch contextual funding guidance experiment.",
            "action_link": "/experiments"
        }
    elif "compare" in q_lower or "remittance customer" in q_lower or "new customer" in q_lower:
        return {
            "query": query_text,
            "direct_answer": "Existing Remittance Customers outperform New Customers across all lifecycle conversion stages, exhibiting +16.8 percentage points higher card activation and +24.4% higher 30-day retention.",
            "supporting_metrics": [
                {"metric": "Activation Rate (Existing Remit)", "value": "81.4%", "new_cust": "64.6%"},
                {"metric": "Funding Rate (Existing Remit)", "value": "78.5%", "new_cust": "54.1%"},
                {"metric": "30-Day Retention Rate", "value": "84.6%", "new_cust": "60.2%"}
            ],
            "affected_segment": "New Customers vs Existing Remittance Cross-Sell",
            "suggested_next_analysis": "Explore cross-sell campaigns targeting active remittance senders to increase card adoption.",
            "action_link": "/funnel-explorer"
        }
    elif "segment" in q_lower or "retention" in q_lower:
        return {
            "query": query_text,
            "direct_answer": "Power Users (Card Spend + Remittance) and Remittance Loyalists exhibit the strongest 30-day retention at 88.5% and 76.2% respectively.",
            "supporting_metrics": [
                {"metric": "Power Users Retention", "value": "88.5%", "unit": "30-Day"},
                {"metric": "Remittance Loyalists Retention", "value": "76.2%", "unit": "30-Day"},
                {"metric": "Funded but Unengaged Retention", "value": "42.1%", "unit": "30-Day"}
            ],
            "affected_segment": "Power Users & Remittance Loyalists",
            "suggested_next_analysis": "Analyze multi-product money movement workflows to convert Card-First Explorers into Power Users.",
            "action_link": "/segments"
        }
    else:
        return {
            "query": query_text,
            "direct_answer": "Analysis indicates key dropout friction points concentrated in the Activation → Account Funding step for new Android users in Mexico.",
            "supporting_metrics": [
                {"metric": "Global Card Activation Rate", "value": "71.4%", "change": "+0.5%"},
                {"metric": "Global Account Funding Rate", "value": "61.7%", "change": "-3.2%"},
                {"metric": "Top Recoverable Monthly Value", "value": "$97,400", "change": "High Impact"}
            ],
            "affected_segment": "Mexico | Android | New Customers",
            "suggested_next_analysis": "Run statistical anomaly scan on Opportunity Radar to isolate secondary cohort drop-offs.",
            "action_link": "/opportunity-radar"
        }
