'use client';

import React from 'react';
import { useData } from '@/context/DataContext';
import { TelemetryTooltip } from '@/components/telemetry/TelemetryTooltip';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Cell, 
  PieChart, 
  Pie 
} from 'recharts';
import { ShieldAlert, Leaf, CheckCircle, Percent, AlertCircle, FileCheck } from 'lucide-react';

export function EmissionsTaxView() {
  const { co2Histogram, iedmtBrackets, euroStandards, kpis } = useData();

  const taxColors = ['#00E599', '#FF9E00', '#FF5500', '#FF2A00'];

  return (
    <div className="space-y-6">
      {/* Top 3 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center space-x-2 text-zinc-400 mb-2 font-mono text-xs">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>EXENCIÓN FISCAL IEDMT //</span>
          </div>
          <div className="font-mono text-3xl font-extrabold text-white">
            {kpis.co2ExemptPct} <span className="text-emerald-400 text-sm">%</span>
          </div>
          <div className="text-zinc-500 font-mono text-xs mt-1">
            Vehículos con emisiones ≤ 120 g/km (Tipo 0%)
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center space-x-2 text-zinc-400 mb-2 font-mono text-xs">
            <Leaf className="w-4 h-4 text-accent" />
            <span>MEDIA FLOTA WLTP //</span>
          </div>
          <div className="font-mono text-3xl font-extrabold text-white">
            {kpis.avgCo2} <span className="text-accent text-sm">g/km</span>
          </div>
          <div className="text-zinc-500 font-mono text-xs mt-1">
            Objetivo CAFE UE: 93,6 g/km WLTP (Diferencia: +{(kpis.avgCo2 - 93.6).toFixed(1)} g)
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center space-x-2 text-zinc-400 mb-2 font-mono text-xs">
            <FileCheck className="w-4 h-4 text-cyan-400" />
            <span>NORMATIVA PREDOMINANTE //</span>
          </div>
          <div className="font-mono text-2xl font-extrabold text-white truncate">
            {kpis.topEuroNorm.norm}
          </div>
          <div className="text-zinc-500 font-mono text-xs mt-1">
            {kpis.topEuroNorm.pct}% de los registros cumplen la última revisión
          </div>
        </div>
      </div>

      {/* Main Row: CO2 Histogram & IEDMT Brackets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CO2 Histogram */}
        <div className="bg-card border border-border rounded-lg p-5">
          <div className="pb-3 mb-4 border-b border-zinc-900">
            <span className="font-mono text-[10px] text-accent uppercase tracking-widest">// HISTOGRAM // 06</span>
            <h3 className="font-sans font-bold text-base text-white">
              Histograma de Emisiones de CO₂ (g/km)
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Distribución por tramos de emisiones de dióxido de carbono en ciclo WLTP.
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={co2Histogram} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1A1A22" vertical={false} />
                <XAxis 
                  dataKey="range" 
                  stroke="#52525B" 
                  tick={{ fontSize: 9, fontFamily: 'monospace' }} 
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis stroke="#52525B" tick={{ fontSize: 11, fontFamily: 'monospace' }} />
                <Tooltip content={<TelemetryTooltip titlePrefix="EMISIONES" />} />
                <Bar dataKey="count" name="Vehículos" fill="#FF5500" radius={[4, 4, 0, 0]}>
                  {co2Histogram.map((entry, index) => (
                    <Cell 
                      key={`co2-bar-${index}`} 
                      fill={index <= 3 ? '#00E599' : index <= 5 ? '#FF9E00' : '#FF2A00'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* IEDMT Tax Brackets Breakdown */}
        <div className="bg-card border border-border rounded-lg p-5">
          <div className="pb-3 mb-4 border-b border-zinc-900">
            <span className="font-mono text-[10px] text-accent uppercase tracking-widest">// TAX // 06</span>
            <h3 className="font-sans font-bold text-base text-white">
              Tramos del Impuesto de Matriculación (IEDMT)
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Gravamen según Ley 38/1992 de Impuestos Especiales en España.
            </p>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={iedmtBrackets}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="count"
                >
                  {iedmtBrackets.map((entry, index) => (
                    <Cell key={`tax-cell-${index}`} fill={taxColors[index % taxColors.length]} stroke="#050505" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip content={<TelemetryTooltip titlePrefix="TRAMO IEDMT" />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Cards for each tax bracket */}
          <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-zinc-900 font-mono text-xs">
            {iedmtBrackets.map((item, idx) => (
              <div key={item.range} className="bg-black/50 p-2.5 rounded border border-zinc-800">
                <div className="flex items-center justify-between">
                  <span className="flex items-center space-x-1.5 font-bold text-white">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: taxColors[idx] }} />
                    <span className="text-[11px]">{item.range}</span>
                  </span>
                  <span className="text-accent font-bold">{item.taxRate}</span>
                </div>
                <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
                  <span>{item.count.toLocaleString('es-ES')} regs</span>
                  <span className="text-zinc-300 font-bold">{item.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Euro Emissions Compliance Table */}
      <div className="bg-card border border-border rounded-lg p-5">
        <div className="pb-3 mb-4 border-b border-zinc-900">
          <span className="font-mono text-[10px] text-accent uppercase tracking-widest">// EURO // 06</span>
          <h3 className="font-sans font-bold text-base text-white">
            Distribución por Normativa Europea Anticontaminación
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Cumplimiento de estándares Euro 6e, Euro 6e-bis (RDE fase 2) y precedentes.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
          {euroStandards.slice(0, 8).map((euro) => (
            <div key={euro.norm} className="p-3 bg-black/40 rounded border border-zinc-800 hover:border-accent/40 transition-colors">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">{euro.norm}</span>
                <span className="text-accent font-bold">{euro.percentage}%</span>
              </div>
              <div className="w-full h-1 bg-zinc-900 rounded-full mt-2 overflow-hidden border border-zinc-800">
                <div className="h-full bg-accent rounded-full" style={{ width: `${Math.min(100, euro.percentage * 2)}%` }} />
              </div>
              <div className="text-[10px] text-zinc-500 mt-1.5">
                {euro.count.toLocaleString('es-ES')} vehículos homologados
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
