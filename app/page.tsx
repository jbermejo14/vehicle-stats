'use client';

import React, { useState } from 'react';
import { useData } from '@/context/DataContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { HeaderHUD } from '@/components/layout/HeaderHUD';
import { UploadModal } from '@/components/modals/UploadModal';
import { OverviewView } from '@/components/views/OverviewView';
import { ProvincesView } from '@/components/views/ProvincesView';
import { FuelsBadgesView } from '@/components/views/FuelsBadgesView';
import { BrandsModelsView } from '@/components/views/BrandsModelsView';
import { EngineeringView } from '@/components/views/EngineeringView';
import { EmissionsTaxView } from '@/components/views/EmissionsTaxView';
import { ImportDgtView } from '@/components/views/ImportDgtView';
import { RefreshCw } from 'lucide-react';

export default function DashboardPage() {
  const { activeView, isLoading } = useData();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Fixed Telemetry Sidebar */}
      <Sidebar
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area (offset by sidebar width on desktop) */}
      <div className="flex-1 flex flex-col md:pl-72 transition-all">
        {/* Top HUD Telemetry Bar */}
        <HeaderHUD onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />

        {/* Dashboard Main Workspace */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
          {isLoading && (
            <div className="flex items-center justify-center p-12 text-zinc-400 font-mono text-xs">
              <RefreshCw className="w-5 h-5 text-accent animate-spin mr-3" />
              <span>Sincronizando flujo de telemetría DGT...</span>
            </div>
          )}

          {!isLoading && (
            <>
              {activeView === 'overview' && <OverviewView />}
              {activeView === 'provinces' && <ProvincesView />}
              {activeView === 'fuels' && <FuelsBadgesView />}
              {activeView === 'brands' && <BrandsModelsView />}
              {activeView === 'engineering' && <EngineeringView />}
              {activeView === 'emissions' && <EmissionsTaxView />}
              {activeView === 'import' && <ImportDgtView />}
            </>
          )}
        </main>
      </div>

      {/* Quick Global Upload Modal */}
      <UploadModal />
    </div>
  );
}
