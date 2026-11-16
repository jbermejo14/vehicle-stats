'use client';

import React, { useState } from 'react';
import { useData } from '@/context/DataContext';
import { KpiCard } from '@/components/telemetry/KpiCard';
import { TelemetryTooltip } from '@/components/telemetry/TelemetryTooltip';
import { BadgePill } from '@/components/telemetry/BadgePill';
import { TechnicalPartnerBanner } from '@/components/common/MonetizationBanner';
import { 
  Car, 
  Zap, 
  Leaf, 
  Gauge, 
  Trophy, 
  Flame, 
  Activity, 
  TrendingUp, 
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';

export function OverviewView() {
  const { kpis, timeline, filteredRecords, setActiveView, brandStats, filters } = useData();
  const [chartMode, setChartMode] = useState<'total' | 'propulsion' | 'etiquetas'>('total');

  return (
    <div className="space-y-6">
      {/* Monetization / Partner Banner */}
      <TechnicalPartnerBanner />

      {/* Informative Banner when Tramite is Transferencias */}
      {filters.tramite === 'transferencias' && (
        <div className="p-3.5 rounded-xl bg-accent/10 border border-accent/40 flex items-start space-x-3 text-xs text-zinc-300 shadow-[0_0_20px_rgba(255,85,0,0.1)]">
          <div className="w-6 h-6 rounded bg-accent/20 border border-accent/60 flex items-center justify-center text-accent shrink-0 mt-0.5">
            <ShieldAlert className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="font-mono font-bold text-accent uppercase tracking-wider text-[11px]">
              AUDITORÍA DGT // REMATRICULACIONES E IMPORTACIONES (CLASE 7)
            </div>
            <p className="mt-0.5 text-zinc-300 leading-relaxed font-sans text-xs">
              Visualizando los <strong className="text-white">115.327 vehículos</strong> registrados bajo el trámite de rematriculación (importación de vehículos usados de la UE/extranjero con emisión de nueva placa española). 
              <span className="text-zinc-400 block mt-0.5 text-[11px]">
                Nota técnica: Las transferencias y cambios de titularidad del mercado de ocasión nacional (VO entre particulares y concesionarios, ~2M anuales) se consolidan en el fichero estadístico <code className="text-accent/90">TRANSTOT</code>.
              </span>
            </p>
          </div>
        </div>
      )}

      {/* Top Telemetry KPI HUD Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KpiCard
          index="01"
          title="Total Registros"
          value={kpis.totalRegistrations}
          unit="regs"
          subtext={`${(kpis.nuevasCount || 0).toLocaleString('es-ES')} Nuevas // ${(kpis.transferenciasCount || 0).toLocaleString('es-ES')} Transf.`}
          icon={Car}
          accentColor="orange"
          progress={100}
        />
        <KpiCard
          index="02"
          title="Electrificación"
          value={kpis.electrificadosPct}
          unit="%"
          subtext={`0 CERO: ${kpis.ceroPct}% | ECO: ${kpis.ecoPct}%`}
          icon={Zap}
          accentColor="cyan"
          progress={kpis.electrificadosPct}
        />
        <KpiCard
          index="03"
          title="Media CO₂ Flota"
          value={kpis.avgCo2}
          unit="g/km"
          subtext={`${kpis.co2ExemptPct}% Exento IEDMT (≤120g)`}
          icon={Leaf}
          accentColor="green"
          progress={Math.min(100, Math.round((kpis.avgCo2 / 160) * 100))}
        />
        <KpiCard
          index="04"
          title="Potencia Media"
          value={kpis.avgKw}
          unit="kW"
          subtext={`Equiv. ${kpis.avgCv} CV // ${kpis.avgTara} kg tara`}
          icon={Gauge}
          accentColor="amber"
          progress={Math.min(100, Math.round((kpis.avgKw / 200) * 100))}
        />
        <KpiCard
          index="05"
          title="Marca Líder"
          value={kpis.topBrand.name}
          unit={`${kpis.topBrand.pct}%`}
          subtext={`${kpis.topBrand.count.toLocaleString('es-ES')} unidades`}
          icon={Trophy}
          accentColor="orange"
          progress={kpis.topBrand.pct * 3}
        />
        <KpiCard
          index="06"
          title="Modelo Top"
          value={kpis.topModel.name}
          unit={`${kpis.topModel.pct}%`}
          subtext={`${kpis.topModel.brand} (${kpis.topModel.count} regs)`}
          icon={Flame}
          accentColor="orange"
          progress={kpis.topModel.pct * 4}
        />
      </div>

      {/* Main Evolution Timeline Chart */}
      <div className="bg-card border border-border rounded-lg p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 pb-3 border-b border-zinc-900">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-[10px] text-accent uppercase tracking-widest">// EVOL // 01</span>
              <h3 className="font-sans font-bold text-base text-white tracking-wide">
                Evolución Diaria de Matriculaciones
              </h3>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Serie temporal de registros DGT por día de tramitación.
            </p>
          </div>

          {/* Chart Segment Selector */}
          <div className="flex bg-black/60 p-1 rounded border border-zinc-800 text-xs font-mono">
            <button
              onClick={() => setChartMode('total')}
              className={`px-3 py-1 rounded transition-colors ${
                chartMode === 'total' ? 'bg-accent text-black font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Volumen Total
            </button>
            <button
              onClick={() => setChartMode('propulsion')}
              className={`px-3 py-1 rounded transition-colors ${
                chartMode === 'propulsion' ? 'bg-accent text-black font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Por Combustible
            </button>
            <button
              onClick={() => setChartMode('etiquetas')}
              className={`px-3 py-1 rounded transition-colors ${
                chartMode === 'etiquetas' ? 'bg-accent text-black font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Por Etiqueta DGT
            </button>
          </div>
        </div>

        {/* Recharts Area Container */}
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chartMode === 'total' ? (
              <AreaChart data={timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF5500" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#FF5500" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1A1A22" vertical={false} />
                <XAxis dataKey="displayDate" stroke="#52525B" tick={{ fontSize: 11, fontFamily: 'monospace' }} />
                <YAxis stroke="#52525B" tick={{ fontSize: 11, fontFamily: 'monospace' }} />
                <Tooltip content={<TelemetryTooltip titlePrefix="FECHA" />} />
                <Area
                  type="monotone"
                  dataKey="total"
                  name="Total Matriculaciones"
                  stroke="#FF5500"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorTotal)"
                />
              </AreaChart>
            ) : chartMode === 'propulsion' ? (
              <AreaChart data={timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradHev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00E599" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#00E599" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="gradBev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#00E5FF" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1A1A22" vertical={false} />
                <XAxis dataKey="displayDate" stroke="#52525B" tick={{ fontSize: 11, fontFamily: 'monospace' }} />
                <YAxis stroke="#52525B" tick={{ fontSize: 11, fontFamily: 'monospace' }} />
                <Tooltip content={<TelemetryTooltip titlePrefix="PROPULSIÓN" />} />
                <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="hev" name="Híbrido (HEV)" stroke="#00E599" fill="url(#gradHev)" stackId="1" />
                <Area type="monotone" dataKey="bev" name="Eléctrico (BEV)" stroke="#00E5FF" fill="url(#gradBev)" stackId="1" />
                <Area type="monotone" dataKey="gasolina" name="Gasolina" stroke="#FF5500" fill="#FF5500" fillOpacity={0.2} stackId="1" />
                <Area type="monotone" dataKey="diesel" name="Diésel" stroke="#F4F4F6" fill="#F4F4F6" fillOpacity={0.1} stackId="1" />
              </AreaChart>
            ) : (
              <AreaChart data={timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1A1A22" vertical={false} />
                <XAxis dataKey="displayDate" stroke="#52525B" tick={{ fontSize: 11, fontFamily: 'monospace' }} />
                <YAxis stroke="#52525B" tick={{ fontSize: 11, fontFamily: 'monospace' }} />
                <Tooltip content={<TelemetryTooltip titlePrefix="ETIQUETA" />} />
                <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="eco" name="Etiqueta ECO" stroke="#00E599" fill="#00E599" fillOpacity={0.2} stackId="1" />
                <Area type="monotone" dataKey="cero" name="Etiqueta 0 CERO" stroke="#00E5FF" fill="#00E5FF" fillOpacity={0.2} stackId="1" />
                <Area type="monotone" dataKey="c" name="Etiqueta C" stroke="#10B981" fill="#10B981" fillOpacity={0.1} stackId="1" />
                <Area type="monotone" dataKey="b" name="Etiqueta B" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.1} stackId="1" />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two Column Grid: Top Brands Quick Ranking + Live Registration Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 7 Brands Leaderboard */}
        <div className="bg-card border border-border rounded-lg p-5">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-900">
            <div>
              <span className="font-mono text-[10px] text-accent uppercase tracking-widest">// RANK // 01</span>
              <h3 className="font-sans font-bold text-base text-white">Top Marcas Líderes</h3>
            </div>
            <button
              onClick={() => setActiveView('brands')}
              className="flex items-center space-x-1 text-xs font-mono text-accent hover:text-accent-hover transition-colors"
            >
              <span>Ver Top 20</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {brandStats.slice(0, 7).map((item, idx) => (
              <div key={item.brand} className="group flex items-center justify-between p-2 rounded bg-surface/50 hover:bg-surface border border-transparent hover:border-zinc-800 transition-all">
                <div className="flex items-center space-x-3">
                  <span className="font-mono text-xs font-bold text-zinc-500 w-5">
                    #{String(idx + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <span className="font-sans font-bold text-sm text-white group-hover:text-accent transition-colors">
                      {item.brand}
                    </span>
                    <span className="block font-mono text-[11px] text-zinc-500">
                      Top: {item.topModel}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono font-bold text-sm text-white">
                    {item.total.toLocaleString('es-ES')} <span className="text-[10px] text-zinc-500 font-normal">regs</span>
                  </div>
                  <div className="flex items-center justify-end space-x-2 font-mono text-[10px]">
                    <span className="text-emerald-400">{item.eco0Pct}% ECO/0</span>
                    <span className="text-zinc-500">{item.percentage}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Telemetry Ingest Stream (Recent 6 Parsed Records) */}
        <div className="bg-card border border-border rounded-lg p-5">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-900">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-[10px] text-accent uppercase tracking-widest">// FEED // LIVE</span>
              <h3 className="font-sans font-bold text-base text-white">Últimas Unidades Ingeridas</h3>
            </div>
            <span className="font-mono text-[11px] text-zinc-500">
              {filteredRecords.length.toLocaleString('es-ES')} en memoria
            </span>
          </div>

          <div className="space-y-2.5 overflow-hidden">
            {filteredRecords.slice(0, 6).map((rec) => (
              <div
                key={rec.id}
                className="flex items-center justify-between p-2.5 rounded bg-black/40 border border-zinc-900 hover:border-accent/40 font-mono text-xs transition-colors"
              >
                <div className="flex items-center space-x-3 truncate">
                  <div className="w-7 h-7 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 font-bold shrink-0">
                    {rec.categoriaLabel === 'Motocicleta' ? 'M' : rec.categoriaLabel === 'Comercial' ? 'N' : 'T'}
                  </div>
                  <div className="truncate">
                    <div className="font-bold text-white truncate text-[11px]">
                      {rec.marca} {rec.modelo}
                    </div>
                    <div className="text-[10px] text-zinc-500">
                      {rec.provinciaNombre} // {rec.fecMatricula}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <BadgePill badge={rec.etiquetaDgt} size="sm" />
                  <span className="text-[10px] font-bold text-accent">
                    {rec.potenciaKw} kW
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
