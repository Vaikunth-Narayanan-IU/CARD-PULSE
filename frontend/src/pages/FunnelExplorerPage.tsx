import React, { useEffect, useState } from 'react';
import { useFilters } from '../context/FilterContext';
import { fetchFunnelCompare } from '../api/client';
import { ArrowRightLeft, ChevronRight } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

interface FunnelExplorerPageProps {
  onOpenCohort: (stage: string) => void;
}

export const FunnelExplorerPage: React.FC<FunnelExplorerPageProps> = ({ onOpenCohort }) => {
  const { filters } = useFilters();
  const [comparison, setComparison] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Segment B filters for comparison
  const [segBType, setSegBType] = useState('New Customer');
  const [segAType, setSegAType] = useState('Existing Remittance Customer');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const compareRes = await fetchFunnelCompare(
          { ...filters, customerType: segAType },
          { ...filters, customerType: segBType },
          filters.dateRange
        );
        setComparison(compareRes);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [filters, segAType, segBType]);

  // Synthetic trend data for Recharts
  const trendData = [
    { month: 'Apr 2026', KYC_Rate: 76.2, Activation_Rate: 71.0, Funding_Rate: 64.5 },
    { month: 'May 2026', KYC_Rate: 77.1, Activation_Rate: 71.8, Funding_Rate: 63.8 },
    { month: 'Jun 2026', KYC_Rate: 76.8, Activation_Rate: 72.4, Funding_Rate: 60.1 },
    { month: 'Jul 2026', KYC_Rate: 77.9, Activation_Rate: 72.1, Funding_Rate: 58.4 },
    { month: 'Aug 2026', KYC_Rate: 78.4, Activation_Rate: 73.0, Funding_Rate: 59.2 },
    { month: 'Sep 2026', KYC_Rate: 77.3, Activation_Rate: 72.5, Funding_Rate: 61.7 },
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Funnel Explorer</h2>
        <p className="text-xs text-slate-500 mt-1">
          Deep-dive lifecycle conversion workspace with side-by-side segment benchmarking
        </p>
      </div>

      {/* Segment Side-by-Side Selector Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
            <ArrowRightLeft className="w-4 h-4 text-blue-600" />
            <span>Side-by-Side Cohort Comparison</span>
          </div>
          <span className="text-xs text-slate-500">Benchmark stage-by-stage conversion delta</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50/60 rounded-xl p-3 border border-blue-200/80 space-y-1">
            <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider">Cohort A (Baseline)</span>
            <select
              value={segAType}
              onChange={(e) => setSegAType(e.target.value)}
              className="w-full bg-white border border-blue-300 text-slate-900 text-xs rounded-lg px-2.5 py-1.5 font-semibold focus:outline-none"
            >
              <option value="Existing Remittance Customer">Existing Remittance Customer</option>
              <option value="New Customer">New Customer</option>
              <option value="High-Frequency Sender">High-Frequency Sender</option>
              <option value="High-Value Sender">High-Value Sender</option>
            </select>
          </div>

          <div className="bg-emerald-50/60 rounded-xl p-3 border border-emerald-200/80 space-y-1">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Cohort B (Target)</span>
            <select
              value={segBType}
              onChange={(e) => setSegBType(e.target.value)}
              className="w-full bg-white border border-emerald-300 text-slate-900 text-xs rounded-lg px-2.5 py-1.5 font-semibold focus:outline-none"
            >
              <option value="New Customer">New Customer</option>
              <option value="Existing Remittance Customer">Existing Remittance Customer</option>
              <option value="High-Frequency Sender">High-Frequency Sender</option>
              <option value="High-Value Sender">High-Value Sender</option>
            </select>
          </div>
        </div>
      </div>

      {/* Side-by-Side Conversion Delta Matrix */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 text-xs">Loading comparison matrix...</div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Stage-by-Stage Cohort Comparison Table</h3>
            <span className="text-xs text-slate-500">Click any row to view customer details</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 uppercase text-[10px] font-bold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3">Lifecycle Stage</th>
                  <th className="px-5 py-3 text-blue-700">{segAType} (Conv %)</th>
                  <th className="px-5 py-3 text-emerald-700">{segBType} (Conv %)</th>
                  <th className="px-5 py-3">Conversion Gap</th>
                  <th className="px-5 py-3 text-right">Est. Opportunity</th>
                  <th className="px-5 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {comparison.map((item) => {
                  const gap = item.conversion_diff;
                  return (
                    <tr
                      key={item.stage}
                      onClick={() => onOpenCohort(item.stage)}
                      className="hover:bg-slate-50 transition-colors cursor-pointer group"
                    >
                      <td className="px-5 py-3.5 font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {item.stage}
                      </td>
                      <td className="px-5 py-3.5 text-blue-700 font-semibold">
                        {item.segment_a.stage_conversion}% ({item.segment_a.count.toLocaleString()})
                      </td>
                      <td className="px-5 py-3.5 text-emerald-700 font-semibold">
                        {item.segment_b.stage_conversion}% ({item.segment_b.count.toLocaleString()})
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                          gap > 0
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {gap > 0 ? `+${gap}%` : `${gap}%`}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right font-bold text-emerald-600">
                        ${item.segment_b.estimated_opportunity.toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span className="text-[11px] font-semibold text-blue-600 group-hover:underline flex items-center justify-center gap-1">
                          View Cohort <ChevronRight className="w-3 h-3" />
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Conversion Over Time Trend Chart */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Funnel Stage Conversion Trends Over Time</h3>
            <p className="text-xs text-slate-500">6-Month historical conversion performance across key stages</p>
          </div>
          <div className="flex items-center gap-3 text-xs font-medium">
            <span className="flex items-center gap-1.5 text-blue-600"><span className="w-2.5 h-2.5 rounded-full bg-blue-600" /> KYC Rate</span>
            <span className="flex items-center gap-1.5 text-emerald-600"><span className="w-2.5 h-2.5 rounded-full bg-emerald-600" /> Activation Rate</span>
            <span className="flex items-center gap-1.5 text-amber-500"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Funding Rate</span>
          </div>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
              <YAxis domain={[40, 100]} stroke="#64748b" fontSize={11} unit="%" />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
              <Legend />
              <Line type="monotone" dataKey="KYC_Rate" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="Activation_Rate" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="Funding_Rate" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
