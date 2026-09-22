# CARD PULSE — Global Card Product Intelligence

> **Portfolio Concept & Synthetic Demonstration**: This application is an independent portfolio project inspired by global consumer fintech card and account product analyst responsibilities. It is **NOT** an official Remitly application and is **NOT** affiliated with or using internal Remitly data. All customer profiles, financial metrics, and performance streams are synthetically generated.

---

## 1. The Hypothetical Product Problem
Global consumer fintech platforms enabling users to send international remittances often expand into multi-product financial hubs by issuing debit cards and digital accounts. 

The core product question driving **CARD PULSE** is:
> *"Where are customers dropping out of the Global Card journey, why might it be happening, what is the economic opportunity, and what should the product team investigate or test next?"*

Rather than a static BI dashboard, **CARD PULSE** acts as an operational decision engine for cross-functional product squads (PMs, Analysts, General Managers, Marketers, and Engineering Leads) to detect conversion drop-offs, quantify economic impact, form validated hypotheses, launch A/B experiments, and measure roadmap uplift.

---

## 2. Target User Personas
- **Product Analysts & Data Engineers**: Analyze stage-by-stage drop-offs, inspect raw customer cohorts, and verify SQL metric formulas.
- **Product Managers & General Managers**: Size recoverable economic opportunities, track retention differences between remittance-only vs multi-product users, and prioritize roadmap items.
- **Growth & Marketing Partners**: Evaluate channel conversion efficiency (Paid Search vs Referral vs Remittance Cross-Sell).
- **Engineering Leads**: Diagnose device-specific performance issues (e.g., Android SPEI funding friction in recipient corridors).

---

## 3. Product Architecture

```
card-pulse/
├── backend/
│   ├── card_pulse.db       # SQLite Database (seeded with 25,000+ synthetic customers)
│   ├── database.py         # SQLite DDL schema creation & connection pool
│   ├── seed_data.py        # Synthetic data generator engine (25,000 customers, 100k+ events)
│   ├── analytics.py       # SQL query engine, Opportunity Radar scanner, NL router
│   ├── main.py            # FastAPI REST server & filter endpoints
│   ├── requirements.txt   # FastAPI, Uvicorn, Pydantic, Pandas, NumPy
│   └── test_backend.py    # Backend verification suite
├── frontend/
│   ├── src/
│   │   ├── api/client.ts              # API client querying FastAPI
│   │   ├── components/                # Shared UI (Sidebar, FilterBar, Tooltip, CohortModal)
│   │   ├── context/FilterContext.tsx  # Global multi-filter state provider
│   │   ├── pages/                     # 8 Dedicated View Pages
│   │   │   ├── OverviewPage.tsx        # Page 1: Product Command Center
│   │   │   ├── FunnelExplorerPage.tsx  # Page 2: Funnel Explorer & Side-by-Side Benchmark
│   │   │   ├── SegmentsPage.tsx        # Page 3: Behavioral Segments & Bubble Plot
│   │   │   ├── MoneyMovementPage.tsx   # Page 4: Card vs Remittance Dynamics
│   │   │   ├── OpportunityRadarPage.tsx# Page 5: Statistical Anomaly Radar Engine
│   │   │   ├── ExperimentLabPage.tsx   # Page 6: A/B Experiment & Stat-Sig Calculator
│   │   │   ├── AskCardPulsePage.tsx   # Page 7: AI Natural Language Interface
│   │   │   └── DataModelPage.tsx      # Page 8: ER Diagram & Metric Trust Dictionary
│   │   ├── types/index.ts             # TypeScript interface contracts
│   │   └── App.tsx                    # Main layout router
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

---

## 4. Database Schema
Normalized SQLite relational schema (`card_pulse.db`) indexed for real-time aggregation queries:

- `dim_customer`: `customer_id`, `country`, `signup_date`, `acquisition_channel`, `customer_type`, `device`, `risk_tier`, `behavioral_segment`
- `fact_customer_events`: `event_id`, `customer_id`, `event_type`, `event_timestamp`, `country`
- `fact_card_transactions`: `transaction_id`, `customer_id`, `transaction_date`, `merchant_category`, `amount`, `transaction_country`, `transaction_status`
- `fact_funding`: `funding_id`, `customer_id`, `funding_method`, `funding_amount`, `funding_timestamp`, `funding_status`
- `fact_remittance`: `remittance_id`, `customer_id`, `destination_country`, `send_amount`, `fee`, `send_timestamp`
- `fact_marketing_touch`: `touch_id`, `customer_id`, `campaign`, `channel`, `touch_timestamp`, `attributed_cost`
- `fact_experiment`: `customer_id`, `experiment_id`, `variant`, `exposure_timestamp`, `converted`

---

## 5. Synthetic Data Methodology & Seeded Anomaly
The data generator creates **25,000 synthetic customer accounts** with over **100,000 lifecycle events** spanning a realistic 6-month historical timeline.

### Intentionally Seeded Product Anomaly
- **Seeded Issue**: Newly acquired **Android customers in Mexico** experience a steep drop between **Card Activation** and **Account Funding** (observed **48.2%** funding rate vs **61.7%** global baseline).
- **Impact**: Affects ~2,340 customers monthly, representing **$97,400** in recoverable monthly economic value.
- **Discoverability**: Automatically flagged as the **Rank #1 Seeded Opportunity** in Opportunity Radar and discoverable in Funnel Explorer.

---

## 6. How Opportunity Radar Works
The Opportunity Radar engine continuously scans multi-dimensional combinations (`Country x Device x Customer Type x Channel x Funnel Stage`) against global baseline conversion rates. It calculates:
$$\text{Conversion Gap} = \text{Baseline Conversion \%} - \text{Observed Conversion \%}$$
$$\text{Estimated Monthly Opportunity} = \text{Affected Customers} \times \text{Stage Economic Value}$$

Opportunities are ranked by monetary potential and include supporting empirical evidence, potential hypotheses (clearly flagged as requiring validation), and recommended next steps.

---

## 7. How Ask Card Pulse Works
The **Ask Card Pulse** natural language query engine parses user prompts deterministically to execute direct SQL queries against SQLite, returning:
1. Direct concise answer statement
2. Key supporting database metrics
3. Affected customer segment
4. Suggested follow-up analysis
5. Deep-link button to the corresponding dashboard view

---

## 8. Experimentation Methodology
The **Experiment Lab** models a 3-arm A/B experiment (`Control`, `Variant A`, `Variant B`) targeting newly activated Android customers in Mexico who have not funded within 24 hours.

- **Primary Metric**: 7-Day Funding Conversion Rate
- **Guardrails**: Fraud Rate, Chargeback Rate, Support Contact Rate
- **Statistical Test**: 95% 2-tailed z-test with confidence interval and p-value calculation.
- **Outcome**: Variant B achieves a statistically significant **+9.9 percentage point** increase in 7-Day Funding Conversion ($p = 0.012$), projecting **$97,400** in monthly incremental revenue upon 100% rollout.

---

## 9. How to Run Locally

### Prerequisites
- Python 3.10+
- Node.js v18+ and npm

### Step 1: Start Backend (FastAPI + SQLite)
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python seed_data.py   # Automatically seeds 25,000 customers into SQLite card_pulse.db
uvicorn main:app --reload --port 8000
```
Backend server will run at `http://localhost:8000`.

### Step 2: Start Frontend (React + Vite + Tailwind)
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 10. Important Portfolio Disclaimer
"This is an independent portfolio project inspired by publicly available job responsibilities. It is not affiliated with Remitly and does not use Remitly internal data. All customer, financial, and performance data is synthetically generated."
