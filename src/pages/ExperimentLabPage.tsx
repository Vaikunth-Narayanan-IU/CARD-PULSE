import React, { useEffect, useState } from 'react';
import { fetchExperiment } from '../api/client';
import type { ExperimentData } from '../types';
import { FlaskConical, CheckCircle2 } from 'lucide-react';

export const ExperimentLabPage: React.FC = () => {
  const [exp, setExp] = useState<ExperimentData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const res = await fetchExperiment('exp_post_activation_funding');
        setExp(res);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading || !exp) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] gap-2 text-slate-400">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs">Loading Experiment Lab...</span>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Experiment Lab</h2>
            <span className="text-xs font-bold uppercase text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded border border-blue-300">
              Live Experiment
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Controlled A/B product experiment workspace converts Opportunity Radar findings into validated roadmap actions
          </p>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-2 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">Winner Declared: Variant B (+20.5% Relative Uplift)</span>
        </div>
      </div>

      {/* Experiment Brief Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
        <div className="border-b border-slate-100 pb-4">
          <h3 className="text-lg font-bold text-slate-900">{exp.title}</h3>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            <strong className="text-slate-900">Hypothesis:</strong> {exp.hypothesis}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/70">
            <span className="text-slate-500 text-[11px] uppercase font-bold">Target Population</span>
            <p className="font-semibold text-slate-900 mt-1">{exp.target_population}</p>
          </div>
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/70">
            <span className="text-slate-500 text-[11px] uppercase font-bold">Primary Metric</span>
            <p className="font-bold text-blue-600 mt-1">{exp.primary_metric}</p>
          </div>
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/70">
            <span className="text-slate-500 text-[11px] uppercase font-bold">Guardrail Metrics</span>
            <p className="font-semibold text-slate-700 mt-1">{exp.guardrails.join(' • ')}</p>
          </div>
        </div>

        {/* Variant Definitions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-2">
          <div className="border border-slate-200 p-3.5 rounded-xl bg-slate-50/50">
            <span className="font-bold text-slate-700 uppercase text-[10.5px]">Control</span>
            <p className="text-slate-600 mt-1">{exp.control_description}</p>
          </div>
          <div className="border border-blue-200 p-3.5 rounded-xl bg-blue-50/30">
            <span className="font-bold text-blue-800 uppercase text-[10.5px]">Variant A</span>
            <p className="text-slate-600 mt-1">{exp.variant_a_description}</p>
          </div>
          <div className="border border-emerald-300 p-3.5 rounded-xl bg-emerald-50/40">
            <span className="font-bold text-emerald-800 uppercase text-[10.5px]">Variant B (Recommended)</span>
            <p className="text-slate-600 mt-1">{exp.variant_b_description}</p>
          </div>
        </div>
      </div>

      {/* Experiment Results Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">Simulated Experiment Performance & Statistical Inference</h3>
          <span className="text-xs text-slate-500">Confidence Interval: 95% 2-tailed z-test</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/70 uppercase text-[10px] font-bold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Variant</th>
                <th className="px-5 py-3">Sample Size</th>
                <th className="px-5 py-3">7-Day Funding Conv</th>
                <th className="px-5 py-3">Abs Uplift</th>
                <th className="px-5 py-3">Rel Uplift</th>
                <th className="px-5 py-3">95% CI</th>
                <th className="px-5 py-3">Stat Sig</th>
                <th className="px-5 py-3 text-right">Est. Monthly Impact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {exp.variants.map((v) => {
                const isControl = v.variant === 'Control';
                const isWinner = v.variant === 'Variant B';
                return (
                  <tr
                    key={v.variant}
                    className={`hover:bg-slate-50 transition-colors ${
                      isWinner ? 'bg-emerald-50/40 font-semibold' : ''
                    }`}
                  >
                    <td className="px-5 py-4 font-bold text-slate-900 flex items-center gap-2">
                      {v.variant}
                      {isWinner && (
                        <span className="text-[10px] uppercase font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-300">
                          Winning Variant
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 font-semibold">{v.sample_size.toLocaleString()}</td>
                    <td className="px-5 py-4 font-bold text-slate-900">{v.conversion_rate}%</td>
                    <td className="px-5 py-4">
                      {isControl ? '-' : (
                        <span className="font-bold text-emerald-700">+{v.absolute_uplift}%</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {isControl ? '-' : (
                        <span className="font-bold text-emerald-700">+{v.relative_uplift}%</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-slate-600 font-mono text-[11px]">{v.confidence_interval}</td>
                    <td className="px-5 py-4">
                      {isControl ? '-' : (
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10.5px]">
                          p = {v.p_value} (Sig)
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right font-extrabold text-emerald-600">
                      {isControl ? '-' : `+$${v.estimated_monthly_impact.toLocaleString()}`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Decision & Roadmap Conclusion Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md space-y-3">
        <div className="flex items-center gap-2 font-bold text-emerald-400 text-sm">
          <FlaskConical className="w-5 h-5" />
          <span>Product Roadmap Decision & Business Impact</span>
        </div>
        <p className="text-xs text-slate-200 leading-relaxed font-medium">
          {exp.conclusion}
        </p>
      </div>
    </div>
  );
};
