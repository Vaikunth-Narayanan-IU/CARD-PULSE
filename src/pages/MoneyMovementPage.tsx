import React, { useEffect, useState } from 'react';
import { useFilters } from '../context/FilterContext';
import { fetchMoneyMovement } from '../api/client';
import type { MoneyMovementGroup, CrossProductOpportunity } from '../types';
import { ArrowDown, ArrowRight, CreditCard, Send, ShieldCheck, Layers } from 'lucide-react';

export const MoneyMovementPage: React.FC = () => {
  const { filters } = useFilters();
  const [groups, setGroups] = useState<MoneyMovementGroup[]>([]);
  const [finding, setFinding] = useState('');
  const [opps, setOpps] = useState<CrossProductOpportunity[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetchMoneyMovement(filters);
        setGroups(res.groups || []);
        setFinding(res.key_finding || '');
        setOpps(res.cross_product_opportunities || []);
      } catch (e) {
        console.error(e);
      }
    }
    loadData();
  }, [filters]);

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Money Movement & Multi-Product Dynamics</h2>
        <p className="text-xs text-slate-500 mt-1">
          Analyzing the relationship between local card usage and international remittance transfer behavior
        </p>
      </div>

      {/* Visual Journey Graphic */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-lg space-y-6">
        <h3 className="font-bold text-sm text-slate-200 tracking-wider uppercase">Customer Money Flow Journey</h3>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center">
          {/* Node 1 */}
          <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl w-full md:w-44 shadow-md">
            <span className="text-[10px] uppercase font-bold text-blue-400">Step 1</span>
            <h4 className="font-bold text-sm text-white mt-1">Income / Funding</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Direct Deposit / SPEI / Debit</p>
          </div>

          <ArrowRight className="w-5 h-5 text-slate-500 hidden md:block shrink-0" />
          <ArrowDown className="w-5 h-5 text-slate-500 md:hidden shrink-0" />

          {/* Node 2 */}
          <div className="bg-blue-600/30 border border-blue-500/50 p-4 rounded-xl w-full md:w-48 shadow-md">
            <span className="text-[10px] uppercase font-bold text-emerald-400">Core Hub</span>
            <h4 className="font-bold text-base text-white mt-1">Global Account</h4>
            <p className="text-[11px] text-blue-200 mt-0.5">Multi-currency wallet</p>
          </div>

          <ArrowRight className="w-5 h-5 text-slate-500 hidden md:block shrink-0" />
          <ArrowDown className="w-5 h-5 text-slate-500 md:hidden shrink-0" />

          {/* Node 3 Split */}
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto flex-1">
            <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl flex-1 shadow-md text-left">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                <CreditCard className="w-4 h-4" /> Card Spend
              </div>
              <p className="text-[11px] text-slate-300 mt-1 font-semibold">Local Life</p>
              <p className="text-[10px] text-slate-400">Groceries, Dining, Utilities</p>
            </div>

            <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl flex-1 shadow-md text-left">
              <div className="flex items-center gap-2 text-blue-400 font-bold text-xs">
                <Send className="w-4 h-4" /> Send Money Home
              </div>
              <p className="text-[11px] text-slate-300 mt-1 font-semibold">Family Support</p>
              <p className="text-[10px] text-slate-400">Cross-border Remittances</p>
            </div>
          </div>
        </div>
      </div>

      {/* Non-Causal Finding Banner */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3 text-emerald-900">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-bold">{finding}</p>
          <p className="text-emerald-700 text-[11px]">
            *Observed association only. This synthetic analysis demonstrates correlation in retention performance without claiming direct causation.
          </p>
        </div>
      </div>

      {/* 3 Customer Groups Matrix Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">Product Adoption Group Comparison</h3>
          <span className="text-xs text-slate-500">Card Only vs Remittance Only vs Card + Remittance</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/70 uppercase text-[10px] font-bold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Customer Group</th>
                <th className="px-5 py-3">Customer Count</th>
                <th className="px-5 py-3">30-Day Retention</th>
                <th className="px-5 py-3">90-Day Retention</th>
                <th className="px-5 py-3">Avg Monthly Value</th>
                <th className="px-5 py-3">Avg Card Spend</th>
                <th className="px-5 py-3 text-right">Remittance Frequency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {groups.map((g) => {
                const isMulti = g.group_name === 'Card + Remittance';
                return (
                  <tr
                    key={g.group_name}
                    className={`hover:bg-slate-50 transition-colors ${isMulti ? 'bg-blue-50/30 font-semibold' : ''}`}
                  >
                    <td className="px-5 py-4 font-bold text-slate-900 flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${isMulti ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                      {g.group_name}
                      {isMulti && (
                        <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-200">
                          Highest Retention
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 font-semibold">{g.customer_count.toLocaleString()}</td>
                    <td className="px-5 py-4 font-bold text-slate-900">{g.retention_30d}%</td>
                    <td className="px-5 py-4 font-bold text-slate-700">{g.retention_90d}%</td>
                    <td className="px-5 py-4 font-semibold text-emerald-700">${g.avg_monthly_value.toLocaleString()}</td>
                    <td className="px-5 py-4 font-semibold text-blue-700">${g.avg_card_spend.toLocaleString()}</td>
                    <td className="px-5 py-4 text-right font-semibold text-slate-900">
                      {g.remittance_frequency_per_month} / mo
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cross-Product Opportunities Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-bold text-slate-900">Cross-Product Roadmap Opportunities</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {opps.map((o, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-blue-700 bg-blue-100 px-2 py-0.5 rounded border border-blue-200">
                  Impact: {o.impact}
                </span>
                <Layers className="w-4 h-4 text-slate-400" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">{o.title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{o.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
