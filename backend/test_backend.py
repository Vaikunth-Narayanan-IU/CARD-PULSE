import sys
import os

sys.path.append(os.path.dirname(__file__))
from analytics import (
    get_global_kpis,
    get_funnel_metrics,
    get_opportunity_radar,
    get_experiment_data,
    ask_card_pulse_query
)

def run_tests():
    print("Testing Backend Analytics Engine...")
    
    # 1. Global KPIs
    kpis = get_global_kpis({"date_range": "ALL"})
    print("KPIs:", kpis)
    assert kpis["new_customers"] == 25000, "Should have 25k customers when date_range is ALL"
    
    # 2. Funnel Metrics
    funnel = get_funnel_metrics({})
    print("Funnel stages count:", len(funnel))
    assert len(funnel) == 8, "Should have 8 stages"
    
    # 3. Opportunity Radar
    opps = get_opportunity_radar({})
    print("Seeded Opp Title:", opps[0]["title"])
    assert opps[0]["cohort"]["country"] == "Mexico", "Top opp should be Mexico"
    assert opps[0]["cohort"]["device"] == "Android", "Top opp should be Android"
    print("Seeded Opp Conversion Gap:", opps[0]["conversion_gap"])
    print("Seeded Opp Monthly Opp $:", opps[0]["estimated_monthly_opportunity"])
    
    # 4. Experiment Data
    exp = get_experiment_data()
    print("Experiment Title:", exp["title"])
    print("Variant B Uplift:", exp["variants"][2]["relative_uplift"], "%")
    
    # 5. Ask Card Pulse Query
    ans = ask_card_pulse_query("Why did first-spend conversion decline last month?")
    print("NL Answer:", ans["direct_answer"])
    
    print("\nALL BACKEND ANALYTICS TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    run_tests()
