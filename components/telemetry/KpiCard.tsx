'use client';

import React, { useEffect, useState } from 'react';
import { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  index?: string;
  title: string;
  value: number | string;
  unit?: string;
  subtext?: string;
  icon?: LucideIcon;
  badge?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  accentColor?: 'orange' | 'green' | 'cyan' | 'amber';
  progress?: number; // 0 to 100
}

export function KpiCard({
  index = '01',
  title,
  value,
  unit,
  subtext,
  icon: Icon,
  badge,
  trend,
  accentColor = 'orange',
  progress,
}: KpiCardProps) {
  const [displayValue, setDisplayValue] = useState<string | number>(value);

  // Micro-animation on value changes
  useEffect(() => {
    if (typeof value === 'number') {
      const start = 0;
      const end = value;
      const duration = 800;
      const startTime = performance.now();

      const updateCounter = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progressRate = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progressRate, 3);
        const current = start + (end - start) * easeOut;

        if (Number.isInteger(end)) {
          setDisplayValue(Math.round(current).toLocaleString('es-ES'));
        } else {
          setDisplayValue(current.toFixed(1));
        }

        if (progressRate < 1) {
          requestAnimationFrame(updateCounter);
        } else {
          setDisplayValue(Number.isInteger(end) ? end.toLocaleString('es-ES') : end.toFixed(1));
        }
      };

      requestAnimationFrame(updateCounter);
    } else {
      setDisplayValue(value);
    }
  }, [value]);

  const colorStyles = {
    orange: {
      border: 'hover:border-accent/80',
      glow: 'hover:shadow-[0_0_25px_rgba(255,85,0,0.2)]',
      text: 'text-accent',
      bar: 'bg-accent',
      bracket: 'border-accent/40',
      iconBg: 'bg-accent/10 text-accent border-accent/30',
    },
    green: {
      border: 'hover:border-emerald-500/80',
      glow: 'hover:shadow-[0_0_25px_rgba(16,185,129,0.2)]',
      text: 'text-emerald-400',
      bar: 'bg-emerald-400',
      bracket: 'border-emerald-500/40',
      iconBg: 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30',
    },
    cyan: {
      border: 'hover:border-cyan-500/80',
      glow: 'hover:shadow-[0_0_25px_rgba(6,182,212,0.2)]',
      text: 'text-cyan-400',
      bar: 'bg-cyan-400',
      bracket: 'border-cyan-500/40',
      iconBg: 'bg-cyan-950/40 text-cyan-400 border-cyan-500/30',
    },
    amber: {
      border: 'hover:border-amber-500/80',
      glow: 'hover:shadow-[0_0_25px_rgba(245,158,11,0.2)]',
      text: 'text-amber-400',
      bar: 'bg-amber-400',
      bracket: 'border-amber-500/40',
      iconBg: 'bg-amber-950/40 text-amber-400 border-amber-500/30',
    },
  };

  const style = colorStyles[accentColor];

  return (
    <div
      className={`relative bg-card/90 backdrop-blur border border-border rounded-lg p-5 transition-all duration-300 group overflow-hidden ${style.border} ${style.glow}`}
    >
      {/* HUD Corner Tech Brackets */}
      <div className={`absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 ${style.bracket}`} />
      <div className={`absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 ${style.bracket}`} />
      <div className={`absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 ${style.bracket}`} />
      <div className={`absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 ${style.bracket}`} />

      {/* Background Micro Scanline */}
      <div className="absolute inset-0 bg-[radial-gradient(#1f1f26_1px,transparent_1px)] [background-size:12px_12px] opacity-40 pointer-events-none" />

      {/* Header Info */}
      <div className="relative flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">
            // {index}
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
            {title}
          </span>
        </div>

        {Icon && (
          <div className={`w-8 h-8 rounded flex items-center justify-center border ${style.iconBg}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      {/* Main Metric Display */}
      <div className="relative flex items-baseline space-x-2 my-2">
        <span className="font-mono text-3xl lg:text-4xl font-extrabold tracking-tight text-white group-hover:text-zinc-100 transition-colors">
          {displayValue}
        </span>
        {unit && (
          <span className={`font-mono text-sm font-semibold tracking-wider ${style.text}`}>
            {unit}
          </span>
        )}
      </div>

      {/* Progress Bar / Sparkline */}
      {progress !== undefined && (
        <div className="relative w-full h-1 bg-zinc-900 rounded-full my-3 overflow-hidden border border-zinc-800">
          <div
            className={`h-full transition-all duration-700 ease-out ${style.bar}`}
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      )}

      {/* Footer / Submetrics */}
      <div className="relative flex items-center justify-between pt-2 border-t border-zinc-900 text-xs text-zinc-400">
        <div className="flex items-center space-x-1.5 truncate">
          {badge && (
            <span className="px-1.5 py-0.5 rounded font-mono text-[10px] font-bold bg-zinc-800 text-zinc-300 border border-zinc-700">
              {badge}
            </span>
          )}
          {subtext && <span className="font-mono text-[11px] truncate text-zinc-400">{subtext}</span>}
        </div>

        {trend && (
          <div
            className={`font-mono text-[11px] font-bold flex items-center ${
              trend.isPositive ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            <span>{trend.value}</span>
          </div>
        )}
      </div>
    </div>
  );
}
