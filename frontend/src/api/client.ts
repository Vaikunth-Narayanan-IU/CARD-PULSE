import type { FilterState } from '../types';

const API_BASE = 'http://localhost:8000/api';

function buildQueryString(filters: FilterState): string {
  const params = new URLSearchParams();
  if (filters.country && filters.country !== 'All Countries') params.append('country', filters.country);
  if (filters.acquisitionChannel && filters.acquisitionChannel !== 'All Channels') params.append('acquisition_channel', filters.acquisitionChannel);
  if (filters.customerType && filters.customerType !== 'All Types') params.append('customer_type', filters.customerType);
  if (filters.device && filters.device !== 'All Devices') params.append('device', filters.device);
  if (filters.dateRange) params.append('date_range', filters.dateRange);
  return params.toString() ? `?${params.toString()}` : '';
}

export async function fetchKpis(filters: FilterState) {
  const res = await fetch(`${API_BASE}/kpis${buildQueryString(filters)}`);
  if (!res.ok) throw new Error('Failed to fetch KPIs');
  return res.json();
}

export async function fetchFunnel(filters: FilterState) {
  const res = await fetch(`${API_BASE}/funnel${buildQueryString(filters)}`);
  if (!res.ok) throw new Error('Failed to fetch funnel');
  return res.json();
}

export async function fetchFunnelCompare(segAFilters: Partial<FilterState>, segBFilters: Partial<FilterState>, dateRange: string) {
  const params = new URLSearchParams();
  if (segAFilters.country) params.append('segA_country', segAFilters.country);
  if (segAFilters.acquisitionChannel) params.append('segA_channel', segAFilters.acquisitionChannel);
  if (segAFilters.customerType) params.append('segA_type', segAFilters.customerType);
  if (segAFilters.device) params.append('segA_device', segAFilters.device);

  if (segBFilters.country) params.append('segB_country', segBFilters.country);
  if (segBFilters.acquisitionChannel) params.append('segB_channel', segBFilters.acquisitionChannel);
  if (segBFilters.customerType) params.append('segB_type', segBFilters.customerType);
  if (segBFilters.device) params.append('segB_device', segBFilters.device);

  params.append('date_range', dateRange);

  const res = await fetch(`${API_BASE}/funnel/compare?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to compare funnels');
  return res.json();
}

export async function fetchCohortCustomers(stage: string, filters: FilterState, limit = 50, offset = 0) {
  const qs = buildQueryString(filters);
  const prefix = qs ? `${qs}&` : '?';
  const res = await fetch(`${API_BASE}/funnel/cohort${prefix}stage=${encodeURIComponent(stage)}&limit=${limit}&offset=${offset}`);
  if (!res.ok) throw new Error('Failed to fetch cohort customers');
  return res.json();
}

export async function fetchSegments(filters: FilterState) {
  const res = await fetch(`${API_BASE}/segments${buildQueryString(filters)}`);
  if (!res.ok) throw new Error('Failed to fetch segments');
  return res.json();
}

export async function fetchMoneyMovement(filters: FilterState) {
  const res = await fetch(`${API_BASE}/money-movement${buildQueryString(filters)}`);
  if (!res.ok) throw new Error('Failed to fetch money movement data');
  return res.json();
}

export async function fetchOpportunities(filters: FilterState) {
  const res = await fetch(`${API_BASE}/opportunity-radar${buildQueryString(filters)}`);
  if (!res.ok) throw new Error('Failed to fetch opportunities');
  return res.json();
}

export async function fetchExperiment(id = 'exp_post_activation_funding') {
  const res = await fetch(`${API_BASE}/experiments?experiment_id=${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error('Failed to fetch experiment data');
  return res.json();
}

export async function askCardPulse(query: string) {
  const res = await fetch(`${API_BASE}/ask-card-pulse`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });
  if (!res.ok) throw new Error('Failed to query Ask Card Pulse');
  return res.json();
}

export async function fetchDataModelHealth() {
  const res = await fetch(`${API_BASE}/data-model-health`);
  if (!res.ok) throw new Error('Failed to fetch data model health');
  return res.json();
}
