'use client';

import React from 'react';
import { useData, ViewKey } from '@/context/DataContext';
import { TramiteTipo } from '@/lib/dgtTypes';
import { 
  Radio, 
  MapPin, 
  Flame, 
  Trophy, 
  Gauge, 
  Leaf, 
  UploadCloud, 
  Car, 
  X, 
  Cpu, 
  ShieldCheck,
  Calendar,
  Layers,
  Sparkles,
  Database,
  ChevronDown
} from 'lucide-react';

interface SidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({ isMobileOpen, onCloseMobile }: SidebarProps) {
  const { 
    activeView, 
    setActiveView, 
    filters, 
    setFilter,
    availablePeriods,
    selectedPeriod,
    setSelectedPeriod
  } = useData();

  const navItems: { key: ViewKey; label: string; sublabel: string; icon: any; index: string }[] = [
    {
      key: 'overview',
      label: 'Visión General',
      sublabel: 'Command Center',
      icon: Radio,
      index: '01'
    },
    {
      key: 'provinces',
      label: 'Mapa & Provincias',
      sublabel: 'Densidad y Tasa INE',
      icon: MapPin,
      index: '02'
    },
    {
      key: 'fuels',
      label: 'Combustibles & Etiquetas',
      sublabel: 'Mix Energético DGT',
      icon: Flame,
      index: '03'
    },
    {
      key: 'brands',
      label: 'Marcas & Modelos',
      sublabel: 'Top 25 & Comparador',
      icon: Trophy,
      index: '04'
    },
    {
      key: 'engineering',
      label: 'Ingeniería & Potencia',
      sublabel: 'kW, CV & Tara',
      icon: Gauge,
      index: '05'
    },
    {
      key: 'emissions',
      label: 'Emisiones & IEDMT',
      sublabel: 'CO₂ & Impuestos',
      icon: Leaf,
      index: '06'
    },
    {
      key: 'import',
      label: 'Importar DGT (.TXT)',
      sublabel: 'Cargar Archivo Fijo',
      icon: UploadCloud,
      index: '07'
    }
  ];

  const tramiteOptions: { value: TramiteTipo; label: string }[] = [
    { value: 'todas', label: 'Todos los Trámites' },
    { value: 'nuevas', label: 'Nuevas (Ord. 0)' },
    { value: 'transferencias', label: 'Transferencias (7)' },
    { value: 'bajas', label: 'Bajas / Otros' }
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Main Sidebar Panel */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#09090C] border-r border-border flex flex-col justify-between transition-transform duration-300 md:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Header & Logo */}
        <div className="p-5 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-lg bg-accent/15 border border-accent/40 flex items-center justify-center text-accent shadow-glow">
                <Radio className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h1 className="font-sans font-extrabold text-base text-white tracking-wider leading-none">
                  DGT <span className="text-accent">PULSE</span>
                </h1>
                <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest block mt-1">
                  Telemetry & Fleet Analytics
                </span>
              </div>
            </div>

            <button
              onClick={onCloseMobile}
              className="p-1 rounded text-zinc-500 hover:text-white md:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Database Status Tag */}
          <div className="mt-4 flex items-center justify-between px-2.5 py-1 rounded bg-black/60 border border-zinc-900 font-mono text-[10px]">
            <div className="flex items-center space-x-1.5 text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>BBDD DGT 2024-2026</span>
            </div>
            <span className="text-accent font-bold">5.4M REGS</span>
          </div>
        </div>

        {/* Scrollable Center: Period Selector, Tramite & Nav */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
          {/* Historical Period Selector */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-1">
              <span className="font-mono text-[10px] text-accent uppercase tracking-widest flex items-center space-x-1">
                <Database className="w-3 h-3 mr-1" />
                <span>PERIODO HISTÓRICO //</span>
              </span>
            </div>

            <div className="relative">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="w-full pl-3 pr-8 py-2 bg-black/80 border border-zinc-800 hover:border-accent/60 rounded-lg font-mono text-xs text-white appearance-none focus:outline-none focus:border-accent shadow-[0_0_15px_rgba(0,0,0,0.4)] cursor-pointer"
              >
                {availablePeriods.map((p) => (
                  <option 
                    key={p.id} 
                    value={p.id}
                    className="bg-[#111115] text-white py-1"
                  >
                    {p.isAll ? `★ ${p.label}` : p.isYear ? `◆ ${p.label}` : p.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Quick Procedure Selector (Tramite) */}
          <div className="space-y-1.5">
            <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest px-1">
              // TIPO DE TRÁMITE DGT
            </span>
            <div className="grid grid-cols-1 gap-1">
              {tramiteOptions.map((opt) => {
                const isSelected = filters.tramite === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setFilter('tramite', opt.value)}
                    className={`flex items-center justify-between px-3 py-1.5 rounded font-mono text-xs transition-all text-left ${
                      isSelected
                        ? 'bg-accent text-black font-bold shadow-glow'
                        : 'bg-black/40 text-zinc-400 hover:text-white hover:bg-zinc-900 border border-zinc-900'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-black" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation Views List */}
          <div className="space-y-1">
            <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest px-1 block mb-2">
              // CONSOLA DE TELEMETRÍA
            </span>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.key;

              return (
                <button
                  key={item.key}
                  onClick={() => {
                    setActiveView(item.key);
                    onCloseMobile();
                  }}
                  className={`w-full group flex items-center justify-between px-3 py-2.5 rounded-lg font-mono text-xs transition-all text-left border ${
                    isActive
                      ? 'bg-accent/15 border-accent text-white shadow-[0_0_15px_rgba(255,85,0,0.15)] font-bold'
                      : 'border-transparent text-zinc-400 hover:text-white hover:bg-zinc-900/60 hover:border-zinc-800'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-7 h-7 rounded flex items-center justify-center transition-colors ${
                        isActive
                          ? 'bg-accent text-black font-bold'
                          : 'bg-zinc-900 text-zinc-400 group-hover:text-accent group-hover:bg-zinc-800'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="leading-tight">{item.label}</div>
                      <div className="text-[10px] text-zinc-500 font-normal leading-tight mt-0.5">
                        {item.sublabel}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] ${
                      isActive ? 'text-accent' : 'text-zinc-600 group-hover:text-zinc-400'
                    }`}
                  >
                    {item.index}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer: System Telemetry Specifications */}
        <div className="p-4 border-t border-border bg-[#060608] font-mono text-[10px] text-zinc-500 space-y-1">
          <div className="flex justify-between">
            <span>REGISTROS BBDD:</span>
            <span className="text-white font-bold">5.412.845</span>
          </div>
          <div className="flex justify-between">
            <span>RANGO TEMPORAL:</span>
            <span className="text-accent font-bold">2024-01 ~ 2026-10</span>
          </div>
          <div className="flex justify-between">
            <span>MOTOR SQL:</span>
            <span className="text-zinc-300">SQLite v3 / Node 24</span>
          </div>
        </div>
      </aside>
    </>
  );
}
