'use client';

import React from 'react';
import { EtiquetaDgt } from '@/lib/dgtTypes';
import { PHEV_UNDETERMINED_BADGE } from '@/lib/dgtBadge';

interface BadgePillProps {
  badge: EtiquetaDgt | string;
  size?: 'sm' | 'md' | 'lg';
}

export function BadgePill({ badge, size = 'md' }: BadgePillProps) {
  const normalized = (badge || '').toUpperCase();

  let bgClass = 'bg-zinc-800 text-zinc-300 border-zinc-700';
  let glowClass = '';
  let label = badge;

  if (normalized === PHEV_UNDETERMINED_BADGE.toUpperCase()) {
    bgClass = 'bg-cyan-950/80 text-cyan-400 border-cyan-500/50';
    label = 'PHEV: CERO O ECO';
  } else if (normalized.includes('CERO') || normalized.includes('0') || normalized === '0 CERO') {
    bgClass = 'bg-sky-950/80 text-sky-400 border-sky-500/50';
    glowClass = 'shadow-[0_0_12px_rgba(56,189,248,0.25)]';
    label = '0 CERO';
  } else if (normalized.includes('ECO')) {
    bgClass = 'bg-emerald-950/80 text-emerald-400 border-emerald-500/50';
    glowClass = 'shadow-[0_0_12px_rgba(52,211,153,0.25)]';
    label = 'ECO';
  } else if (normalized === 'C') {
    bgClass = 'bg-green-950/80 text-green-400 border-green-600/50';
    label = 'ETIQ. C';
  } else if (normalized === 'B') {
    bgClass = 'bg-amber-950/80 text-amber-400 border-amber-600/50';
    label = 'ETIQ. B';
  } else {
    bgClass = 'bg-zinc-900 text-zinc-500 border-zinc-700';
    label = 'SIN ETIQ.';
  }

  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5 tracking-wider',
    md: 'text-xs px-2.5 py-1 tracking-wider',
    lg: 'text-sm px-3.5 py-1.5 font-bold tracking-widest'
  };

  return (
    <span
      className={`inline-flex items-center font-mono font-semibold uppercase rounded border transition-all duration-300 ${sizeClasses[size]} ${bgClass} ${glowClass}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current animate-pulse opacity-80" />
      {label}
    </span>
  );
}
