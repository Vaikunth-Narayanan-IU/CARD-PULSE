export interface FilterState {
  country: string;
  acquisitionChannel: string;
  customerType: string;
  device: string;
  dateRange: string;
}

export interface KpiMetrics {
  new_customers: number;
  new_customers_pop: string;
  kyc_completion_rate: number;
  kyc_pop: string;
  card_activation_rate: number;
  activation_pop: string;
  funding_rate: number;
  funding_pop: string;
  first_spend_rate: number;
  first_spend_pop: string;
  retention_30d: number;
  retention_pop: string;
  avg_monthly_card_spend: number;
  avg_spend_pop: string;
  contribution_per_active: number;
  contribution_pop: string;
}

export interface FunnelStage {
  stage: string;
  count: number;
  stage_conversion: number;
  dropoff_count: number;
  overall_conversion: number;
  pop_change: string;
  estimated_opportunity: number;
}

export interface CohortCustomer {
  customer_id: string;
  country: string;
  signup_date: string;
  acquisition_channel: string;
  customer_type: string;
  device: string;
  risk_tier: string;
  behavioral_segment: string;
}

export interface OpportunityCard {
  id: string;
  is_seeded?: boolean;
  title: string;
  stage: string;
  cohort: {
    country: string;
    device: string;
    customer_type: string;
    acquisition_channel: string;
  };
  observed_conversion: number;
  baseline_conversion: number;
  conversion_gap: number;
  customers_affected: number;
  estimated_monthly_opportunity: number;
  supporting_evidence: string[];
  potential_hypotheses: string[];
  recommended_next_analyses: string[];
}

export interface CustomerSegment {
  segment_name: string;
  customer_count: number;
  percentage_of_base: number;
  avg_account_balance: number;
  avg_monthly_card_spend: number;
  monthly_remittance_volume: number;
  transactions_per_month: number;
  retention_30d: number;
  estimated_contribution_margin: number;
}

export interface ScatterPoint {
  segment: string;
  x_remittance_vol: number;
  y_card_spend: number;
  z_customer_count: number;
}

export interface MoneyMovementGroup {
  group_name: string;
  customer_count: number;
  retention_30d: number;
  retention_90d: number;
  avg_monthly_value: number;
  avg_card_spend: number;
  remittance_frequency_per_month: number;
}

export interface CrossProductOpportunity {
  title: string;
  impact: string;
  description: string;
}

export interface ExperimentVariant {
  variant: string;
  sample_size: number;
  conversion_rate: number;
  absolute_uplift: number;
  relative_uplift: number;
  confidence_interval: string;
  p_value: number;
  is_stat_sig: boolean;
  estimated_incremental_funded: number;
  estimated_monthly_impact: number;
}

export interface ExperimentData {
  experiment_id: string;
  title: string;
  hypothesis: string;
  target_population: string;
  control_description: string;
  variant_a_description: string;
  variant_b_description: string;
  primary_metric: string;
  secondary_metrics: string[];
  guardrails: string[];
  variants: ExperimentVariant[];
  conclusion: string;
}

export interface AskAnswer {
  query: string;
  direct_answer: string;
  supporting_metrics: Array<{
    metric: string;
    value: string;
    change?: string;
    baseline?: string;
    new_cust?: string;
    unit?: string;
  }>;
  affected_segment: string;
  suggested_next_analysis: string;
  action_link: string;
}

export interface MetricDictionaryItem {
  metric_name: string;
  formula: string;
  description: string;
}

export interface DataModelHealth {
  pipeline_health: {
    freshness: string;
    completeness: number;
    duplicate_event_rate: number;
    unmapped_events: number;
    last_pipeline_refresh: string;
    status: string;
  };
  metric_dictionary: MetricDictionaryItem[];
}
