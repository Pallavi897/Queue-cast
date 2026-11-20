import React, { useState } from 'react';
import { QueueLevel } from '../types/queuecast';

export interface BarChartDatum {
  label: string;
  value: number;
  level: QueueLevel;
  sublabel?: string;
}

interface BarChartProps {
  data: BarChartDatum[];
  height?: number;
  unit?: string;
  emptyMessage?: string;
}

const LEVEL_COLORS: Record<QueueLevel, string> = {
  Low: '#4CAF7A',
  Medium: '#E5A100',
  High: '#C0392B',
};

export const BarChart: React.FC<BarChartProps> = ({
  data,
  height = 200,
  unit = 'min',
  emptyMessage = 'No queue records available for this selection yet.',
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const hasAnyValue = data.some((d) => d.value > 0);
  const maxVal = Math.max(20, ...data.map((d) => d.value));
  // Round ceiling up to nearest 5 for clean axis ticks
  const axisMax = Math.ceil(maxVal / 5) * 5;

  if (data.length === 0 || !hasAnyValue) {
    return (
      <div
        className="flex items-center justify-center rounded-xl border border-dashed border-neutral-200 bg-neutral-50/70 px-4 text-center text-sm text-neutral-500"
        style={{ height }}
      >
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="w-full select-none">
      {/* Legend */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 text-xs text-neutral-500">
        <span>Average wait ({unit})</span>
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#4CAF7A]" />
            Low
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#E5A100]" />
            Medium
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#C0392B]" />
            High
          </span>
        </div>
      </div>

      {/* Chart Area */}
      <div className="relative flex" style={{ height }}>
        {/* Y-Axis ticks */}
        <div className="flex flex-col justify-between pr-2.5 pb-6 text-[11px] font-mono tabular-nums text-neutral-400 text-right w-9 shrink-0">
          <span>{axisMax}</span>
          <span>{Math.round(axisMax / 2)}</span>
          <span>0</span>
        </div>

        {/* Bars & Grid */}
        <div className="relative flex-1 flex flex-col">
          <div className="relative flex-1 border-b border-neutral-200">
            {/* Horizontal guidelines */}
            <div className="absolute inset-x-0 top-0 border-t border-dashed border-neutral-200/80" />
            <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-neutral-200/80" />

            {/* Bars grid */}
            <div className="relative z-10 h-full flex items-end gap-1.5 sm:gap-2.5 px-1">
              {data.map((item, idx) => {
                const pct =
                  axisMax > 0 ? Math.max(item.value > 0 ? 6 : 0, (item.value / axisMax) * 100) : 0;
                const barColor = LEVEL_COLORS[item.level];
                const isHovered = hoveredIdx === idx;

                return (
                  <div
                    key={item.label}
                    className="relative flex-1 h-full flex flex-col justify-end items-center group"
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                    onClick={() => setHoveredIdx(isHovered ? null : idx)}
                  >
                    {/* Value label above bar */}
                    <span
                      className={`mb-1 text-[11px] font-mono tabular-nums font-semibold transition-opacity ${
                        isHovered ? 'text-[#333333] opacity-100' : 'text-neutral-500 opacity-85'
                      }`}
                    >
                      {item.value > 0 ? `${item.value}m` : '—'}
                    </span>

                    {/* Tooltip on hover */}
                    {isHovered && (
                      <div className="absolute -top-9 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap rounded-lg bg-[#333333] px-2.5 py-1 text-[11px] text-white shadow-md pointer-events-none">
                        <span className="font-semibold">{item.label}:</span>{' '}
                        <span className="font-mono tabular-nums">{item.value} {unit}</span>
                        {item.sublabel ? ` (${item.sublabel})` : ''}
                      </div>
                    )}

                    {/* Bar */}
                    <div
                      className="w-full max-w-[38px] rounded-t-lg transition-all duration-200 cursor-pointer"
                      style={{
                        height: `${pct}%`,
                        backgroundColor: barColor,
                        opacity: hoveredIdx !== null && !isHovered ? 0.65 : 1,
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* X-Axis Labels */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 px-1 pt-2">
            {data.map((item) => (
              <div
                key={item.label}
                className="flex-1 text-center text-[11px] font-medium text-neutral-500 truncate"
              >
                {item.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
