import React, { useState } from 'react';
import { FilterProvider } from './context/FilterContext';
import { Sidebar } from './components/Sidebar';
import { HeaderFilterBar } from './components/HeaderFilterBar';
import { CohortModal } from './components/CohortModal';

import { OverviewPage } from './pages/OverviewPage';
import { FunnelExplorerPage } from './pages/FunnelExplorerPage';
import { SegmentsPage } from './pages/SegmentsPage';
import { MoneyMovementPage } from './pages/MoneyMovementPage';
import { OpportunityRadarPage } from './pages/OpportunityRadarPage';
import { ExperimentLabPage } from './pages/ExperimentLabPage';
import { AskCardPulsePage } from './pages/AskCardPulsePage';
import { DataModelPage } from './pages/DataModelPage';

export const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [modalStage, setModalStage] = useState<string | null>(null);

  const handleOpenCohort = (stageName: string) => {
    setModalStage(stageName);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-blue-600 selection:text-white">
      {/* Left Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Global Filter Bar */}
        <HeaderFilterBar />

        {/* Dynamic Page Views */}
        <main className="flex-1">
          {activeTab === 'overview' && (
            <OverviewPage setActiveTab={setActiveTab} onOpenCohort={handleOpenCohort} />
          )}
          {activeTab === 'funnel-explorer' && (
            <FunnelExplorerPage onOpenCohort={handleOpenCohort} />
          )}
          {activeTab === 'segments' && <SegmentsPage />}
          {activeTab === 'money-movement' && <MoneyMovementPage />}
          {activeTab === 'opportunity-radar' && (
            <OpportunityRadarPage setActiveTab={setActiveTab} onOpenCohort={handleOpenCohort} />
          )}
          {activeTab === 'experiments' && <ExperimentLabPage />}
          {activeTab === 'ask-card-pulse' && (
            <AskCardPulsePage setActiveTab={setActiveTab} />
          )}
          {activeTab === 'data-model' && <DataModelPage />}
        </main>
      </div>

      {/* Global Cohort Modal Drilldown */}
      <CohortModal
        stageName={modalStage || ''}
        isOpen={!!modalStage}
        onClose={() => setModalStage(null)}
      />
    </div>
  );
};

export function App() {
  return (
    <FilterProvider>
      <AppContent />
    </FilterProvider>
  );
}

export default App;
