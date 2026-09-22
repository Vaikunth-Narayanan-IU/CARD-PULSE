from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import os
import sys

sys.path.append(os.path.dirname(__file__))
from database import init_db
from seed_data import generate_synthetic_data
from analytics import (
    get_global_kpis,
    get_funnel_metrics,
    get_funnel_comparison,
    get_cohort_customers,
    get_segment_analytics,
    get_money_movement,
    get_opportunity_radar,
    get_experiment_data,
    ask_card_pulse_query
)

app = FastAPI(
    title="CARD PULSE API",
    description="Global Card Product Intelligence Engine Backend",
    version="1.0.0"
)

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    # Ensure DB is seeded if writable or available
    try:
        init_db()
        generate_synthetic_data(25000)
    except Exception as e:
        print(f"Serverless startup check: {e}")

@app.get("/api/health")
def health_check():
    return {"status": "ok", "app": "CARD PULSE Engine", "version": "1.0.0"}

def extract_filters(
    country: Optional[str] = None,
    acquisition_channel: Optional[str] = None,
    customer_type: Optional[str] = None,
    device: Optional[str] = None,
    date_range: Optional[str] = "180D"
) -> Dict[str, Any]:
    filters = {}
    if country and country != "All Countries": filters["country"] = country
    if acquisition_channel and acquisition_channel != "All Channels": filters["acquisition_channel"] = acquisition_channel
    if customer_type and customer_type != "All Types": filters["customer_type"] = customer_type
    if device and device != "All Devices": filters["device"] = device
    if date_range: filters["date_range"] = date_range
    return filters

@app.get("/api/kpis")
def get_kpis(
    country: Optional[str] = None,
    acquisition_channel: Optional[str] = None,
    customer_type: Optional[str] = None,
    device: Optional[str] = None,
    date_range: Optional[str] = "180D"
):
    filters = extract_filters(country, acquisition_channel, customer_type, device, date_range)
    return get_global_kpis(filters)

@app.get("/api/funnel")
def get_funnel(
    country: Optional[str] = None,
    acquisition_channel: Optional[str] = None,
    customer_type: Optional[str] = None,
    device: Optional[str] = None,
    date_range: Optional[str] = "180D"
):
    filters = extract_filters(country, acquisition_channel, customer_type, device, date_range)
    return get_funnel_metrics(filters)

@app.get("/api/funnel/compare")
def compare_funnels(
    segA_country: Optional[str] = None,
    segA_channel: Optional[str] = None,
    segA_type: Optional[str] = "Existing Remittance Customer",
    segA_device: Optional[str] = None,
    segB_country: Optional[str] = None,
    segB_channel: Optional[str] = None,
    segB_type: Optional[str] = "New Customer",
    segB_device: Optional[str] = None,
    date_range: Optional[str] = "180D"
):
    filters_a = extract_filters(segA_country, segA_channel, segA_type, segA_device, date_range)
    filters_b = extract_filters(segB_country, segB_channel, segB_type, segB_device, date_range)
    return get_funnel_comparison(filters_a, filters_b)

@app.get("/api/funnel/cohort")
def get_cohort(
    stage: str,
    country: Optional[str] = None,
    acquisition_channel: Optional[str] = None,
    customer_type: Optional[str] = None,
    device: Optional[str] = None,
    date_range: Optional[str] = "180D",
    limit: int = 50,
    offset: int = 0
):
    filters = extract_filters(country, acquisition_channel, customer_type, device, date_range)
    return get_cohort_customers(filters, stage, limit, offset)

@app.get("/api/segments")
def get_segments(
    country: Optional[str] = None,
    acquisition_channel: Optional[str] = None,
    customer_type: Optional[str] = None,
    device: Optional[str] = None,
    date_range: Optional[str] = "180D"
):
    filters = extract_filters(country, acquisition_channel, customer_type, device, date_range)
    return get_segment_analytics(filters)

@app.get("/api/money-movement")
def get_money_movement_data(
    country: Optional[str] = None,
    acquisition_channel: Optional[str] = None,
    customer_type: Optional[str] = None,
    device: Optional[str] = None,
    date_range: Optional[str] = "180D"
):
    filters = extract_filters(country, acquisition_channel, customer_type, device, date_range)
    return get_money_movement(filters)

@app.get("/api/opportunity-radar")
def get_opportunities(
    country: Optional[str] = None,
    acquisition_channel: Optional[str] = None,
    customer_type: Optional[str] = None,
    device: Optional[str] = None,
    date_range: Optional[str] = "180D"
):
    filters = extract_filters(country, acquisition_channel, customer_type, device, date_range)
    return get_opportunity_radar(filters)

@app.get("/api/experiments")
def get_experiment(experiment_id: str = "exp_post_activation_funding"):
    return get_experiment_data(experiment_id)

class QueryPayload(BaseModel):
    query: str

@app.post("/api/ask-card-pulse")
def ask_question(payload: QueryPayload):
    return ask_card_pulse_query(payload.query)

@app.get("/api/data-model-health")
def get_data_model_health():
    return {
        "pipeline_health": {
            "freshness": "12 minutes ago",
            "completeness": 99.8,
            "duplicate_event_rate": 0.02,
            "unmapped_events": 0,
            "last_pipeline_refresh": "2026-09-22 19:15:00 UTC",
            "status": "Healthy"
        },
        "metric_dictionary": [
            {
                "metric_name": "KYC Completion Rate",
                "formula": "COUNT(KYC Passed) / COUNT(Onboarding Started)",
                "description": "Percentage of onboarded customers who successfully pass identity verification."
            },
            {
                "metric_name": "Card Activation Rate",
                "formula": "COUNT(Card Activated) / COUNT(KYC Passed)",
                "description": "Percentage of KYC verified customers who activate physical or virtual card."
            },
            {
                "metric_name": "Account Funding Rate",
                "formula": "COUNT(Account Funded) / COUNT(Card Activated)",
                "description": "Percentage of activated card users who complete initial account funding deposit."
            },
            {
                "metric_name": "First Spend Conversion",
                "formula": "COUNT(First Card Spend) / COUNT(Account Funded)",
                "description": "Percentage of funded customers executing first merchant transaction."
            },
            {
                "metric_name": "30-Day Retention Rate",
                "formula": "COUNT(Active on Day 30) / COUNT(Card Activated)",
                "description": "Customers maintaining qualifying card or remittance activity 30 days post-activation."
            }
        ]
    }
