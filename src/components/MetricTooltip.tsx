import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

interface MetricTooltipProps {
  title: string;
  explanation: string;
}

export const MetricTooltip: React.FC<MetricTooltipProps> = ({ title, explanation }) => {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        className="text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>

      {visible && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2.5 bg-slate-900 text-slate-100 text-[11px] rounded-lg shadow-xl z-50 pointer-events-none border border-slate-700 leading-normal">
          <p className="font-semibold text-white mb-1">{title}</p>
          <p className="text-slate-300">{explanation}</p>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
        </div>
      )}
    </div>
  );
};
