'use client';

import React, { useMemo } from 'react';
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
  ScatterChart, 
  Scatter, 
  ZAxis 
} from 'recharts';
import { Gauge, Cpu, Weight, Activity, Zap } from 'lucide-react';

export function EngineeringView() {
  const { powerBrackets, displacementBrackets, filteredRecords, kpis } = useData();

  // Tara vs kW Scatter Sample (sample 150 points for snappy rendering)
  const scatterData = useMemo(() => {
    return filteredRecords
      .filter(r => r.tara > 0 && r.potenciaKw > 0)
      .slice(0, 150)
      .map(r => ({
        kw: r.potenciaKw,
        cv: r.potenciaCv,
        tara: r.tara,
        marca: r.marca,
        modelo: r.modelo,
        fullName: `${r.marca} ${r.modelo}`,
        fuel: r.propulsion
      }));
  }, [filteredRecords]);

  return (
    <div className="space-y-6">
      {/* Top 3 Metric HUD Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center space-x-2 text-zinc-400 mb-2 font-mono text-xs">
            <Gauge className="w-4 h-4 text-accent" />
            <span>POTENCIA MEDIA //</span>
          </div>
          <div className="font-mono text-3xl font-extrabold text-white">
            {kpis.avgKw} <span className="text-accent text-sm">kW</span>
          </div>
          <div className="text-zinc-500 font-mono text-xs mt-1">
            Equivalente a {kpis.avgCv} CV homologados
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center space-x-2 text-zinc-400 mb-2 font-mono text-xs">
            <Weight className="w-4 h-4 text-cyan-400" />
            <span>TARA HOMOLOGADA //</span>
          </div>
          <div className="font-mono text-3xl font-extrabold text-white">
            {kpis.avgTara.toLocaleString('es-ES')} <span className="text-cyan-400 text-sm">kg</span>
          </div>
          <div className="text-zinc-500 font-mono text-xs mt-1">
            Masa en orden de marcha media del parque
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center space-x-2 text-zinc-400 mb-2 font-mono text-xs">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>RELACIÓN PESO / POTENCIA //</span>
          </div>
          <div className="font-mono text-3xl font-extrabold text-white">
            {kpis.avgKw > 0 ? (kpis.avgTara / kpis.avgKw).toFixed(1) : 0} <span className="text-emerald-400 text-sm">kg/kW</span>
          </div>
          <div className="text-zinc-500 font-mono text-xs mt-1">
            Aprox. {kpis.avgCv > 0 ? (kpis.avgTara / kpis.avgCv).toFixed(1) : 0} kg/CV de eficiencia dinámica
          </div>
        </div>
      </div>

      {/* Grid: Power Brackets vs Displacement Brackets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Power Brackets Bar Chart */}
        <div className="bg-card border border-border rounded-lg p-5">
          <div className="pb-3 mb-4 border-b border-zinc-900">
            <span className="font-mono text-[10px] text-accent uppercase tracking-widest">// POWER // 05</span>
            <h3 className="font-sans font-bold text-base text-white">
              Distribución por Tramos de Potencia Neta (kW)
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Segmentación de vehículos por rango de potencia máxima motriz.
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={powerBrackets} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
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
                <Tooltip content={<TelemetryTooltip titlePrefix="TRAMO POTENCIA" />} />
                <Bar dataKey="count" name="Vehículos" fill="#FF5500" radius={[4, 4, 0, 0]}>
                  {powerBrackets.map((entry, index) => (
                    <Cell 
                      key={`power-bar-${index}`} 
                      fill={index >= 3 ? '#FF5500' : '#FF9E00'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Displacement Brackets */}
        <div className="bg-card border border-border rounded-lg p-5">
          <div className="pb-3 mb-4 border-b border-zinc-900">
            <span className="font-mono text-[10px] text-accent uppercase tracking-widest">// ENGINE // 05</span>
            <h3 className="font-sans font-bold text-base text-white">
              Distribución por Cilindrada de Motor (cc)
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Cilindrada unitaria de motores térmicos y exención de vehículos eléctricos puros.
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={displacementBrackets} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
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
                <Tooltip content={<TelemetryTooltip titlePrefix="CILINDRADA" />} />
                <Bar dataKey="count" name="Vehículos" fill="#00E5FF" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Relación Peso / Potencia (Scatter Chart: Tara vs Potencia kW) */}
      <div className="bg-card border border-border rounded-lg p-5">
        <div className="pb-3 mb-4 border-b border-zinc-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="font-mono text-[10px] text-accent uppercase tracking-widest">// TELEMETRY SCATTER // 05</span>
            <h3 className="font-sans font-bold text-base text-white">
              Diagrama de Dispersión: Tara Homologada (kg) vs Potencia Neta (kW)
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Análisis cinemático de masa del vehículo frente al rendimiento térmico y eléctrico.
            </p>
          </div>
          <div className="flex items-center space-x-3 text-xs font-mono">
            <span className="flex items-center space-x-1.5 text-accent">
              <span className="w-2 h-2 rounded-full bg-accent" />
              <span>Muestra 150 Unidades</span>
            </span>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1A1A22" />
              <XAxis 
                type="number" 
                dataKey="kw" 
                name="Potencia" 
                unit=" kW" 
                stroke="#52525B" 
                tick={{ fontSize: 11, fontFamily: 'monospace' }}
                label={{ value: 'Potencia Neta (kW)', position: 'insideBottom', offset: -10, fill: '#71717A', fontSize: 11, fontFamily: 'monospace' }}
              />
              <YAxis 
                type="number" 
                dataKey="tara" 
                name="Tara" 
                unit=" kg" 
                stroke="#52525B" 
                tick={{ fontSize: 11, fontFamily: 'monospace' }}
                label={{ value: 'Tara (kg)', angle: -90, position: 'insideLeft', offset: 0, fill: '#71717A', fontSize: 11, fontFamily: 'monospace' }}
              />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }} 
                content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) return null;
                  const data = payload[0].payload;
                  return (
                    <div className="bg-[#0A0A0E] border border-accent rounded p-3 font-mono text-xs shadow-glow">
                      <div className="font-bold text-white mb-1">{data.fullName}</div>
                      <div className="text-zinc-400">{data.fuel}</div>
                      <div className="mt-1 text-accent font-bold">
                        {data.kw} kW ({data.cv} CV) // {data.tara} kg
                      </div>
                      <div className="text-[10px] text-zinc-500 mt-1">
                        Ratio: {(data.tara / data.kw).toFixed(1)} kg/kW
                      </div>
                    </div>
                  );
                }}
              />
              <Scatter name="Vehículos" data={scatterData} fill="#FF5500" opacity={0.7} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
