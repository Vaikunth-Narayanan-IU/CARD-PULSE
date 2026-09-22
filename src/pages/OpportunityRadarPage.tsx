import React, { useEffect, useState } from 'react';
import { useFilters } from '../context/FilterContext';
import { fetchOpportunities } from '../api/client';
import type { OpportunityCard } from '../types';
import { UserCheck, FlaskConical, ShieldCheck } from 'lucide-react';

interface OpportunityRadarPageProps {
  setActiveTab: (tab: string) => void;
  onOpenCohort: (stage: string) => void;
}

export const OpportunityRadarPage: React.FC<OpportunityRadarPageProps> = ({ setActiveTab, onOpenCohort }) => {
  const { filters } = useFilters();
  const [opportunities, setOpportunities] = useState<OpportunityCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTabSub, setActiveTabSub] = useState<'evidence' | 'hypotheses' | 'recommended'>('evidence');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const res = await fetchOpportunities(filters);
        setOpportunities(res);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [filters]);

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Opportunity Radar</h2>
            <span className="text-xs font-bold uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
              Statistical Scanner Active
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Automated anomaly detection scanning combinations of Country x Device x Customer Type x Channel
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-200 text-amber-900 px-3 py-2 rounded-xl text-xs flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Analytic Rigor: All findings represent observed associations requiring validation</span>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span>Scanning lifecycle combinations for statistical conversion drop-offs...</span>
        </div>
      ) : (
        <div className="space-y-6">
          {opportunities.map((opp, idx) => (
            <div
              key={opp.id}
              className={`rounded-2xl p-6 border shadow-xs transition-all space-y-5 ${
                opp.is_seeded
                  ? 'bg-gradient-to-br from-amber-50/90 via-white to-orange-50/40 border-amber-300 ring-1 ring-amber-400/30'
                  : 'bg-white border-slate-200'
              }`}
            >
              {/* Header */}
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      Rank #{idx + 1} Opportunity
                    </span>
                    <span className="text-[11px] font-bold uppercase text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                      {opp.stage}
                    </span>
                    {opp.is_seeded && (
                      <span className="text-[11px] font-extrabold uppercase text-amber-800 bg-amber-200 px-2 py-0.5 rounded animate-pulse">
                        Seeded Priority Anomaly
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">{opp.title}</h3>
                </div>

                <div className="text-right bg-emerald-50 border border-emerald-200 p-3 rounded-xl">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Est. Monthly Opportunity</span>
                  <p className="text-xl font-extrabold text-emerald-600">${opp.estimated_monthly_opportunity.toLocaleString()}</p>
                </div>
              </div>

              {/* Cohort Chips */}
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="bg-slate-900 text-white font-semibold px-2.5 py-1 rounded-lg">
                  Country: {opp.cohort.country}
                </span>
                <span className="bg-slate-800 text-white font-semibold px-2.5 py-1 rounded-lg">
                  Device: {opp.cohort.device}
                </span>
                <span className="bg-slate-800 text-white font-semibold px-2.5 py-1 rounded-lg">
                  Type: {opp.cohort.customer_type}
                </span>
                <span className="bg-slate-800 text-white font-semibold px-2.5 py-1 rounded-lg">
                  Channel: {opp.cohort.acquisition_channel}
                </span>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 text-xs">
                <div>
                  <span className="text-slate-500 text-[11px]">Observed Conversion:</span>
                  <p className="text-lg font-bold text-rose-600">{opp.observed_conversion}%</p>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px]">Baseline Benchmark:</span>
                  <p className="text-lg font-bold text-slate-700">{opp.baseline_conversion}%</p>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px]">Conversion Gap:</span>
                  <p className="text-lg font-bold text-amber-600">-{opp.conversion_gap} percentage pts</p>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px]">Customers Affected:</span>
                  <p className="text-lg font-bold text-slate-900">{opp.customers_affected.toLocaleString()}</p>
                </div>
              </div>

              {/* Detail Tabs */}
              <div className="space-y-3">
                <div className="flex items-center gap-4 border-b border-slate-200 text-xs font-semibold">
                  <button
                    onClick={() => setActiveTabSub('evidence')}
                    className={`pb-2 transition-colors border-b-2 ${
                      activeTabSub === 'evidence'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Supporting Evidence ({opp.supporting_evidence.length})
                  </button>
                  <button
                    onClick={() => setActiveTabSub('hypotheses')}
                    className={`pb-2 transition-colors border-b-2 ${
                      activeTabSub === 'hypotheses'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Potential Hypotheses ({opp.potential_hypotheses.length})
                  </button>
                  <button
                    onClick={() => setActiveTabSub('recommended')}
                    className={`pb-2 transition-colors border-b-2 ${
                      activeTabSub === 'recommended'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Recommended Next Analyses ({opp.recommended_next_analyses.length})
                  </button>
                </div>

                <div className="text-xs text-slate-700 space-y-1.5 pl-2">
                  {activeTabSub === 'evidence' &&
                    opp.supporting_evidence.map((item, i) => (
                      <p key={i} className="flex items-start gap-2">
                        <span className="text-blue-500 font-bold">•</span>
                        <span>{item}</span>
                      </p>
                    ))}
                  {activeTabSub === 'hypotheses' &&
                    opp.potential_hypotheses.map((item, i) => (
                      <p key={i} className="flex items-start gap-2">
                        <span className="text-amber-500 font-bold">•</span>
                        <span>{item} <em className="text-slate-400">(Hypothesis requiring validation)</em></span>
                      </p>
                    ))}
                  {activeTabSub === 'recommended' &&
                    opp.recommended_next_analyses.map((item, i) => (
                      <p key={i} className="flex items-start gap-2">
                        <span className="text-emerald-500 font-bold">•</span>
                        <span>{item}</span>
                      </p>
                    ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100">
                <button
                  onClick={() => onOpenCohort('Account Funded')}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <UserCheck className="w-3.5 h-3.5" /> Explore Cohort
                </button>
                <button
                  onClick={() => setActiveTab('funnel-explorer')}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  View Supporting Data
                </button>
                <button
                  onClick={() => setActiveTab('experiments')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs ml-auto"
                >
                  <FlaskConical className="w-3.5 h-3.5" /> Create A/B Experiment
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
