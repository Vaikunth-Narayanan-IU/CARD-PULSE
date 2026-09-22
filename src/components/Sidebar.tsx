import React from 'react';
import { 
  LayoutDashboard, 
  Filter, 
  Users, 
  ArrowLeftRight, 
  Radar, 
  FlaskConical, 
  Sparkles, 
  Database,
  CreditCard,
  ShieldCheck
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'funnel-explorer', label: 'Funnel Explorer', icon: Filter },
    { id: 'segments', label: 'Segments', icon: Users },
    { id: 'money-movement', label: 'Money Movement', icon: ArrowLeftRight },
    { id: 'opportunity-radar', label: 'Opportunity Radar', icon: Radar, badge: 'Seeded' },
    { id: 'experiments', label: 'Experiments', icon: FlaskConical },
    { id: 'ask-card-pulse', label: 'Ask Card Pulse', icon: Sparkles },
    { id: 'data-model', label: 'Data Model', icon: Database },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen sticky top-0 border-r border-slate-800 shadow-xl shrink-0 z-30">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
          <CreditCard className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-bold text-white text-base tracking-wide flex items-center gap-1.5">
            CARD PULSE
          </h1>
          <p className="text-[11px] text-slate-400 font-medium">Global Card Intelligence</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' 
                  : 'hover:bg-slate-800/70 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Mandatory Unobtrusive Portfolio Disclaimer Badge */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/60 text-[11px] text-slate-400 leading-relaxed">
        <div className="flex items-center gap-1.5 text-amber-400 font-semibold mb-1">
          <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
          <span>Synthetic Portfolio Data</span>
        </div>
        <p className="text-slate-400 text-[10.5px]">
          Portfolio concept — synthetic demonstration data. Not affiliated with or using internal Remitly data.
        </p>
      </div>
    </aside>
  );
};
