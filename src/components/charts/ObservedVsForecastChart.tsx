import React, { useState } from 'react';
import { ObservationRecord, ForecastPoint } from '../../types';
import { getAQIColor, getAQICategory } from '../../utils/aqiUtils';

interface ObservedVsForecastChartProps {
  observed: ObservationRecord[];
  forecast: ForecastPoint[];
  height?: number;
  theme?: 'dark' | 'light';
}

export const ObservedVsForecastChart: React.FC<ObservedVsForecastChartProps> = ({
  observed,
  forecast,
  height = 300,
  theme = 'dark',
}) => {
  const isLight = theme === 'light';
  const [hoveredData, setHoveredData] = useState<{
    type: 'Observed' | 'Predicted';
    timestamp: string;
    aqi: number;
    lower?: number;
    upper?: number;
  } | null>(null);

  // Take the last 12 observed hours and first 18 forecasted hours
  const pastObs = [...observed].reverse().slice(-12);
  const futurePoints = forecast.slice(0, 18);

  if (pastObs.length === 0 && futurePoints.length === 0) {
    return <div className="h-64 flex items-center justify-center text-slate-500 text-xs">No chart data</div>;
  }

  const allAQIs = [
    ...pastObs.map((o) => o.aqi),
    ...futurePoints.map((f) => f.predictedAQI),
    ...futurePoints.map((f) => f.upperConfidence),
  ];

  const maxVal = Math.max(280, ...allAQIs) * 1.1;
  const minVal = 0;

  const totalPoints = pastObs.length + futurePoints.length;
  const width = 900;
  const paddingX = 50;
  const paddingY = 35;
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  const getX = (globalIdx: number) => paddingX + (globalIdx / (totalPoints - 1 || 1)) * chartWidth;
  const getY = (val: number) => height - paddingY - ((val - minVal) / (maxVal - minVal)) * chartHeight;

  // Split index between observed and forecast
  const splitIndex = pastObs.length - 1;
  const splitX = getX(splitIndex);

  // 1. Observed path (solid line)
  const obsPath = pastObs.reduce((acc, p, idx) => {
    const x = getX(idx);
    const y = getY(p.aqi);
    return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  // 2. Forecast path (dashed line starting from the last observed point)
  const lastObs = pastObs[pastObs.length - 1];
  let forecastPath = `M ${splitX} ${getY(lastObs?.aqi || futurePoints[0]?.predictedAQI || 100)}`;
  futurePoints.forEach((f, idx) => {
    const x = getX(pastObs.length + idx);
    const y = getY(f.predictedAQI);
    forecastPath += ` L ${x} ${y}`;
  });

  // 3. Confidence interval shaded area (upper line forward, lower line backward)
  let upperPath = `M ${splitX} ${getY(lastObs?.aqi || 100)}`;
  futurePoints.forEach((f, idx) => {
    const x = getX(pastObs.length + idx);
    const y = getY(f.upperConfidence);
    upperPath += ` L ${x} ${y}`;
  });

  let lowerPath = '';
  for (let idx = futurePoints.length - 1; idx >= 0; idx--) {
    const f = futurePoints[idx];
    const x = getX(pastObs.length + idx);
    const y = getY(f.lowerConfidence);
    lowerPath += ` L ${x} ${y}`;
  }
  const confidenceAreaD = `${upperPath} ${lowerPath} L ${splitX} ${getY(lastObs?.aqi || 100)} Z`;

  return (
    <div className="relative w-full">
      {/* Top Legend Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-2 text-xs">
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-1 bg-cyan-500 rounded-full inline-block" />
            <span className={`${isLight ? 'text-slate-700' : 'text-slate-300'} font-medium`}>Historical Observations (Actual)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-0.5 border-t-2 border-dashed border-teal-500 inline-block" />
            <span className={`${isLight ? 'text-slate-700' : 'text-slate-300'} font-medium`}>ML Forecast Model (Random Forest)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-teal-500/20 border border-teal-500/40 rounded inline-block" />
            <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>90% Confidence Spread</span>
          </div>
        </div>
        <div className={`text-[11px] font-mono-nums ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
          Chronological horizon: 12h past + 18h future
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto select-none"
          style={{ minWidth: '650px' }}
        >
          <defs>
            <linearGradient id="confidenceGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2DD4BF" stopOpacity={isLight ? '0.35' : '0.25'} />
              <stop offset="100%" stopColor="#2DD4BF" stopOpacity={isLight ? '0.08' : '0.05'} />
            </linearGradient>
            <linearGradient id="obsAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06B6D4" stopOpacity={isLight ? '0.25' : '0.2'} />
              <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Reference guidelines */}
          {[50, 100, 200, 300].map((t) => {
            if (t > maxVal) return null;
            const y = getY(t);
            return (
              <g key={t}>
                <line x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke={isLight ? '#E2E8F0' : '#1E293B'} strokeDasharray="3 3" />
                <text x={paddingX - 8} y={y + 3} textAnchor="end" className={`text-[10px] ${isLight ? 'fill-slate-500' : 'fill-slate-400'} font-mono-nums`}>
                  {t}
                </text>
              </g>
            );
          })}

          {/* Observed Area Fill */}
          <path
            d={`${obsPath} L ${splitX} ${height - paddingY} L ${getX(0)} ${height - paddingY} Z`}
            fill="url(#obsAreaGrad)"
          />

          {/* Confidence interval envelope */}
          <path d={confidenceAreaD} fill="url(#confidenceGrad)" />

          {/* Vertical Separator Line: "Current Time / Model Cutoff" */}
          <line
            x1={splitX}
            y1={paddingY}
            x2={splitX}
            y2={height - paddingY}
            stroke="#F59E0B"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
          <text
            x={splitX}
            y={paddingY - 10}
            textAnchor="middle"
            className="text-[10px] font-semibold fill-amber-500 font-mono-nums"
          >
            NOW (TRANSITION TO PREDICTION)
          </text>

          {/* Observed Path (Solid Cyan) */}
          <path d={obsPath} fill="none" stroke="#0891B2" strokeWidth="2.5" strokeLinecap="round" />

          {/* Forecast Path (Dashed Teal) */}
          <path
            d={forecastPath}
            fill="none"
            stroke="#0D9488"
            strokeWidth="2.5"
            strokeDasharray="5 4"
            strokeLinecap="round"
          />

          {/* Observed Points */}
          {pastObs.map((p, idx) => {
            const x = getX(idx);
            const y = getY(p.aqi);
            return (
              <g
                key={`obs-${p.id}`}
                onMouseEnter={() =>
                  setHoveredData({
                    type: 'Observed',
                    timestamp: p.timestamp,
                    aqi: p.aqi,
                  })
                }
                onMouseLeave={() => setHoveredData(null)}
              >
                <circle cx={x} cy={y} r="3.5" fill="#06B6D4" stroke={isLight ? '#FFFFFF' : '#0B1220'} strokeWidth="2" className="cursor-pointer" />
                <circle cx={x} cy={y} r="14" fill="transparent" className="cursor-pointer" />
              </g>
            );
          })}

          {/* Forecast Points */}
          {futurePoints.map((f, idx) => {
            const globalIdx = pastObs.length + idx;
            const x = getX(globalIdx);
            const y = getY(f.predictedAQI);
            return (
              <g
                key={`fc-${f.targetTimestamp}`}
                onMouseEnter={() =>
                  setHoveredData({
                    type: 'Predicted',
                    timestamp: f.targetTimestamp,
                    aqi: f.predictedAQI,
                    lower: f.lowerConfidence,
                    upper: f.upperConfidence,
                  })
                }
                onMouseLeave={() => setHoveredData(null)}
              >
                <circle cx={x} cy={y} r="4" fill="#0D9488" stroke={isLight ? '#FFFFFF' : '#0B1220'} strokeWidth="2" className="cursor-pointer" />
                <circle cx={x} cy={y} r="14" fill="transparent" className="cursor-pointer" />
              </g>
            );
          })}

          {/* X-Axis timeline labels */}
          {pastObs.map((p, idx) => {
            if (idx % 3 !== 0) return null;
            const x = getX(idx);
            const label = new Date(p.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            return (
              <text key={`obs-x-${idx}`} x={x} y={height - 10} textAnchor="middle" className={`text-[10px] ${isLight ? 'fill-slate-500' : 'fill-slate-400'} font-mono-nums`}>
                {label}
              </text>
            );
          })}

          {futurePoints.map((f, idx) => {
            if (idx % 3 !== 0 && idx !== futurePoints.length - 1) return null;
            const x = getX(pastObs.length + idx);
            const label = `+${idx + 1}h`;
            return (
              <text key={`fc-x-${idx}`} x={x} y={height - 10} textAnchor="middle" className={`text-[10px] ${isLight ? 'fill-teal-700 font-semibold' : 'fill-teal-400'} font-mono-nums`}>
                {label}
              </text>
            );
          })}
        </svg>
      </div>

      {/* Hover Info Tooltip */}
      {hoveredData && (
        <div className={`absolute top-12 right-6 p-3 rounded-lg text-xs z-20 pointer-events-none ${
          isLight
            ? 'bg-white border border-slate-200 shadow-xl text-slate-800'
            : 'bg-[#111C2E] border border-slate-700 shadow-2xl text-white'
        }`}>
          <div className="flex items-center gap-1.5 font-semibold text-[11px] mb-1">
            <span
              className={`w-2 h-2 rounded-full ${
                hoveredData.type === 'Observed' ? 'bg-cyan-500' : 'bg-teal-500'
              }`}
            />
            <span className={hoveredData.type === 'Observed' ? (isLight ? 'text-cyan-700' : 'text-cyan-300') : (isLight ? 'text-teal-700' : 'text-teal-300')}>
              {hoveredData.type === 'Observed' ? 'Actual Measurement' : 'Random Forest Forecast'}
            </span>
          </div>
          <div className={`${isLight ? 'text-slate-900' : 'text-white'} font-mono-nums font-bold text-sm`}>
            {hoveredData.aqi} AQI ({getAQICategory(hoveredData.aqi)})
          </div>
          {hoveredData.lower && hoveredData.upper && (
            <div className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'} font-mono-nums mt-0.5`}>
              90% CI: [{hoveredData.lower} — {hoveredData.upper}]
            </div>
          )}
          <div className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'} mt-1`}>
            {new Date(hoveredData.timestamp).toLocaleString([], {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        </div>
      )}
    </div>
  );
};
