'use client';

import React, { useState, useEffect } from 'react';
import { useData, ViewKey } from '@/context/DataContext';
import { 
  RotateCcw, 
  Menu, 
  Clock, 
  ChevronRight,
  Database
} from 'lucide-react';

interface HeaderHUDProps {
  onToggleMobileSidebar: () => void;
}

export function HeaderHUD({ onToggleMobileSidebar }: HeaderHUDProps) {
  const { 
    activeView, 
    filters, 
    resetFilters, 
    availablePeriods,
    selectedPeriod,
    setSelectedPeriod
  } = useData();

  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        }) + ' CET'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const viewTitles: Record<ViewKey, string> = {
    overview: 'COMMAND CENTER // VISIÓN GENERAL',
    provinces: 'MAPA & RANKING PROVINCIAL (INE)',
    fuels: 'COMBUSTIBLES & DISTINTIVOS DGT',
    brands: 'RANKING MARCAS, MODELOS & COMPARADOR',
    industry: 'INDUSTRIA, FACTORÍAS WMI & GRUPOS OEM',
    engineering: 'INGENIERÍA, POTENCIA & RELACIÓN PESO/POTENCIA',
    emissions: 'EMISIONES CO₂ & TRAMOS IEDMT'
  };

  const hasActiveFilters = 
    filters.tramite !== 'todas' || 
    filters.categoria !== 'todos' || 
    filters.propulsion !== 'todas' || 
    filters.etiqueta !== 'todas' || 
    filters.provincia !== 'todas' ||
    filters.search !== '';

  return (
    <header className="sticky top-0 z-40 w-full bg-[#07070A]/95 backdrop-blur-md border-b border-border px-4 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Left Side: Mobile Menu Button + Breadcrumbs */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onToggleMobileSidebar}
            className="p-1.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white md:hidden"
            title="Abrir menú"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2 font-mono text-xs">
            <span className="text-zinc-500 font-bold hidden sm:inline">DGT PULSE</span>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-700 hidden sm:inline" />
            <span className="text-accent font-bold tracking-wider truncate max-w-[200px] sm:max-w-none">
              {viewTitles[activeView] || 'TELEMETRÍA DGT'}
            </span>
          </div>
        </div>

        {/* Center / Right: Period selector, Live Clock, Reset */}
        <div className="flex items-center space-x-3">
          {/* Quick Period Selector Dropdown on Header */}
          {availablePeriods.length > 0 && (
            <div className="hidden xl:flex items-center space-x-1.5 bg-black/60 border border-zinc-800 hover:border-accent/40 rounded px-2.5 py-1 text-xs font-mono">
              <Database className="w-3.5 h-3.5 text-accent" />
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="bg-transparent text-white font-bold focus:outline-none cursor-pointer max-w-[220px] truncate"
              >
                {availablePeriods.map((p) => (
                  <option key={p.id} value={p.id} className="bg-[#111115] text-white">
                    {p.isAll ? `★ Histórico Completo (2024-2026)` : p.isYear ? `◆ Año ${p.id} Completo` : p.label.split(' • ')[0]}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Live Telemetry Clock */}
          <div className="hidden lg:flex items-center space-x-2 px-2.5 py-1 rounded bg-black/60 border border-zinc-800 font-mono text-xs text-zinc-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <Clock className="w-3.5 h-3.5 text-zinc-500" />
            <span>{timeStr || 'CET'}</span>
          </div>

          {/* Reset Filters Pill (visible only when filters active) */}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center space-x-1 px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 rounded font-mono text-xs transition-colors"
              title="Restablecer todos los filtros"
            >
              <RotateCcw className="w-3 h-3 text-accent" />
              <span className="hidden md:inline">Limpiar Filtros</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
