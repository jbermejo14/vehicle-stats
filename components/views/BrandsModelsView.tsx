'use client';

import React, { useState, useMemo } from 'react';
import { useData } from '@/context/DataContext';
import { BadgePill } from '@/components/telemetry/BadgePill';
import { ModelActionButtons } from '@/components/common/ModelActionButtons';
import { 
  Trophy, 
  Search, 
  Car, 
  Bike, 
  Truck, 
  Layers, 
  ArrowRightLeft, 
  CheckCircle,
  ExternalLink,
  Zap,
  Leaf,
  Scale,
  Gauge
} from 'lucide-react';
import { CategoriaVehiculo } from '@/lib/dgtTypes';

export function BrandsModelsView() {
  const { 
    brandStats, 
    modelStats, 
    filters, 
    setFilter, 
    compareModels, 
    setCompareModels 
  } = useData();

  const [activeTab, setActiveTab] = useState<'models' | 'brands' | 'compare'>('models');
  const [modelSearch, setModelSearch] = useState('');

  // Filtered models by search query
  const filteredModels = useMemo(() => {
    if (!modelSearch.trim()) return modelStats;
    const q = modelSearch.toLowerCase();
    return modelStats.filter(
      m => m.fullName.toLowerCase().includes(q) || m.category.toLowerCase().includes(q)
    );
  }, [modelStats, modelSearch]);

  // Model Comparison logic
  const modelAData = useMemo(() => {
    return modelStats.find(m => m.fullName === compareModels[0]) || modelStats[0];
  }, [modelStats, compareModels]);

  const modelBData = useMemo(() => {
    return modelStats.find(m => m.fullName === compareModels[1]) || modelStats[1] || modelStats[0];
  }, [modelStats, compareModels]);

  const categoryOptions: { label: string; value: CategoriaVehiculo; icon: any }[] = [
    { label: 'Todos', value: 'todos', icon: Layers },
    { label: 'Turismos (M1)', value: 'turismos', icon: Car },
    { label: 'Motos (L3e)', value: 'motos', icon: Bike },
    { label: 'Furgonetas (N1)', value: 'furgonetas', icon: Truck },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header & Sub-navigation Tabs */}
      <div className="bg-card border border-border rounded-lg p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-zinc-900">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-[10px] text-accent uppercase tracking-widest">// RANK // 04</span>
              <h3 className="font-sans font-bold text-base text-white">
                Inteligencia de Marcas, Modelos & Comparador
              </h3>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Top 20 marcas y Top 25 modelos matriculados en España con comparador técnico directo.
            </p>
          </div>

          {/* Main Navigation Tabs */}
          <div className="flex bg-black/60 p-1 rounded border border-zinc-800 text-xs font-mono">
            <button
              onClick={() => setActiveTab('models')}
              className={`px-3 py-1.5 rounded transition-colors ${
                activeTab === 'models' ? 'bg-accent text-black font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Ranking Modelos (Top 25)
            </button>
            <button
              onClick={() => setActiveTab('brands')}
              className={`px-3 py-1.5 rounded transition-colors ${
                activeTab === 'brands' ? 'bg-accent text-black font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Ranking Marcas (Top 20)
            </button>
            <button
              onClick={() => setActiveTab('compare')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded transition-colors ${
                activeTab === 'compare' ? 'bg-accent text-black font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Comparador 1 vs 1</span>
            </button>
          </div>
        </div>

        {/* Vehicle Category Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-mono text-[11px] text-zinc-500 mr-1">Categoría:</span>
            {categoryOptions.map((opt) => {
              const Icon = opt.icon;
              const isActive = filters.categoria === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => setFilter('categoria', opt.value)}
                  className={`flex items-center space-x-1.5 px-2.5 py-1 rounded font-mono text-xs transition-all ${
                    isActive
                      ? 'bg-zinc-800 text-accent border border-accent/50'
                      : 'bg-black/40 text-zinc-400 border border-zinc-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          {activeTab !== 'compare' && (
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={modelSearch}
                onChange={(e) => setModelSearch(e.target.value)}
                placeholder="Filtrar por nombre..."
                className="w-full pl-8 pr-3 py-1 bg-black/60 border border-zinc-800 rounded font-mono text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-accent"
              />
            </div>
          )}
        </div>
      </div>

      {/* TAB 1: MODELS RANKING */}
      {activeTab === 'models' && (
        <div className="bg-card border border-border rounded-lg p-5">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 uppercase text-[10px] tracking-wider">
                  <th className="pb-3 pl-2">#</th>
                  <th className="pb-3">Modelo Homologado</th>
                  <th className="pb-3">Propulsión / Etiqueta</th>
                  <th className="pb-3 text-right">Potencia</th>
                  <th className="pb-3 text-right">Emisiones CO₂</th>
                  <th className="pb-3 text-right">Tara Media</th>
                  <th className="pb-3 text-right">Unidades</th>
                  <th className="pb-3 text-center pr-2">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {filteredModels.map((item, idx) => (
                  <tr key={item.fullName} className="hover:bg-zinc-900/60 transition-colors group">
                    <td className="py-3 pl-2 text-zinc-500 font-bold">
                      #{String(idx + 1).padStart(2, '0')}
                    </td>
                    <td className="py-3">
                      <div className="font-sans font-bold text-sm text-white group-hover:text-accent transition-colors">
                        {item.fullName}
                      </div>
                      <div className="text-[10px] text-zinc-500 uppercase">
                        {item.brand} // {item.category}
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center space-x-2">
                        <BadgePill badge={item.primaryBadge} size="sm" />
                        <span className="text-[11px] text-zinc-400">{item.primaryFuel}</span>
                      </div>
                    </td>
                    <td className="py-3 text-right font-bold text-white">
                      {item.avgKw} kW <span className="text-[10px] text-zinc-500 font-normal">({item.avgCv} CV)</span>
                    </td>
                    <td className="py-3 text-right">
                      <span className={`font-bold ${item.avgCo2 <= 120 ? 'text-emerald-400' : 'text-zinc-300'}`}>
                        {item.avgCo2} g/km
                      </span>
                    </td>
                    <td className="py-3 text-right text-zinc-300">
                      {item.avgTara > 0 ? `${item.avgTara.toLocaleString('es-ES')} kg` : 'N/D'}
                    </td>
                    <td className="py-3 text-right">
                      <span className="font-bold text-white text-sm">
                        {item.total.toLocaleString('es-ES')}
                      </span>
                      <span className="text-[10px] text-zinc-500 block">
                        {item.percentage}% cuota
                      </span>
                    </td>
                    <td className="py-3 text-center pr-2">
                      <ModelActionButtons modelFullName={item.model} brand={item.brand} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: BRANDS RANKING */}
      {activeTab === 'brands' && (
        <div className="bg-card border border-border rounded-lg p-5">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 uppercase text-[10px] tracking-wider">
                  <th className="pb-3 pl-2">#</th>
                  <th className="pb-3">Marca</th>
                  <th className="pb-3">Modelo Más Vendido</th>
                  <th className="pb-3 text-right">% ECO + 0 CERO</th>
                  <th className="pb-3 text-right">Potencia Media</th>
                  <th className="pb-3 text-right">Media CO₂ Flota</th>
                  <th className="pb-3 text-right pr-2">Total Matriculados</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {brandStats.map((item, idx) => (
                  <tr key={item.brand} className="hover:bg-zinc-900/60 transition-colors group">
                    <td className="py-3 pl-2 text-zinc-500 font-bold">
                      #{String(idx + 1).padStart(2, '0')}
                    </td>
                    <td className="py-3">
                      <div className="font-sans font-bold text-base text-white group-hover:text-accent transition-colors">
                        {item.brand}
                      </div>
                    </td>
                    <td className="py-3 text-zinc-300">
                      <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">
                        {item.topModel}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <span className="font-bold text-emerald-400">{item.eco0Pct}%</span>
                    </td>
                    <td className="py-3 text-right font-bold text-white">
                      {item.avgKw} kW
                    </td>
                    <td className="py-3 text-right text-zinc-300 font-bold">
                      {item.avgCo2} g/km
                    </td>
                    <td className="py-3 text-right pr-2">
                      <span className="font-bold text-white text-base">
                        {item.total.toLocaleString('es-ES')}
                      </span>
                      <span className="text-[10px] text-zinc-500 block">
                        {item.percentage}% del total
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: HEAD-TO-HEAD COMPARISON TOOL */}
      {activeTab === 'compare' && (
        <div className="bg-card border border-border rounded-lg p-5 space-y-6">
          <div className="pb-3 border-b border-zinc-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="font-mono text-[10px] text-accent uppercase tracking-widest">// VS // COMPARATIVA</span>
              <h3 className="font-sans font-bold text-base text-white">
                Comparador Cara a Cara: Análisis de datos homologados
              </h3>
            </div>
            <span className="font-mono text-xs text-zinc-400">
              Datos basados en microdatos de la DGT
            </span>
          </div>

          {/* Selector Bars */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Model A Selector */}
            <div className="bg-black/50 p-4 rounded-lg border border-zinc-800">
              <span className="font-mono text-[10px] text-accent uppercase tracking-widest block mb-2">
                VEHÍCULO A (AZUL TITANIO)
              </span>
              <select
                value={compareModels[0]}
                onChange={(e) => setCompareModels([e.target.value, compareModels[1]])}
                className="w-full p-2 bg-[#111115] border border-zinc-700 rounded font-mono text-xs text-white focus:outline-none focus:border-accent"
              >
                {modelStats.map((m) => (
                  <option key={`a-${m.fullName}`} value={m.fullName}>
                    {m.fullName} ({m.total} regs)
                  </option>
                ))}
              </select>
            </div>

            {/* Model B Selector */}
            <div className="bg-black/50 p-4 rounded-lg border border-zinc-800">
              <span className="font-mono text-[10px] text-orange-400 uppercase tracking-widest block mb-2">
                VEHÍCULO B (NARANJA ELÉCTRICO)
              </span>
              <select
                value={compareModels[1]}
                onChange={(e) => setCompareModels([compareModels[0], e.target.value])}
                className="w-full p-2 bg-[#111115] border border-zinc-700 rounded font-mono text-xs text-white focus:outline-none focus:border-accent"
              >
                {modelStats.map((m) => (
                  <option key={`b-${m.fullName}`} value={m.fullName}>
                    {m.fullName} ({m.total} regs)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Side by side comparison cards */}
          {modelAData && modelBData && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Card Model A */}
              <div className="bg-[#0E0E14] border border-sky-500/30 rounded-lg p-5 space-y-4 shadow-[0_0_20px_rgba(56,189,248,0.1)]">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                  <div>
                    <span className="font-mono text-[10px] text-sky-400 uppercase tracking-widest">
                      {modelAData.brand}
                    </span>
                    <h4 className="font-sans font-bold text-lg text-white">{modelAData.model}</h4>
                  </div>
                  <BadgePill badge={modelAData.primaryBadge} size="md" />
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div className="flex justify-between items-center py-1.5 border-b border-zinc-900">
                    <span className="text-zinc-500">Propulsión Homologada:</span>
                    <span className="text-white font-bold">{modelAData.primaryFuel}</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-zinc-900">
                    <span className="text-zinc-500">Potencia Neta (kW / CV):</span>
                    <span className="text-white font-bold text-sm">
                      {modelAData.avgKw} kW ({modelAData.avgCv} CV)
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-zinc-900">
                    <span className="text-zinc-500">Emisiones CO₂ WLTP:</span>
                    <span className={`font-bold text-sm ${modelAData.avgCo2 <= 120 ? 'text-emerald-400' : 'text-zinc-300'}`}>
                      {modelAData.avgCo2} g/km
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-zinc-900">
                    <span className="text-zinc-500">Tara Homologada Media:</span>
                    <span className="text-white font-bold">{modelAData.avgTara} kg</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-zinc-900">
                    <span className="text-zinc-500">Relación Peso / Potencia:</span>
                    <span className="text-sky-400 font-bold">
                      {modelAData.avgKw > 0 ? (modelAData.avgTara / modelAData.avgKw).toFixed(1) : 0} kg/kW
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1.5">
                    <span className="text-zinc-500">Total Matriculados:</span>
                    <span className="text-accent font-bold text-sm">{modelAData.total} unidades</span>
                  </div>
                </div>

                <div className="pt-2">
                  <ModelActionButtons modelFullName={modelAData.model} brand={modelAData.brand} />
                </div>
              </div>

              {/* Card Model B */}
              <div className="bg-[#0E0E14] border border-accent/40 rounded-lg p-5 space-y-4 shadow-[0_0_20px_rgba(255,85,0,0.15)]">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                  <div>
                    <span className="font-mono text-[10px] text-accent uppercase tracking-widest">
                      {modelBData.brand}
                    </span>
                    <h4 className="font-sans font-bold text-lg text-white">{modelBData.model}</h4>
                  </div>
                  <BadgePill badge={modelBData.primaryBadge} size="md" />
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div className="flex justify-between items-center py-1.5 border-b border-zinc-900">
                    <span className="text-zinc-500">Propulsión Homologada:</span>
                    <span className="text-white font-bold">{modelBData.primaryFuel}</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-zinc-900">
                    <span className="text-zinc-500">Potencia Neta (kW / CV):</span>
                    <span className="text-white font-bold text-sm">
                      {modelBData.avgKw} kW ({modelBData.avgCv} CV)
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-zinc-900">
                    <span className="text-zinc-500">Emisiones CO₂ WLTP:</span>
                    <span className={`font-bold text-sm ${modelBData.avgCo2 <= 120 ? 'text-emerald-400' : 'text-zinc-300'}`}>
                      {modelBData.avgCo2} g/km
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-zinc-900">
                    <span className="text-zinc-500">Tara Homologada Media:</span>
                    <span className="text-white font-bold">{modelBData.avgTara} kg</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-zinc-900">
                    <span className="text-zinc-500">Relación Peso / Potencia:</span>
                    <span className="text-accent font-bold">
                      {modelBData.avgKw > 0 ? (modelBData.avgTara / modelBData.avgKw).toFixed(1) : 0} kg/kW
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1.5">
                    <span className="text-zinc-500">Total Matriculados:</span>
                    <span className="text-accent font-bold text-sm">{modelBData.total} unidades</span>
                  </div>
                </div>

                <div className="pt-2">
                  <ModelActionButtons modelFullName={modelBData.model} brand={modelBData.brand} />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
