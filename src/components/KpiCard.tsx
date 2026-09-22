import React from 'react';
import { MetricTooltip } from './MetricTooltip';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface KpiCardProps {
  label: string;
  value: string | number;
  pop: string;
  explanation: string;
  icon?: React.ReactNode;
}

export const KpiCard: React.FC<KpiCardProps> = ({ label, value, pop, explanation, icon }) => {
  const isNegative = pop.startsWith('-');
  const isWarning = label.includes('Funding Rate') && isNegative;

  return (
    <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
          <MetricTooltip title={label} explanation={explanation} />
        </div>
        {icon && <div className="text-slate-400">{icon}</div>}
      </div>

      <div className="flex items-baseline justify-between mt-1">
        <span className="text-2xl font-bold text-slate-900 tracking-tight">{value}</span>
        <div className={`flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-full ${
          isWarning
            ? 'bg-rose-100 text-rose-700 border border-rose-200 animate-pulse'
            : isNegative
              ? 'bg-amber-50 text-amber-700 border border-amber-200'
              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
        }`}>
          {isNegative ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
          <span>{pop}</span>
        </div>
      </div>
    </div>
  );
};
