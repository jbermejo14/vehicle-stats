'use client';

import React, { useState } from 'react';
import { useData } from '@/context/DataContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { HeaderHUD } from '@/components/layout/HeaderHUD';
import { OverviewView } from '@/components/views/OverviewView';
import { ProvincesView } from '@/components/views/ProvincesView';
import { FuelsBadgesView } from '@/components/views/FuelsBadgesView';
import { BrandsModelsView } from '@/components/views/BrandsModelsView';
import { IndustryOriginView } from '@/components/views/IndustryOriginView';
import { EngineeringView } from '@/components/views/EngineeringView';
import { EmissionsTaxView } from '@/components/views/EmissionsTaxView';
import { RefreshCw } from 'lucide-react';

export function InteractiveDashboard() {
  const { activeView, isLoading } = useData();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="relative flex flex-col md:flex-row bg-[#050505] rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
      {/* Sidebar navigation */}
      <Sidebar
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main interactive area */}
      <div className="flex-1 flex flex-col md:pl-72 transition-all min-w-0">
        <HeaderHUD onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />

        <div className="p-4 sm:p-6 lg:p-8 min-w-0">
          {isLoading && (
            <div className="flex items-center justify-center p-12 text-zinc-400 font-mono text-xs">
              <RefreshCw className="w-5 h-5 text-[#FF5500] animate-spin mr-3" />
              <span>Sincronizando flujo de telemetría DGT...</span>
            </div>
          )}

          {!isLoading && (
            <>
              {activeView === 'overview' && <OverviewView />}
              {activeView === 'provinces' && <ProvincesView />}
              {activeView === 'fuels' && <FuelsBadgesView />}
              {activeView === 'brands' && <BrandsModelsView />}
              {activeView === 'industry' && <IndustryOriginView />}
              {activeView === 'engineering' && <EngineeringView />}
              {activeView === 'emissions' && <EmissionsTaxView />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
