import React, { useEffect, useState } from 'react';
import { fetchDataModelHealth } from '../api/client';
import type { DataModelHealth } from '../types';
import { Database, ShieldCheck, FileText } from 'lucide-react';

export const DataModelPage: React.FC = () => {
  const [data, setData] = useState<DataModelHealth | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const res = await fetchDataModelHealth();
        setData(res);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading || !data) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] gap-2 text-slate-400">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs">Loading Data Model & Metric Trust...</span>
      </div>
    );
  }

  const { pipeline_health, metric_dictionary } = data;

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Data Model & Metric Trust</h2>
        <p className="text-xs text-slate-500 mt-1">
          Entity-relationship schema, metric calculation formulas, and data pipeline health indicators
        </p>
      </div>

      {/* Data Quality & Pipeline Health Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-sm">Data Pipeline Quality Indicators</h3>
          </div>
          <span className="text-xs font-bold uppercase text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded border border-emerald-300">
            Pipeline {pipeline_health.status}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-xs">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            <span className="text-slate-500 text-[11px]">Data Freshness</span>
            <p className="font-bold text-slate-900 text-sm mt-0.5">{pipeline_health.freshness}</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            <span className="text-slate-500 text-[11px]">Event Completeness</span>
            <p className="font-bold text-emerald-600 text-sm mt-0.5">{pipeline_health.completeness}%</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            <span className="text-slate-500 text-[11px]">Duplicate Event Rate</span>
            <p className="font-bold text-slate-900 text-sm mt-0.5">{pipeline_health.duplicate_event_rate}%</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            <span className="text-slate-500 text-[11px]">Unmapped Events</span>
            <p className="font-bold text-slate-900 text-sm mt-0.5">{pipeline_health.unmapped_events}</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            <span className="text-slate-500 text-[11px]">Last Refresh</span>
            <p className="font-bold text-slate-700 text-xs mt-0.5">{pipeline_health.last_pipeline_refresh}</p>
          </div>
        </div>
      </div>

      {/* ER Diagram Card */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-lg space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-white text-sm">Normalized Database Entity-Relationship Schema</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">SQLite (card_pulse.db)</span>
        </div>

        {/* Visual Table Schema Nodes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
          {/* dim_customer */}
          <div className="bg-slate-800/90 rounded-xl p-4 border border-blue-500/50 shadow-md space-y-2">
            <div className="flex items-center justify-between border-b border-slate-700 pb-2">
              <span className="font-bold text-blue-400">dim_customer</span>
              <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded">DIMENSION</span>
            </div>
            <ul className="space-y-1 text-slate-300 text-[11px]">
              <li className="font-bold text-amber-400">🔑 customer_id (PK)</li>
              <li>country</li>
              <li>signup_date</li>
              <li>acquisition_channel</li>
              <li>customer_type</li>
              <li>device</li>
              <li>risk_tier</li>
              <li>behavioral_segment</li>
            </ul>
          </div>

          {/* fact_customer_events */}
          <div className="bg-slate-800/90 rounded-xl p-4 border border-emerald-500/50 shadow-md space-y-2">
            <div className="flex items-center justify-between border-b border-slate-700 pb-2">
              <span className="font-bold text-emerald-400">fact_customer_events</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded">FACT</span>
            </div>
            <ul className="space-y-1 text-slate-300 text-[11px]">
              <li className="font-bold text-amber-400">🔑 event_id (PK)</li>
              <li className="text-blue-300">🔗 customer_id (FK)</li>
              <li>event_type</li>
              <li>event_timestamp</li>
              <li>country</li>
            </ul>
          </div>

          {/* fact_card_transactions */}
          <div className="bg-slate-800/90 rounded-xl p-4 border border-slate-700 shadow-md space-y-2">
            <div className="flex items-center justify-between border-b border-slate-700 pb-2">
              <span className="font-bold text-purple-400">fact_card_transactions</span>
              <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded">FACT</span>
            </div>
            <ul className="space-y-1 text-slate-300 text-[11px]">
              <li className="font-bold text-amber-400">🔑 transaction_id (PK)</li>
              <li className="text-blue-300">🔗 customer_id (FK)</li>
              <li>transaction_date</li>
              <li>merchant_category</li>
              <li>amount</li>
              <li>transaction_status</li>
            </ul>
          </div>

          {/* fact_funding */}
          <div className="bg-slate-800/90 rounded-xl p-4 border border-slate-700 shadow-md space-y-2">
            <div className="flex items-center justify-between border-b border-slate-700 pb-2">
              <span className="font-bold text-cyan-400">fact_funding</span>
              <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded">FACT</span>
            </div>
            <ul className="space-y-1 text-slate-300 text-[11px]">
              <li className="font-bold text-amber-400">🔑 funding_id (PK)</li>
              <li className="text-blue-300">🔗 customer_id (FK)</li>
              <li>funding_method</li>
              <li>funding_amount</li>
              <li>funding_timestamp</li>
              <li>funding_status</li>
            </ul>
          </div>

          {/* fact_remittance */}
          <div className="bg-slate-800/90 rounded-xl p-4 border border-slate-700 shadow-md space-y-2">
            <div className="flex items-center justify-between border-b border-slate-700 pb-2">
              <span className="font-bold text-pink-400">fact_remittance</span>
              <span className="text-[10px] bg-pink-500/20 text-pink-300 px-1.5 py-0.5 rounded">FACT</span>
            </div>
            <ul className="space-y-1 text-slate-300 text-[11px]">
              <li className="font-bold text-amber-400">🔑 remittance_id (PK)</li>
              <li className="text-blue-300">🔗 customer_id (FK)</li>
              <li>destination_country</li>
              <li>send_amount</li>
              <li>fee</li>
              <li>send_timestamp</li>
            </ul>
          </div>

          {/* fact_experiment */}
          <div className="bg-slate-800/90 rounded-xl p-4 border border-slate-700 shadow-md space-y-2">
            <div className="flex items-center justify-between border-b border-slate-700 pb-2">
              <span className="font-bold text-amber-400">fact_experiment</span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded">FACT</span>
            </div>
            <ul className="space-y-1 text-slate-300 text-[11px]">
              <li className="font-bold text-amber-400">🔑 (customer_id, experiment_id)</li>
              <li>variant</li>
              <li>exposure_timestamp</li>
              <li>converted (0/1)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Metric Dictionary Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-sm">Product Metric Dictionary & SQL Definitions</h3>
          </div>
          <span className="text-xs text-slate-500">Standardized metric definitions</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/70 uppercase text-[10px] font-bold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Metric Name</th>
                <th className="px-5 py-3">SQL Formula / Logic</th>
                <th className="px-5 py-3">Business Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {metric_dictionary.map((m) => (
                <tr key={m.metric_name} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4 font-bold text-slate-900">{m.metric_name}</td>
                  <td className="px-5 py-4 font-mono text-[11px] text-blue-700 bg-slate-50/50 rounded">
                    {m.formula}
                  </td>
                  <td className="px-5 py-4 text-slate-600 leading-relaxed">{m.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
