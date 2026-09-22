import React, { useState } from 'react';
import { askCardPulse } from '../api/client';
import type { AskAnswer } from '../types';
import { Sparkles, Send, ArrowRight, CornerDownRight, Database } from 'lucide-react';

interface AskCardPulsePageProps {
  setActiveTab: (tab: string) => void;
}

export const AskCardPulsePage: React.FC<AskCardPulsePageProps> = ({ setActiveTab }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState<AskAnswer | null>(null);

  const suggestedQuestions = [
    "Why did first-spend conversion decline last month?",
    "Which market has the largest activation opportunity?",
    "Compare new customers with existing remittance customers.",
    "Which customer segments have the strongest retention?",
    "Where are Android users dropping out?",
    "How are card and remittance customers behaving differently?"
  ];

  const handleSearch = async (text: string) => {
    if (!text.trim()) return;
    setQuery(text);
    setLoading(true);
    try {
      const res = await askCardPulse(text);
      setAnswer(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto">
      <div>
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Ask Card Pulse</h2>
          <span className="text-xs font-bold uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
            Natural Language Query Engine
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Ask questions in plain English to query Card Pulse's real SQLite database metrics & segment anomalies
        </p>
      </div>

      {/* Query Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-md space-y-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch(query);
          }}
          className="flex items-center gap-3"
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask a question about card activation, retention, drop-offs, or segment performance..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-5 py-3 rounded-xl font-bold text-xs flex items-center gap-2 transition-colors shrink-0 shadow-xs"
          >
            {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
            <span>Analyze</span>
          </button>
        </form>

        {/* Suggested Questions */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Suggested Demo Prompts:</span>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((q) => (
              <button
                key={q}
                onClick={() => handleSearch(q)}
                className="bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 text-xs px-3 py-1.5 rounded-lg border border-slate-200 transition-colors font-medium text-left"
              >
                "{q}"
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Response Card */}
      {answer && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs font-bold text-blue-600 flex items-center gap-1.5">
              <Database className="w-4 h-4" /> SQLite Direct SQL Query Execution Result
            </span>
            <span className="text-[11px] text-slate-400">Response generated deterministically</span>
          </div>

          {/* 1. Direct Answer */}
          <div className="space-y-1">
            <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">1. Direct Answer</span>
            <p className="text-base font-bold text-slate-900 leading-snug">{answer.direct_answer}</p>
          </div>

          {/* 2. Supporting Metrics Table */}
          <div className="space-y-2">
            <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">2. Supporting Database Metrics</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {answer.supporting_metrics.map((m, i) => (
                <div key={i} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                  <span className="text-slate-500 text-[11px]">{m.metric}</span>
                  <p className="text-lg font-bold text-slate-900 mt-0.5">
                    {m.value} {m.unit || ''}
                    {m.change && <span className="text-xs font-semibold text-rose-600 ml-1.5">{m.change}</span>}
                    {m.baseline && <span className="text-xs font-semibold text-slate-500 ml-1.5">(Base: {m.baseline})</span>}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Affected Segment */}
          <div className="space-y-1">
            <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">3. Affected Segment</span>
            <p className="text-xs font-semibold text-slate-800 bg-amber-50 border border-amber-200 p-2.5 rounded-lg inline-block">
              {answer.affected_segment}
            </p>
          </div>

          {/* 4. Suggested Next Analysis */}
          <div className="space-y-1">
            <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">4. Suggested Next Analysis</span>
            <p className="text-xs text-slate-700 flex items-start gap-1.5">
              <CornerDownRight className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>{answer.suggested_next_analysis}</span>
            </p>
          </div>

          {/* 5. Dashboard Action Button */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
            <button
              onClick={() => setActiveTab(answer.action_link.replace('/', ''))}
              className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 transition-colors shadow-xs"
            >
              <span>Navigate to Dashboard View ({answer.action_link})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
