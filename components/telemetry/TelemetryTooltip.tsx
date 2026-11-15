'use client';

import React from 'react';

interface TooltipPayloadItem {
  name: string;
  value: number | string;
  color?: string;
  dataKey?: string;
  unit?: string;
}

interface TelemetryTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
  titlePrefix?: string;
  valueFormatter?: (val: any) => string;
}

export function TelemetryTooltip({
  active,
  payload,
  label,
  titlePrefix = 'TIMESTAMP',
  valueFormatter,
}: TelemetryTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  return (
    <div className="bg-[#0A0A0E]/95 backdrop-blur-md border border-accent/60 rounded p-3 shadow-[0_0_20px_rgba(255,85,0,0.25)] font-mono text-xs min-w-[180px] z-50">
      {/* Tooltip Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800">
        <span className="text-[10px] uppercase text-zinc-500 tracking-wider">
          {titlePrefix} //
        </span>
        <span className="font-bold text-accent tracking-wide">{label}</span>
      </div>

      {/* Tooltip Payload Items */}
      <div className="space-y-1.5">
        {payload.map((item, idx) => {
          const formattedVal = valueFormatter
            ? valueFormatter(item.value)
            : typeof item.value === 'number'
            ? item.value.toLocaleString('es-ES')
            : item.value;

          return (
            <div key={`item-${idx}`} className="flex items-center justify-between space-x-4">
              <div className="flex items-center space-x-1.5">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: item.color || '#FF5500' }}
                />
                <span className="text-zinc-400 capitalize text-[11px] truncate max-w-[120px]">
                  {item.name}
                </span>
              </div>
              <span className="font-bold text-white tracking-wider">
                {formattedVal} {item.unit || ''}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-2 pt-1.5 border-t border-zinc-900 flex items-center justify-between text-[9px] text-zinc-500 uppercase tracking-widest">
        <span>DGT // PULSE</span>
        <span>HUD TELEMETRY</span>
      </div>
    </div>
  );
}
