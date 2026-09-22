import React, { useEffect, useState } from 'react';
import { useFilters } from '../context/FilterContext';
import { fetchKpis, fetchFunnel, fetchOpportunities } from '../api/client';
import type { KpiMetrics, FunnelStage, OpportunityCard as OppType } from '../types';
import { KpiCard } from '../components/KpiCard';
import { 
  Users, 
  UserCheck, 
  CreditCard, 
  Wallet, 
  ShoppingBag, 
  Clock, 
  DollarSign, 
  TrendingUp,
  AlertTriangle,
  ChevronRight
} from 'lucide-react';

interface OverviewPageProps {
  setActiveTab: (tab: string) => void;
  onOpenCohort: (stage: string) => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({ setActiveTab, onOpenCohort }) => {
  const { filters } = useFilters();
  const [kpis, setKpis] = useState<KpiMetrics | null>(null);
  const [funnel, setFunnel] = useState<FunnelStage[]>([]);
  const [opportunities, setOpportunities] = useState<OppType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [kpiRes, funnelRes, oppRes] = await Promise.all([
          fetchKpis(filters),
          fetchFunnel(filters),
          fetchOpportunities(filters)
        ]);
        setKpis(kpiRes);
        setFunnel(funnelRes);
        setOpportunities(oppRes);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [filters]);

