'use client';

import React from 'react';
import { useData } from '@/context/DataContext';
import { PHEV_BADGE_NOTE } from '@/lib/badgeCounts';
import { BadgePill } from '@/components/telemetry/BadgePill';
import { TelemetryTooltip } from '@/components/telemetry/TelemetryTooltip';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { Zap, Fuel, Award, Filter, RotateCcw, Flame, CheckCircle, ShieldAlert } from 'lucide-react';

export function FuelsBadgesView() {
  const { 
    fuelStats, 
    badgeStats, 
    fuelBadgeMatrix: crossMatrix, 
    filters, 
    setFilter,
    kpis 
  } = useData();

  const totalFuelSum = fuelStats.reduce((sum, f) => sum + f.count, 0) || kpis.totalRegistrations;
  const termicosCount = Math.max(0, kpis.totalRegistrations - kpis.electrificadosCount);
  const termicosPct = parseFloat(((termicosCount / (kpis.totalRegistrations || 1)) * 100).toFixed(1));

  return (
    <div className="space-y-6">
      {/* Top HUD Energy Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center space-x-2 text-zinc-400 mb-2 font-mono text-xs">
            <Fuel className="w-4 h-4 text-accent" />
            <span>TOTAL AUDITORÍA FLOTA //</span>
          </div>
          <div className="font-mono text-2xl font-extrabold text-white">
            {kpis.totalRegistrations.toLocaleString('es-ES')} <span className="text-accent text-xs font-mono">regs</span>
          </div>
          <div className="text-zinc-500 font-mono text-xs mt-1">
            Volumen consolidado para el periodo activo
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center space-x-2 text-zinc-400 mb-2 font-mono text-xs">
            <Zap className="w-4 h-4 text-emerald-400" />
            <span>ELECTRIFICACIÓN (ECO + 0) //</span>
          </div>
          <div className="font-mono text-2xl font-extrabold text-white">
            {kpis.electrificadosPct}%
          </div>
          <div className="text-zinc-400 font-mono text-xs mt-1">
            {kpis.electrificadosCount.toLocaleString('es-ES')} vehículos HEV, PHEV y BEV
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center space-x-2 text-zinc-400 mb-2 font-mono text-xs">
            <Award className="w-4 h-4 text-cyan-400" />
            <span>0 CERO EMISIONES //</span>
          </div>
          <div className="font-mono text-2xl font-extrabold text-cyan-400">
            {kpis.ceroPct}%
          </div>
          <div className="text-zinc-400 font-mono text-xs mt-1">
            {kpis.ceroCount.toLocaleString('es-ES')} unidades 100% eléctricas (BEV). {kpis.phevCount.toLocaleString('es-ES')} {PHEV_BADGE_NOTE}.
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center space-x-2 text-zinc-400 mb-2 font-mono text-xs">
            <Flame className="w-4 h-4 text-orange-400" />
            <span>COMBUSTIÓN TÉRMICA //</span>
          </div>
          <div className="font-mono text-2xl font-extrabold text-white">
            {termicosPct}%
          </div>
          <div className="text-zinc-400 font-mono text-xs mt-1">
            {termicosCount.toLocaleString('es-ES')} unidades Gasolina y Diésel (Etiqueta C)
          </div>
        </div>
      </div>

      {/* Top 2 Donut/Bar Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Propulsion Breakdown */}
        <div className="bg-card border border-border rounded-lg p-5">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-900">
            <div>
              <span className="font-mono text-[10px] text-accent uppercase tracking-widest">// FUEL // 03</span>
              <h3 className="font-sans font-bold text-base text-white">Mix de Propulsión</h3>
            </div>
            {filters.propulsion !== 'todas' && (
              <button
                onClick={() => setFilter('propulsion', 'todas')}
                className="flex items-center space-x-1 font-mono text-xs text-accent hover:underline"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Restablecer</span>
              </button>
            )}
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={fuelStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="count"
                  onClick={(entry: any) => { if (entry && entry.name) setFilter('propulsion', entry.name); }}
                  cursor="pointer"
                >
                  {fuelStats.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color} 
                      stroke="#050505" 
                      strokeWidth={2}
                      className="hover:opacity-80 transition-opacity"
                    />
                  ))}
                </Pie>
                <Tooltip content={<TelemetryTooltip titlePrefix="COMBUSTIBLE" />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Interactive Fuel Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4 pt-3 border-t border-zinc-900">
            {fuelStats.map((fuel) => {
              const isActive = filters.propulsion === fuel.name;
              return (
                <button
                  key={fuel.name}
                  onClick={() => setFilter('propulsion', isActive ? 'todas' : fuel.name)}
                  className={`flex flex-col p-2 rounded border text-left font-mono transition-all ${
                    isActive
                      ? 'bg-zinc-800 border-accent shadow-[0_0_12px_rgba(255,85,0,0.3)]'
                      : 'bg-black/40 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center space-x-1.5 truncate text-zinc-300">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: fuel.color }} />
                      <span className="truncate">{fuel.name}</span>
                    </span>
                    <span className="font-bold text-white ml-1">{fuel.percentage}%</span>
                  </div>
                  <span className="text-[10px] text-zinc-500 mt-1">
                    {fuel.count.toLocaleString('es-ES')} unidades
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Environmental Badge Breakdown */}
        <div className="bg-card border border-border rounded-lg p-5">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-900">
            <div>
              <span className="font-mono text-[10px] text-accent uppercase tracking-widest">// BADGE // 03</span>
              <h3 className="font-sans font-bold text-base text-white">Distintivo Ambiental DGT</h3>
            </div>
            {filters.etiqueta !== 'todas' && (
              <button
                onClick={() => setFilter('etiqueta', 'todas')}
                className="flex items-center space-x-1 font-mono text-xs text-accent hover:underline"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Restablecer</span>
              </button>
            )}
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={badgeStats} layout="vertical" margin={{ top: 10, right: 30, left: 30, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1A1A22" horizontal={false} />
                <XAxis type="number" stroke="#52525B" tick={{ fontSize: 11, fontFamily: 'monospace' }} />
                <YAxis dataKey="name" type="category" stroke="#52525B" tick={{ fontSize: 11, fontFamily: 'monospace' }} />
                <Tooltip content={<TelemetryTooltip titlePrefix="ETIQUETA" />} />
                <Bar 
                  dataKey="count" 
                  name="Total Vehículos" 
                  radius={[0, 4, 4, 0]}
                  onClick={(entry: any) => { if (entry && entry.name) setFilter('etiqueta', entry.name); }}
                  cursor="pointer"
                >
                  {badgeStats.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Badge Quick Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-4 pt-3 border-t border-zinc-900">
            {badgeStats.map((badge) => {
              const isActive = filters.etiqueta === badge.name;
              return (
                <button
                  key={badge.name}
                  onClick={() => setFilter('etiqueta', isActive ? 'todas' : badge.name)}
                  className={`p-2 rounded border text-center font-mono transition-all ${
                    isActive
                      ? 'bg-zinc-800 border-accent shadow-[0_0_12px_rgba(255,85,0,0.3)]'
                      : 'bg-black/40 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <BadgePill badge={badge.name} size="sm" />
                  <div className="font-bold text-white text-xs mt-1.5">{badge.percentage}%</div>
                  <div className="text-[10px] text-zinc-500">{badge.count.toLocaleString('es-ES')}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Cross-Tabulation Matrix: Propulsión x Etiqueta DGT */}
      <div className="bg-card border border-border rounded-lg p-5">
        <div className="pb-3 mb-4 border-b border-zinc-900">
          <span className="font-mono text-[10px] text-accent uppercase tracking-widest">// MATRIX // 03</span>
          <h3 className="font-sans font-bold text-base text-white">
            Matriz Cruzada: Propulsión Homologada vs Etiqueta DGT
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Cruce de tecnologías de tracción del parque de vehículos con su respectivo distintivo ambiental asignado por la DGT.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500 uppercase text-[10px]">
                <th className="py-2.5">Tipo de Propulsión</th>
                {(crossMatrix?.badges || ['0 CERO', 'ECO', 'C', 'B', 'SIN ETIQUETA']).map((b) => (
                  <th key={b} className="py-2.5 text-center">
                    <BadgePill badge={b} size="sm" />
                  </th>
                ))}
                <th className="py-2.5 text-right font-bold text-white pr-2">Total Flota</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {(crossMatrix?.fuels || []).map((fuel) => {
                const totalFuel = (crossMatrix?.badges || []).reduce(
                  (sum, b) => sum + (crossMatrix?.grid?.[fuel]?.[b] || 0),
                  0
                );

                return (
                  <tr key={fuel} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="py-3 font-bold text-white">{fuel}</td>
                    {(crossMatrix?.badges || []).map((b) => {
                      const count = crossMatrix?.grid?.[fuel]?.[b] || 0;
                      return (
                        <td key={b} className="py-3 text-center">
                          {count > 0 ? (
                            <span className="font-bold text-zinc-200 bg-zinc-800/80 px-2 py-0.5 rounded border border-zinc-700">
                              {count.toLocaleString('es-ES')}
                            </span>
                          ) : (
                            <span className="text-zinc-600">-</span>
                          )}
                        </td>
                      );
                    })}
                    <td className="py-3 text-right font-bold text-accent pr-2">
                      {totalFuel.toLocaleString('es-ES')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
