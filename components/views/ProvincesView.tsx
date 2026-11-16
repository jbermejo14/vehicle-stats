'use client';

import React, { useState, useMemo } from 'react';
import { useData } from '@/context/DataContext';
import { SpainProvincesMap } from '@/components/maps/SpainProvincesMap';
import { Search, MapPin, Users, Flame, Zap, ArrowUpDown, RotateCcw, Building2, ShieldAlert, Info } from 'lucide-react';

export function ProvincesView() {
  const { provinceStats, municipalityStats, filters, setFilter } = useData();
  const [viewMode, setViewMode] = useState<'provinces' | 'municipalities'>('provinces');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'total' | 'rate' | 'electrified' | 'co2'>('total');
  const [sortAsc, setSortAsc] = useState(false);

  // Filter and sort province stats
  const sortedProvinces = useMemo(() => {
    let list = [...provinceStats];

    if (searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        p => p.name.toLowerCase().includes(q) || p.community.toLowerCase().includes(q) || p.code.includes(q)
      );
    }

    list.sort((a, b) => {
      let diff = 0;
      if (sortBy === 'total') diff = b.totalRegistrations - a.totalRegistrations;
      else if (sortBy === 'rate') diff = b.ratePer1000 - a.ratePer1000;
      else if (sortBy === 'electrified') diff = b.electrifiedPct - a.electrifiedPct;
      else if (sortBy === 'co2') diff = a.avgCo2 - b.avgCo2;
      return sortAsc ? -diff : diff;
    });

    return list;
  }, [provinceStats, searchTerm, sortBy, sortAsc]);

  const toggleSort = (col: 'total' | 'rate' | 'electrified' | 'co2') => {
    if (sortBy === col) {
      setSortAsc(!sortAsc);
    } else {
      setSortBy(col);
      setSortAsc(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* View Mode Switcher: Provincias vs Municipios & IVTM */}
      <div className="flex items-center space-x-2 border-b border-zinc-800 pb-3">
        <button
          onClick={() => setViewMode('provinces')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-mono text-xs transition-colors ${
            viewMode === 'provinces'
              ? 'bg-accent/15 text-accent border border-accent/40 font-bold'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900 border border-transparent'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>52 Provincias & Censo INE</span>
        </button>

        <button
          onClick={() => setViewMode('municipalities')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-mono text-xs transition-colors ${
            viewMode === 'municipalities'
              ? 'bg-accent/15 text-accent border border-accent/40 font-bold'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900 border border-transparent'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Top Municipios & Hubs de Flotas (IVTM)</span>
        </button>
      </div>

      {viewMode === 'provinces' && (
        <>
          {/* Interactive Map Header & Component */}
          <SpainProvincesMap provinceStats={provinceStats} />

      {/* Provinces Ranking & Statistics Table */}
      <div className="bg-card border border-border rounded-lg p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5 pb-3 border-b border-zinc-900">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-[10px] text-accent uppercase tracking-widest">// RANK // 02</span>
              <h3 className="font-sans font-bold text-base text-white">
                Ranking de Provincias y Densidad de Matriculaciones
              </h3>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Desglose de las 52 provincias españolas con cálculo per cápita según censo oficial INE.
            </p>
          </div>

          {/* Search and Reset */}
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar provincia o CC.AA..."
                className="w-full pl-9 pr-3 py-1.5 bg-black/60 border border-zinc-800 rounded font-mono text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-accent"
              />
            </div>

            {filters.provincia !== 'todas' && (
              <button
                onClick={() => setFilter('provincia', 'todas')}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 rounded font-mono text-xs transition-colors shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5 text-accent" />
                <span>Restablecer Filtro</span>
              </button>
            )}
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500 uppercase text-[10px] tracking-wider">
                <th className="pb-3 pl-2">Cod</th>
                <th className="pb-3">Provincia / Comunidad</th>
                <th 
                  className="pb-3 text-right cursor-pointer hover:text-white"
                  onClick={() => toggleSort('total')}
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>Matriculaciones</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th 
                  className="pb-3 text-right cursor-pointer hover:text-white"
                  onClick={() => toggleSort('rate')}
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>Tasa / 1.000 Hab</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th 
                  className="pb-3 text-right cursor-pointer hover:text-white"
                  onClick={() => toggleSort('electrified')}
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>% ECO / 0 Cero</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="pb-3 text-left pl-6">Marca Líder</th>
                <th 
                  className="pb-3 text-right pr-2 cursor-pointer hover:text-white"
                  onClick={() => toggleSort('co2')}
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>Media CO₂</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {sortedProvinces.map((prov) => {
                const isSelected = filters.provincia === prov.code;

                return (
                  <tr
                    key={prov.code}
                    onClick={() => {
                      if (filters.provincia === prov.code) {
                        setFilter('provincia', 'todas');
                      } else {
                        setFilter('provincia', prov.code);
                      }
                    }}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-accent/15 border-l-2 border-accent font-semibold'
                        : 'hover:bg-zinc-900/60'
                    }`}
                  >
                    <td className="py-3 pl-2 text-zinc-500 font-bold">{prov.code}</td>
                    <td className="py-3">
                      <div className="font-sans font-bold text-sm text-white flex items-center space-x-2">
                        <span>{prov.name}</span>
                        {isSelected && (
                          <span className="text-[10px] font-mono font-bold text-accent px-1.5 py-0.2 rounded bg-accent/20">
                            FILTRADO
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-zinc-500">{prov.community}</div>
                    </td>
                    <td className="py-3 text-right">
                      <span className="font-bold text-white text-sm">
                        {prov.totalRegistrations.toLocaleString('es-ES')}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <span className="text-accent font-bold text-sm">
                        {prov.ratePer1000}
                      </span>
                      <span className="text-[10px] text-zinc-500 ml-1">/1k</span>
                    </td>
                    <td className="py-3 text-right">
                      <div className="inline-flex items-center space-x-1.5">
                        <span className="font-bold text-emerald-400">
                          {prov.electrifiedPct}%
                        </span>
                        <div className="w-12 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-400 rounded-full"
                            style={{ width: `${Math.min(100, prov.electrifiedPct)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pl-6">
                      <span className="text-zinc-200 font-bold">{prov.topBrand}</span>
                    </td>
                    <td className="py-3 text-right pr-2">
                      <span className="text-zinc-300 font-bold">
                        {prov.avgCo2 > 0 ? `${prov.avgCo2} g/km` : 'N/D'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )}

  {/* MUNICIPALITIES & FLEET HUBS VIEW */}
  {viewMode === 'municipalities' && (
    <div className="space-y-6">
      {/* Informative Alert / Context Banner */}
      <div className="bg-gradient-to-r from-amber-950/40 via-card to-card border border-amber-900/50 rounded-lg p-5">
        <div className="flex items-start space-x-3">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-sans font-bold text-sm text-white flex items-center space-x-2">
              <span>El Fenómeno Fiscal del IVTM: Hubs de Renting y Flotas</span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/15 text-amber-400 border border-amber-500/30 font-mono">
                Análisis Tributario
              </span>
            </h4>
            <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
              En España, cada ayuntamiento fija libremente el <strong>Impuesto sobre Vehículos de Tracción Mecánica (IVTM)</strong> dentro de los límites de la Ley Reguladora de las Haciendas Locales. 
              Grandes multinacionales de <em>renting</em>, <em>leasing</em> y empresas de alquiler domicilian sus flotas en municipios con tipos impositivos mínimos 
              (como <strong>Alcobendas, Venturada, Moralzarzal, Robledo de Chavela o Rozas de Puerto Real</strong>), provocando anomalías estadísticas donde municipios pequeños concentran 
              más matriculaciones que capitales enteras.
            </p>
          </div>
        </div>
      </div>

      {/* Municipalities Table */}
      <div className="bg-card border border-border rounded-lg p-5">
        <div className="pb-3 mb-4 border-b border-zinc-900">
          <span className="font-mono text-[10px] text-accent uppercase tracking-widest">// RADAR MUNICIPAL // TOP LOCALIDADES</span>
          <h3 className="font-sans font-bold text-base text-white">
            Top 20 Municipios con Mayor Volumen de Matriculación
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Detección de polos de matriculación corporativa y flotas frente a particulares. Cifras proyectadas sobre el volumen total de matriculaciones según la distribución de microdatos oficiales DGT.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500 uppercase text-[10px] tracking-wider">
                <th className="pb-3 pl-2">#</th>
                <th className="pb-3">Municipio</th>
                <th className="pb-3">Provincia</th>
                <th className="pb-3">Tipología de Demanda</th>
                <th className="pb-3 text-right">Volumen Estimado</th>
                <th className="pb-3 text-right pr-2">Cuota Flota %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {municipalityStats.map((m, idx) => (
                <tr key={m.municipio} className="hover:bg-zinc-900/40 transition-colors">
                  <td className="py-3 pl-2 text-zinc-500">{String(idx + 1).padStart(2, '0')}</td>
                  <td className="py-3 font-bold text-white flex items-center space-x-2">
                    <Building2 className={`w-3.5 h-3.5 ${m.isFleetHub ? 'text-amber-400' : 'text-accent'}`} />
                    <span>{m.municipio}</span>
                  </td>
                  <td className="py-3 text-zinc-400">{m.provincia}</td>
                  <td className="py-3">
                    {m.isFleetHub ? (
                      <div className="group relative inline-block">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold flex items-center space-x-1 cursor-help">
                          <span>HUB FLOTA / RENTING</span>
                          <Info className="w-3 h-3 ml-1" />
                        </span>
                        {m.fleetHubReason && (
                          <div className="hidden group-hover:block absolute z-20 w-64 p-2 bg-black border border-amber-500/40 text-[10px] text-zinc-300 rounded shadow-lg mt-1 left-0">
                            {m.fleetHubReason}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] bg-zinc-900 text-zinc-400 border border-zinc-800">
                        Capital / Demanda Local
                      </span>
                    )}
                  </td>
                  <td className="py-3 text-right">
                    <span className="text-white font-bold">{m.total.toLocaleString('es-ES')}</span>
                    {m.sampleCount && (
                      <div className="text-[10px] text-zinc-500 font-mono">
                        {m.sampleCount.toLocaleString('es-ES')} fichas
                      </div>
                    )}
                  </td>
                  <td className="py-3 text-right pr-2 text-accent font-bold">{m.percentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )}
    </div>
  );
}
