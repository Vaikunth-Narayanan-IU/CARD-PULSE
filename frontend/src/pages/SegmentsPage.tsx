import React, { useEffect, useState } from 'react';
import { useFilters } from '../context/FilterContext';
import { fetchSegments } from '../api/client';
import type { CustomerSegment, ScatterPoint } from '../types';
import { X } from 'lucide-react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, CartesianGrid } from 'recharts';

export const SegmentsPage: React.FC = () => {
  const { filters } = useFilters();
  const [segments, setSegments] = useState<CustomerSegment[]>([]);
  const [scatter, setScatter] = useState<ScatterPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeg, setSelectedSeg] = useState<CustomerSegment | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const res = await fetchSegments(filters);
        setSegments(res.segments || []);
        setScatter(res.scatter_data || []);
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
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Customer Segments</h2>
        <p className="text-xs text-slate-500 mt-1">
          Behavioral segment composition, cross-product spending patterns, and margin contribution
        </p>
      </div>

      {/* Behavioral Scatter/Bubble Chart */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Cross-Product Behavioral Landscape</h3>
            <p className="text-xs text-slate-500">X = Monthly Remittance Volume ($) | Y = Monthly Card Spend ($)</p>
          </div>
          <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
            Bubble size = Customer Count
          </span>
        </div>

        <div className="h-80 w-full pt-2">
          {loading ? (
            <div className="h-full flex items-center justify-center text-slate-400 text-xs">Loading chart...</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" dataKey="x_remittance_vol" name="Remittance Vol" unit="$" stroke="#64748b" fontSize={11} />
                <YAxis type="number" dataKey="y_card_spend" name="Card Spend" unit="$" stroke="#64748b" fontSize={11} />
                <ZAxis type="number" dataKey="z_customer_count" range={[100, 1000]} name="Customer Count" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                <Scatter name="Segments" data={scatter} fill="#2563eb" />
              </ScatterChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Segment Metrics Matrix Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">Behavioral Segment Performance Matrix</h3>
          <span className="text-xs text-slate-500">Click segment to open profile</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/70 uppercase text-[10px] font-bold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Segment Name</th>
                <th className="px-5 py-3">Customer Count</th>
                <th className="px-5 py-3">% of Base</th>
                <th className="px-5 py-3">Avg Balance</th>
                <th className="px-5 py-3">Avg Card Spend</th>
                <th className="px-5 py-3">Monthly Remittance</th>
                <th className="px-5 py-3">30-Day Retention</th>
                <th className="px-5 py-3 text-right">Contrib. Margin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {segments.map((seg) => (
                <tr
                  key={seg.segment_name}
                  onClick={() => setSelectedSeg(seg)}
                  className="hover:bg-blue-50/50 transition-colors cursor-pointer group"
                >
                  <td className="px-5 py-4 font-bold text-slate-900 group-hover:text-blue-600 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                    {seg.segment_name}
                  </td>
                  <td className="px-5 py-4 font-semibold">{seg.customer_count.toLocaleString()}</td>
                  <td className="px-5 py-4 font-semibold text-slate-600">{seg.percentage_of_base}%</td>
                  <td className="px-5 py-4 font-semibold">${seg.avg_account_balance.toLocaleString()}</td>
                  <td className="px-5 py-4 font-semibold text-blue-700">${seg.avg_monthly_card_spend.toLocaleString()}</td>
                  <td className="px-5 py-4 font-semibold text-emerald-700">${seg.monthly_remittance_volume.toLocaleString()}</td>
                  <td className="px-5 py-4 font-bold text-slate-900">{seg.retention_30d}%</td>
                  <td className="px-5 py-4 text-right font-extrabold text-emerald-600">
                    ${seg.estimated_contribution_margin.toFixed(2)}/mo
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Segment Profile Drawer / Modal */}
      {selectedSeg && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{selectedSeg.segment_name} Profile</h3>
                <p className="text-xs text-slate-500">{selectedSeg.customer_count.toLocaleString()} customers ({selectedSeg.percentage_of_base}% of total base)</p>
              </div>
              <button
                onClick={() => setSelectedSeg(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl">
                <span className="text-slate-500 text-[11px]">Avg Account Balance:</span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">${selectedSeg.avg_account_balance}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl">
                <span className="text-slate-500 text-[11px]">Avg Card Spend:</span>
                <p className="font-bold text-blue-700 text-sm mt-0.5">${selectedSeg.avg_monthly_card_spend}/mo</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl">
                <span className="text-slate-500 text-[11px]">Monthly Remittance:</span>
                <p className="font-bold text-emerald-700 text-sm mt-0.5">${selectedSeg.monthly_remittance_volume}/mo</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl">
                <span className="text-slate-500 text-[11px]">30-Day Retention:</span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{selectedSeg.retention_30d}%</p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-slate-900">Key Behaviors & Opportunities</h4>
              <ul className="space-y-1.5 text-slate-600 list-disc list-inside">
                <li>Demonstrates consistent engagement with primary product workflows.</li>
                <li>Estimated net contribution margin: <strong className="text-emerald-600">${selectedSeg.estimated_contribution_margin.toFixed(2)}/mo per user</strong>.</li>
                <li>Ideal cohort for targeted cross-sell and cashback engagement campaigns.</li>
              </ul>
            </div>

            <button
              onClick={() => setSelectedSeg(null)}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs py-2.5 rounded-xl transition-colors"
            >
              Close Profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
