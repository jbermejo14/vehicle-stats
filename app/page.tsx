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
import { IndustryOriginView } from '@/components/views/IndustryOriginView';
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
          {/* Main SEO H1 (Screen-reader and Search-engine crawlable) */}
          <h1 className="sr-only">
            DGT Pulse // Plataforma de Estadísticas, Telemetría y Matriculaciones de Vehículos en España (Microdatos DGT MATRABA)
          </h1>

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
              {activeView === 'industry' && <IndustryOriginView />}
              {activeView === 'engineering' && <EngineeringView />}
              {activeView === 'emissions' && <EmissionsTaxView />}
              {activeView === 'import' && <ImportDgtView />}
            </>
          )}

          {/* Semantic SEO Crawlable Dataset Summary */}
          <section className="sr-only" aria-label="Información del Dataset Oficial DGT">
            <h2>Estadísticas de la Flota de Vehículos Matriculados en España</h2>
            <p>
              DGT Pulse recopila e indexa más de 5.400.000 de registros oficiales procedentes de los microdatos de matriculación (fichero MATRABA) de la Dirección General de Tráfico de España para el periodo 2024 a 2026.
              Permite el análisis interactivo de matriculaciones por provincia, motorización (Gasolina, Diésel, Híbridos HEV, Enchufables PHEV, Eléctricos BEV, Gas GLP/GNC), distintivos ambientales DGT (0 CERO, ECO, C, B),
              ranking de marcas y modelos, consorcios industriales OEM, trazabilidad Made in Spain mediante código WMI, análisis de la relación peso/potencia en kg/CV, y detección de paraísos fiscales municipales del IVTM.
            </p>
          </section>
        </main>

        {/* Semantic SEO Footer */}
        <footer className="border-t border-zinc-900 bg-black/60 p-6 text-zinc-500 font-mono text-xs">
          <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <span className="text-accent font-bold">DGT PULSE</span>
              <span>// Telemetría & Analítica de Microdatos Automotrices</span>
            </div>
            <div className="text-center md:text-right text-[11px] text-zinc-600">
              Datos basados en los ficheros públicos de microdatos abiertos de la Dirección General de Tráfico (DGT), Ministerio del Interior de España.
              Reutilización bajo la Ley 37/2007 de reutilización de la información del sector público.
            </div>
          </div>
        </footer>
      </div>

      {/* Quick Global Upload Modal */}
      <UploadModal />
    </div>
  );
}
