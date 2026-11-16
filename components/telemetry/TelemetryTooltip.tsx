'use client';

import React from 'react';

interface TooltipPayloadItem {
  name: string;
  value: number | string;
  color?: string;
  dataKey?: string;
  unit?: string;
  payload?: any;
}

interface TelemetryTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
  titlePrefix?: string;
  valueFormatter?: (val: any) => string;
  formatter?: (value: any, name: any, item: any) => [string, string] | string;
}

export function TelemetryTooltip({
  active,
  payload,
  label,
  titlePrefix = 'DGT // METRIC',
  valueFormatter,
  formatter
}: TelemetryTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  return (
    <div className="bg-[#0A0A0E]/95 backdrop-blur-md border border-[#FF5500]/60 rounded p-3 shadow-[0_0_20px_rgba(255,85,0,0.25)] font-mono text-xs min-w-[180px] z-50">
      {/* Tooltip Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800">
        <span className="text-[10px] uppercase text-zinc-500 tracking-wider">
          {titlePrefix}
        </span>
        <span className="font-bold text-[#FF5500] tracking-wide">{label}</span>
      </div>

      {/* Tooltip Payload Items */}
      <div className="space-y-1.5">
        {payload.map((item, idx) => {
          let displayLabel = item.name;
          let displayValue = typeof item.value === 'number' ? item.value.toLocaleString('es-ES') : item.value;

          if (formatter) {
            const result = formatter(item.value, item.name, item);
            if (Array.isArray(result)) {
              displayValue = result[0];
              displayLabel = result[1];
            } else if (typeof result === 'string') {
              displayValue = result;
            }
          } else if (valueFormatter) {
            displayValue = valueFormatter(item.value);
          }

          return (
            <div key={`tp-${idx}`} className="flex items-center justify-between gap-4">
              <span className="text-zinc-400">{displayLabel}:</span>
              <span className="font-bold text-white">{displayValue}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