  if (loading || !kpis) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] gap-3 text-slate-400">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-medium">Loading Product Command Center...</span>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Title Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Product Command Center</h2>
          <p className="text-xs text-slate-500 mt-1">
            Executive performance overview for Global Card & Remittance product lifecycle
          </p>
        </div>
        <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-semibold">
          <TrendingUp className="w-4 h-4" />
          <span>Real-time Analytics Engine Active</span>
        </div>
      </div>

      {/* Top KPI Cards Grid (8 Metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="New Customers"
          value={kpis.new_customers.toLocaleString()}
          pop={kpis.new_customers_pop}
          explanation="Total customer accounts registered during selected date range."
          icon={<Users className="w-4 h-4" />}
        />
        <KpiCard
          label="KYC Completion Rate"
          value={`${kpis.kyc_completion_rate}%`}
          pop={kpis.kyc_pop}
          explanation="Customers completing identity verification over total onboarding starts."
          icon={<UserCheck className="w-4 h-4" />}
        />
        <KpiCard
          label="Card Activation Rate"
          value={`${kpis.card_activation_rate}%`}
          pop={kpis.activation_pop}
          explanation="KYC-passed customers who activate a physical or virtual debit card."
          icon={<CreditCard className="w-4 h-4" />}
        />
        <KpiCard
          label="Funding Rate"
          value={`${kpis.funding_rate}%`}
          pop={kpis.funding_pop}
          explanation="Activated card users who successfully complete initial account deposit."
          icon={<Wallet className="w-4 h-4" />}
        />
        <KpiCard
          label="First Spend Rate"
          value={`${kpis.first_spend_rate}%`}
          pop={kpis.first_spend_pop}
          explanation="Funded account customers completing their first card purchase transaction."
          icon={<ShoppingBag className="w-4 h-4" />}
        />
        <KpiCard
          label="30-Day Retention"
          value={`${kpis.retention_30d}%`}
          pop={kpis.retention_pop}
          explanation="Percentage of activated customers active 30 days post-onboarding."
          icon={<Clock className="w-4 h-4" />}
        />
        <KpiCard
          label="Avg Monthly Spend"
          value={`$${kpis.avg_monthly_card_spend}`}
          pop={kpis.avg_spend_pop}
          explanation="Average monthly merchant spend per active debit card user."
          icon={<DollarSign className="w-4 h-4" />}
        />
        <KpiCard
          label="Contribution / Active"
          value={`$${kpis.contribution_per_active}`}
          pop={kpis.contribution_pop}
          explanation="Estimated monthly net economic contribution per active user (interchange + FX - servicing)."
          icon={<DollarSign className="w-4 h-4" />}
        />
      </div>

      {/* Global Lifecycle Funnel Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Global Customer Lifecycle Funnel</h3>
            <p className="text-xs text-slate-500">Stage conversion, drop-offs, and estimated economic recovery potential</p>
          </div>
          <button
            onClick={() => setActiveTab('funnel-explorer')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 transition-colors"
          >
            Explore Funnel Segment Comparisons <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Visual Funnel Bar Sequence */}
        <div className="space-y-3">
          {funnel.map((item, idx) => {
            const isSeededDrop = item.stage === 'Account Funded';
            return (
              <div 
                key={item.stage} 
                onClick={() => onOpenCohort(item.stage)}
                className="group relative bg-slate-50 hover:bg-blue-50/50 rounded-xl p-3.5 border border-slate-200/80 transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="w-48 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {item.stage}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 ml-7">
                    {item.count.toLocaleString()} customers
                  </div>
                </div>

                {/* Bar Progress */}
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-medium text-slate-600">
                    <span>Stage Conv: <strong className="text-slate-900 font-bold">{item.stage_conversion}%</strong></span>
                    <span>Overall: <strong>{item.overall_conversion}%</strong></span>
                  </div>
                  <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        isSeededDrop ? 'bg-amber-500' : 'bg-blue-600'
                      }`}
                      style={{ width: `${Math.max(item.stage_conversion, 4)}%` }}
                    />
                  </div>
                </div>

                {/* Drop-off & Economic Opportunity */}
                <div className="w-56 shrink-0 text-right flex flex-col items-end justify-center">
                  {idx > 0 ? (
                    <>
                      <span className="text-xs font-semibold text-rose-600 flex items-center gap-1">
                        -{item.dropoff_count.toLocaleString()} drop-offs ({item.pop_change})
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Est. Opp: <strong className="text-emerald-600 font-bold">${item.estimated_opportunity.toLocaleString()}</strong>
                      </span>
                    </>
                  ) : (
                    <span className="text-xs text-slate-400 font-medium">Top of Funnel</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* "Where Should We Look?" Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-bold text-slate-900">Where Should We Look?</h3>
          </div>
          <span className="text-xs text-slate-500">Ranked by recoverable economic opportunity</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {opportunities.map((opp) => (
            <div
              key={opp.id}
              className={`rounded-2xl p-5 border shadow-xs hover:shadow-md transition-all flex flex-col justify-between ${
                opp.is_seeded
                  ? 'bg-gradient-to-br from-amber-50/80 via-white to-orange-50/40 border-amber-300'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-wider font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-200">
                    {opp.stage}
                  </span>
                  {opp.is_seeded && (
                    <span className="text-[10px] font-extrabold uppercase text-amber-700 bg-amber-200/60 px-1.5 py-0.5 rounded">
                      Seeded Priority Issue
                    </span>
                  )}
                </div>

                <h4 className="font-bold text-slate-900 text-sm">{opp.title}</h4>

                <div className="flex flex-wrap gap-1.5 text-[11px]">
                  <span className="bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded">
                    {opp.cohort.country}
                  </span>
                  <span className="bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded">
                    {opp.cohort.device}
                  </span>
                  <span className="bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded">
                    {opp.cohort.customer_type}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-500 text-[11px]">Observed Conv:</span>
                    <p className="font-bold text-slate-900">{opp.observed_conversion}%</p>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px]">Baseline:</span>
                    <p className="font-bold text-slate-600">{opp.baseline_conversion}%</p>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px]">Affected Users:</span>
                    <p className="font-bold text-slate-900">{opp.customers_affected.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px]">Est. Monthly Opp:</span>
                    <p className="font-bold text-emerald-600">${opp.estimated_monthly_opportunity.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setActiveTab('opportunity-radar')}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <span>Investigate Opportunity</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
