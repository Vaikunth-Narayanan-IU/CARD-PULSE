import React from 'react';
import { useFilters } from '../context/FilterContext';
import { Filter, RotateCcw } from 'lucide-react';

export const HeaderFilterBar: React.FC = () => {
  const { filters, setFilter, resetFilters } = useFilters();

  const countries = ['All Countries', 'United States', 'Mexico', 'Philippines', 'India', 'Colombia'];
  const channels = ['All Channels', 'Paid Search', 'Paid Social', 'Organic', 'Referral', 'Remittance Cross-Sell'];
  const customerTypes = ['All Types', 'New Customer', 'Existing Remittance Customer', 'High-Frequency Sender', 'High-Value Sender'];
  const devices = ['All Devices', 'iOS', 'Android', 'Web'];
  const dateRanges = [
    { label: '7 Days', value: '7D' },
    { label: '30 Days', value: '30D' },
    { label: '90 Days', value: '90D' },
    { label: '180 Days', value: '180D' },
    { label: 'All Time', value: 'ALL' }
  ];

  const activeFilterCount = Object.entries(filters).filter(([k, v]) => {
    if (k === 'dateRange') return v !== '180D';
    return !v.startsWith('All');
  }).length;

  return (
    <div className="bg-white border-b border-slate-200 px-6 py-3 sticky top-0 z-20 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-slate-700 font-semibold text-xs uppercase tracking-wider">
          <Filter className="w-3.5 h-3.5 text-blue-600" />
          <span>Global Filters</span>
          {activeFilterCount > 0 && (
            <span className="ml-1 bg-blue-100 text-blue-700 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
              {activeFilterCount}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Date Range Selector */}
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
            {dateRanges.map((dr) => (
              <button
                key={dr.value}
                onClick={() => setFilter('dateRange', dr.value)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                  filters.dateRange === dr.value
                    ? 'bg-white text-blue-600 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {dr.label}
              </button>
            ))}
          </div>

          {/* Country */}
          <select
            value={filters.country}
            onChange={(e) => setFilter('country', e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg px-2.5 py-1.5 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            {countries.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Channel */}
          <select
            value={filters.acquisitionChannel}
            onChange={(e) => setFilter('acquisitionChannel', e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg px-2.5 py-1.5 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            {channels.map((ch) => (
              <option key={ch} value={ch}>{ch}</option>
            ))}
          </select>

          {/* Customer Type */}
          <select
            value={filters.customerType}
            onChange={(e) => setFilter('customerType', e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg px-2.5 py-1.5 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            {customerTypes.map((ct) => (
              <option key={ct} value={ct}>{ct}</option>
            ))}
          </select>

          {/* Device */}
          <select
            value={filters.device}
            onChange={(e) => setFilter('device', e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg px-2.5 py-1.5 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            {devices.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          {/* Reset Filters */}
          {activeFilterCount > 0 && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 text-slate-500 hover:text-slate-800 px-2 py-1 rounded hover:bg-slate-100 transition-colors text-xs font-medium"
              title="Reset all filters"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
