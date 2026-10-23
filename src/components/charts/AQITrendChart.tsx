import React, { useState } from 'react';
import { ObservationRecord } from '../../types';
import { getAQIColor, getAQICategory } from '../../utils/aqiUtils';

interface AQITrendChartProps {
  data: ObservationRecord[];
  height?: number;
  theme?: 'dark' | 'light';
}

export const AQITrendChart: React.FC<AQITrendChartProps> = ({
  data,
  height = 260,
  theme = 'dark',
}) => {
  const isLight = theme === 'light';
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-500 text-xs">
        No observation records available for selected window.
      </div>
    );
  }

  // Reverse so chronological left to right
  const points = [...data].reverse().slice(-24); // Last 24 hours
  const maxAQI = Math.max(300, ...points.map((p) => p.aqi * 1.15));
  const minAQI = 0;

  const width = 800;
  const paddingX = 40;
  const paddingY = 30;
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  const getX = (index: number) => paddingX + (index / (points.length - 1 || 1)) * chartWidth;
  const getY = (val: number) => height - paddingY - ((val - minAQI) / (maxAQI - minAQI)) * chartHeight;

  // Build SVG path
  const pathD = points.reduce((acc, point, idx) => {
    const x = getX(idx);
    const y = getY(point.aqi);
    return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  // Fill area under curve
  const fillD = `${pathD} L ${getX(points.length - 1)} ${height - paddingY} L ${getX(0)} ${height - paddingY} Z`;

  const hoveredPoint = hoveredIndex !== null ? points[hoveredIndex] : null;

  return (
    <div className="relative w-full">
      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto select-none"
          style={{ minWidth: '550px' }}
        >
          <defs>
            <linearGradient id="aqiFillGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#22D3EE" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* CPCB Threshold Reference Guidelines */}
          {[50, 100, 200, 300].map((threshold) => {
            if (threshold > maxAQI) return null;
            const y = getY(threshold);
            return (
              <g key={threshold}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke={isLight ? '#E2E8F0' : '#334155'}
                  strokeDasharray="3 3"
                  strokeWidth="1"
                  strokeOpacity={isLight ? '0.9' : '0.6'}
                />
                <text
                  x={paddingX - 6}
                  y={y + 3}
                  textAnchor="end"
                  className={`text-[10px] ${isLight ? 'fill-slate-500' : 'fill-slate-400'} font-mono-nums`}
                >
                  {threshold}
                </text>
              </g>
            );
          })}

          {/* Area Fill */}
          <path d={fillD} fill="url(#aqiFillGrad)" />

          {/* Polyline Path */}
          <path
            d={pathD}
            fill="none"
            stroke="#06B6D4"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points */}
          {points.map((p, idx) => {
            const x = getX(idx);
            const y = getY(p.aqi);
            const color = getAQIColor(p.aqi);
            const isHovered = hoveredIndex === idx;

            return (
              <g key={p.id} onMouseEnter={() => setHoveredIndex(idx)} onMouseLeave={() => setHoveredIndex(null)}>
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered ? 6 : 3.5}
                  fill={color}
                  stroke={isLight ? '#FFFFFF' : '#0B1220'}
                  strokeWidth="2"
                  className="cursor-pointer transition-all duration-150"
                />
                {/* Hit area */}
                <circle cx={x} cy={y} r="14" fill="transparent" className="cursor-pointer" />
              </g>
            );
          })}

          {/* X-Axis time markers */}
          {points.map((p, idx) => {
            if (idx % 3 !== 0 && idx !== points.length - 1) return null;
            const x = getX(idx);
            const timeStr = new Date(p.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            return (
              <text
                key={`time-${idx}`}
                x={x}
                y={height - 8}
                textAnchor="middle"
                className={`text-[10px] ${isLight ? 'fill-slate-500 font-medium' : 'fill-slate-400'} font-mono-nums`}
              >
                {timeStr}
              </text>
            );
          })}
        </svg>
      </div>

      {/* Hover Information Tooltip */}
      {hoveredPoint && hoveredIndex !== null && (
        <div
          className={`absolute z-20 pointer-events-none p-2.5 rounded-lg text-xs -translate-x-1/2 -translate-y-full ${
            isLight
              ? 'bg-white border border-slate-200 shadow-xl text-slate-800'
              : 'bg-[#111C2E] border border-slate-700 shadow-2xl text-white'
          }`}
          style={{
            left: `${(hoveredIndex / (points.length - 1)) * 90 + 5}%`,
            top: '40px',
          }}
        >
          <div className={`${isLight ? 'text-slate-500' : 'text-slate-400'} font-mono-nums text-[10px]`}>
            {new Date(hoveredPoint.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', weekday: 'short' })}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'} text-sm font-mono-nums`}>{hoveredPoint.aqi} AQI</span>
            <span
              className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
              style={{
                backgroundColor: `${getAQIColor(hoveredPoint.aqi)}22`,
                color: getAQIColor(hoveredPoint.aqi),
              }}
            >
              {getAQICategory(hoveredPoint.aqi)}
            </span>
          </div>
          <div className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-300'} mt-1`}>
            PM2.5: <span className={`font-mono-nums font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>{hoveredPoint.pollutants.pm25} µg/m³</span>
          </div>
          <div className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Dominant: {hoveredPoint.dominantPollutant}
          </div>
        </div>
      )}
    </div>
  );
};
