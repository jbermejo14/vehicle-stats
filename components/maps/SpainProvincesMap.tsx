'use client';

import React, { useState, useMemo } from 'react';
import { SPAIN_PROVINCES, ProvinceMeta } from '@/lib/spainProvinces';
import { ProvinceStat } from '@/lib/dgtTypes';
import { useData } from '@/context/DataContext';
import { Layers, Flame, Users, Info, RotateCcw } from 'lucide-react';

interface SpainProvincesMapProps {
  provinceStats: ProvinceStat[];
}

export function SpainProvincesMap({ provinceStats }: SpainProvincesMapProps) {
  const { filters, setFilter } = useData();
  const [metricMode, setMetricMode] = useState<'total' | 'rate'>('total');
  const [hoveredCode, setHoveredCode] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  // Map province code to its stats
  const statsMap = useMemo(() => {
    const map = new Map<string, ProvinceStat>();
    for (const stat of provinceStats) {
      map.set(stat.code, stat);
    }
    return map;
  }, [provinceStats]);

  // Total registrations represented across all provinces
  const totalMapRegistrations = useMemo(() => {
    return provinceStats.reduce((sum, s) => sum + s.totalRegistrations, 0);
  }, [provinceStats]);

  // Compute min/max for color scale
  const { maxTotal, maxRate } = useMemo(() => {
    let maxT = 1;
    let maxR = 0.1;
    for (const stat of provinceStats) {
      if (stat.totalRegistrations > maxT) maxT = stat.totalRegistrations;
      if (stat.ratePer1000 > maxR) maxR = stat.ratePer1000;
    }
    return { maxTotal: maxT, maxRate: maxR };
  }, [provinceStats]);

  // Color interpolation from dark charcoal (#13131A) to orange (#FF5500)
  const getProvinceColor = (code: string) => {
    const stat = statsMap.get(code);
    if (!stat || stat.totalRegistrations === 0) return '#13131A';

    const ratio = metricMode === 'total' 
      ? Math.min(1, Math.max(0.08, stat.totalRegistrations / maxTotal))
      : Math.min(1, Math.max(0.08, stat.ratePer1000 / maxRate));

    // Non-linear sqrt scaling for enhanced visual contrast
    const scaledRatio = Math.sqrt(ratio);

    // Interpolate:
    // r: 19 -> 255
    // g: 19 -> 85
    // b: 26 -> 0
    const r = Math.round(19 + (255 - 19) * scaledRatio);
    const g = Math.round(19 + (85 - 19) * scaledRatio);
    const b = Math.round(26 + (0 - 26) * scaledRatio);

    return `rgb(${r}, ${g}, ${b})`;
  };

  const hoveredStat = hoveredCode ? statsMap.get(hoveredCode) : null;
  const hoveredMeta = hoveredCode ? SPAIN_PROVINCES[hoveredCode] : null;

  return (
    <div className="relative w-full bg-card border border-border rounded-lg p-5 overflow-hidden">
      {/* HUD Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 pb-3 border-b border-zinc-900">
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-mono text-[10px] text-accent uppercase tracking-widest">// GEO // 02</span>
            <h3 className="font-sans font-bold text-base text-white tracking-wide">
              Mapa Coroplético de Densidad Provincial
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] bg-accent/15 text-accent border border-accent/30 font-mono font-bold">
              {totalMapRegistrations.toLocaleString('es-ES')} REGS TOTALES
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Geometría oficial IGN (52 provincias). Escala térmica de matriculaciones y motorización per cápita (INE).
          </p>
        </div>

        {/* Metric Mode Toggle */}
        <div className="flex items-center space-x-2">
          <div className="flex bg-black/60 p-1 rounded border border-zinc-800 text-xs font-mono">
            <button
              onClick={() => setMetricMode('total')}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded transition-colors ${
                metricMode === 'total' ? 'bg-accent text-black font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Total Registros</span>
            </button>
            <button
              onClick={() => setMetricMode('rate')}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded transition-colors ${
                metricMode === 'rate' ? 'bg-accent text-black font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Tasa / 1k Hab.</span>
            </button>
          </div>

          {filters.provincia !== 'todas' && (
            <button
              onClick={() => setFilter('provincia', 'todas')}
              className="flex items-center space-x-1 px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 rounded font-mono text-xs transition-colors"
              title="Restablecer filtro provincial"
            >
              <RotateCcw className="w-3 h-3 text-accent" />
              <span>Ver Todo</span>
            </button>
          )}
        </div>
      </div>

      {/* SVG Map Container */}
      <div className="relative w-full aspect-[4/3] max-h-[560px] flex items-center justify-center bg-[#07070A] rounded-lg border border-zinc-900 overflow-hidden">
        {/* Subtle Radar Background Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#1f1f26_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

        <svg
          viewBox="0 0 800 600"
          className="w-full h-full select-none"
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setTooltipPos({
              x: e.clientX - rect.left,
              y: e.clientY - rect.top,
            });
          }}
          onMouseLeave={() => {
            setHoveredCode(null);
            setTooltipPos(null);
          }}
        >
          {/* Subtle Canary Islands Inset Border */}
          <rect
            x="15"
            y="420"
            width="230"
            height="160"
            fill="none"
            stroke="#27272A"
            strokeDasharray="3 3"
            strokeWidth="1"
            rx="6"
          />
          <text x="25" y="438" fill="#71717A" fontSize="9" fontFamily="monospace" letterSpacing="1">
            CANARIAS (INSET)
          </text>

          {/* Render all provinces */}
          {Object.entries(SPAIN_PROVINCES).map(([code, meta]) => {
            const isSelected = filters.provincia === code;
            const isHovered = hoveredCode === code;
            const fillColor = getProvinceColor(code);

            return (
              <g key={code}>
                <path
                  d={meta.path}
                  fill={fillColor}
                  stroke={isSelected ? '#FF5500' : isHovered ? '#FFFFFF' : '#272732'}
                  strokeWidth={isSelected ? 2.5 : isHovered ? 2 : 0.8}
                  className="cursor-pointer transition-colors duration-150"
                  style={{
                    filter: isSelected ? 'drop-shadow(0 0 10px rgba(255, 85, 0, 0.8))' : isHovered ? 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.5))' : 'none',
                  }}
                  onMouseEnter={() => setHoveredCode(code)}
                  onClick={() => {
                    if (filters.provincia === code) {
                      setFilter('provincia', 'todas');
                    } else {
                      setFilter('provincia', code);
                    }
                  }}
                />
                {/* Short Name Marker for high-volume provinces */}
                {(meta.population > 1000000 || code === '28' || code === '08' || code === '46' || code === '41' || code === '29' || code === '50') && (
                  <text
                    x={meta.center[0]}
                    y={meta.center[1]}
                    fill="#FFFFFF"
                    stroke="#000000"
                    strokeWidth="2.5"
                    style={{ paintOrder: 'stroke fill' }}
                    fontSize="9"
                    fontWeight="bold"
                    fontFamily="monospace"
                    textAnchor="middle"
                    pointerEvents="none"
                  >
                    {meta.shortName}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Dynamic Floating Tooltip */}
        {hoveredCode && hoveredStat && hoveredMeta && tooltipPos && (
          <div
            className="absolute pointer-events-none z-30 bg-[#0A0A0E]/95 border border-accent/80 rounded p-3 shadow-[0_0_20px_rgba(255,85,0,0.3)] font-mono text-xs min-w-[220px]"
            style={{
              left: `${Math.min(tooltipPos.x + 15, 540)}px`,
              top: `${Math.min(tooltipPos.y - 40, 380)}px`,
            }}
          >
            <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-zinc-800">
              <span className="font-bold text-white uppercase">{hoveredMeta.name}</span>
              <span className="text-[10px] text-zinc-500 uppercase">{hoveredMeta.community}</span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-zinc-400">Total Matriculados:</span>
                <span className="text-accent font-bold">
                  {hoveredStat.totalRegistrations.toLocaleString('es-ES')} regs
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Cuota sobre España:</span>
                <span className="text-amber-400 font-bold">
                  {totalMapRegistrations > 0 ? ((hoveredStat.totalRegistrations / totalMapRegistrations) * 100).toFixed(1) : 0}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Tasa / 1.000 hab:</span>
                <span className="text-white font-bold">{hoveredStat.ratePer1000}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Población (INE):</span>
                <span className="text-zinc-300">
                  {hoveredMeta.population.toLocaleString('es-ES')} hab.
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">% Electrificados (ECO/0):</span>
                <span className="text-emerald-400 font-bold">{hoveredStat.electrifiedPct}%</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-zinc-900">
                <span className="text-zinc-500">Marca Líder:</span>
                <span className="text-white font-bold">{hoveredStat.topBrand}</span>
              </div>
            </div>

            <div className="mt-2 text-[9px] text-accent/80 uppercase tracking-widest text-right">
              Click para filtrar provincia
            </div>
          </div>
        )}

        {/* Heatmap Legend */}
        <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur border border-zinc-800 rounded p-2.5 font-mono text-[10px] text-zinc-400 flex flex-col space-y-1.5">
          <div className="flex items-center justify-between text-zinc-300 text-[11px] font-bold">
            <span>Escala Térmica DGT</span>
            <span className="text-accent">{metricMode === 'total' ? 'Registros' : 'Tasa 1k'}</span>
          </div>
          <div className="w-36 h-2 rounded-full bg-gradient-to-r from-[#13131A] via-[#883300] to-[#FF5500] border border-zinc-700" />
          <div className="flex justify-between text-[9px] text-zinc-500">
            <span>Mín (0)</span>
            <span>Máx ({metricMode === 'total' ? maxTotal.toLocaleString('es-ES') : maxRate.toFixed(2)})</span>
          </div>
        </div>
      </div>
    </div>
  );
}
