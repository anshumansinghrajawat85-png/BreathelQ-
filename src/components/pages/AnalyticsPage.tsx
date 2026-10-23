import React, { useState, useEffect } from 'react';
import { ObservationRecord } from '../../types';
import { fetchAnalytics } from '../../services/api';
import {
  BarChart3,
  Calendar,
  Download,
  Filter,
  Layers,
  TrendingUp,
  Clock,
  ArrowUpDown,
  PieChart,
} from 'lucide-react';

interface AnalyticsPageProps {
  city: string;
  observations: ObservationRecord[];
  theme?: 'dark' | 'light';
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ city, observations, theme = 'dark' }) => {
  const isLight = theme === 'light';
  const [diurnalCurve, setDiurnalCurve] = useState<Array<{ hour: string; avgAQI: number; avgPM25: number; avgPM10: number; pmRatio: number }>>([]);
  const [seasonalData, setSeasonalData] = useState<any[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<'AQI' | 'PM2.5' | 'PM10'>('AQI');

  useEffect(() => {
    fetchAnalytics(city).then((data) => {
      if (data) {
        if (data.diurnalCurve) setDiurnalCurve(data.diurnalCurve);
        if (data.seasonalSummary) setSeasonalData(data.seasonalSummary);
      }
    });
  }, [city]);

  // CSV Export utility
  const handleExportCSV = () => {
    if (!observations || observations.length === 0) return;
    const headers = ['Timestamp', 'City', 'Station', 'AQI', 'Category', 'PM2.5', 'PM10', 'NO2', 'SO2', 'CO', 'Temperature', 'Humidity', 'Source', 'Quality'];
    const rows = observations.map((o) => [
      o.timestamp,
      o.cityName,
      o.stationName,
      o.aqi,
      o.aqiCategory,
      o.pollutants.pm25,
      o.pollutants.pm10,
      o.pollutants.no2 || '',
      o.pollutants.so2 || '',
      o.pollutants.co || '',
      o.weather.temperature,
      o.weather.humidity,
      o.source,
      o.quality,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `AirPredict_Analytics_${city}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const maxDiurnalAQI = Math.max(100, ...diurnalCurve.map((d) => d.avgAQI));

  return (
    <div className="space-y-6">
      {/* Header with Export CTA */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 ${
        isLight ? 'border-slate-200' : 'border-slate-800'
      }`}>
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-cyan-500 uppercase">
            <BarChart3 className="w-4 h-4" />
            <span>HISTORICAL STATISTICAL CORRELATION ENGINE</span>
          </div>
          <h2 className={`text-xl md:text-2xl font-bold mt-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Atmospheric Analytics & Diurnal Cycles — {city}
          </h2>
          <p className={`text-xs mt-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            Investigating cyclical emission peaks, seasonal meteorological drivers, and aerosol ratio signatures.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className={`flex items-center gap-2 px-4 py-2 border rounded-xl text-xs font-medium transition-colors shadow-sm cursor-pointer self-start sm:self-auto ${
            isLight
              ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-800'
              : 'bg-[#111C2E] hover:bg-slate-800 border-slate-700/80 text-slate-200 hover:text-white'
          }`}
        >
          <Download className="w-4 h-4 text-cyan-500" />
          <span>Export Analytics CSV</span>
        </button>
      </div>

      {/* Diurnal 24-Hour Cycle Card (Traffic vs Nocturnal Inversion) */}
      <div className={`p-5 rounded-2xl border shadow-xl space-y-4 ${
        isLight ? 'bg-white border-slate-200 shadow-slate-200/50' : 'bg-[#111C2E] border-slate-800'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className={`text-sm font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              <Clock className="w-4 h-4 text-cyan-500" />
              <span>Diurnal 24-Hour Pollution Cycle (Traffic & Boundary Layer Physics)</span>
            </h3>
            <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              Hourly aggregated profile revealing twin traffic rush hour peaks and midnight radiation entrapment.
            </p>
          </div>

          <div className={`flex items-center gap-1 p-1 rounded-lg text-xs border ${
            isLight ? 'bg-slate-100 border-slate-300' : 'bg-slate-900 border-slate-800'
          }`}>
            {(['AQI', 'PM2.5', 'PM10'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setSelectedMetric(m)}
                className={`px-2.5 py-1 rounded font-medium cursor-pointer transition-colors ${
                  selectedMetric === m
                    ? isLight
                      ? 'bg-white text-cyan-800 shadow-sm font-bold'
                      : 'bg-cyan-500/20 text-cyan-300 font-bold'
                    : isLight
                    ? 'text-slate-600 hover:text-slate-900'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Diurnal Bar Chart */}
        <div className="w-full overflow-x-auto pt-4">
          <div className={`min-w-[650px] flex items-end justify-between gap-2 h-44 border-b pb-2 ${
            isLight ? 'border-slate-200' : 'border-slate-800'
          }`}>
            {diurnalCurve.map((d, idx) => {
              const val = selectedMetric === 'AQI' ? d.avgAQI : selectedMetric === 'PM2.5' ? d.avgPM25 : d.avgPM10;
              const maxVal = selectedMetric === 'AQI' ? maxDiurnalAQI : selectedMetric === 'PM2.5' ? 120 : 200;
              const barHeightPct = Math.min(100, Math.max(10, (val / maxVal) * 100));

              // Highlight rush hours (8-10 AM, 19-21 PM)
              const hourNum = parseInt(d.hour.split(':')[0]);
              const isRushHour = (hourNum >= 8 && hourNum <= 10) || (hourNum >= 19 && hourNum <= 21);

              return (
                <div key={d.hour} className="flex-1 flex flex-col items-center gap-1 group">
                  <div className={`text-[9px] font-mono-nums opacity-0 group-hover:opacity-100 transition-opacity ${
                    isLight ? 'text-slate-700' : 'text-slate-400'
                  }`}>
                    {val}
                  </div>
                  <div className={`w-full rounded-t h-32 flex items-end justify-center p-0.5 ${
                    isLight ? 'bg-slate-100' : 'bg-slate-900'
                  }`}>
                    <div
                      className={`w-full rounded-t transition-all duration-300 ${
                        isRushHour ? 'bg-amber-500 group-hover:bg-amber-400' : 'bg-cyan-500 group-hover:bg-cyan-400'
                      }`}
                      style={{ height: `${barHeightPct}%` }}
                    />
                  </div>
                  <span className={`text-[10px] font-mono-nums ${
                    isLight ? 'text-slate-500 group-hover:text-slate-900' : 'text-slate-500 group-hover:text-slate-300'
                  }`}>
                    {idx % 3 === 0 ? d.hour.split(':')[0] : ''}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className={`flex flex-wrap items-center justify-between text-[11px] pt-1 ${
          isLight ? 'text-slate-600' : 'text-slate-400'
        }`}>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-amber-500 rounded" /> Rush Hour Peaks (08:00–10:00 & 19:00–21:00)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-cyan-500 rounded" /> Regular Diurnal Hours
            </span>
          </div>
          <span>Diurnal Stagnation Factor: 1.34x baseline</span>
        </div>
      </div>

      {/* Multi-City Comparison & PM2.5/PM10 Ratio Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* City Comparison */}
        <div className={`p-5 rounded-2xl border space-y-4 ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#111C2E] border-slate-800'
        }`}>
          <div className="flex items-center justify-between">
            <h3 className={`text-sm font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              <ArrowUpDown className="w-4 h-4 text-cyan-500" />
              <span>Cross-City Regional Pollution Benchmarking</span>
            </h3>
            <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Current Ambient AQI</span>
          </div>

          <div className="space-y-3">
            {[
              { name: 'Delhi (NCR)', aqi: 284, category: 'Poor', pm25: 148, pm10: 260, color: '#F97316' },
              { name: 'Kolkata', aqi: 192, category: 'Moderate', pm25: 92, pm10: 165, color: '#EAB308' },
              { name: 'Bhopal (Demo)', aqi: 168, category: 'Moderate', pm25: 78, pm10: 142, color: '#EAB308' },
              { name: 'Hyderabad', aqi: 135, category: 'Moderate', pm25: 52, pm10: 104, color: '#EAB308' },
              { name: 'Mumbai', aqi: 122, category: 'Moderate', pm25: 46, pm10: 98, color: '#EAB308' },
              { name: 'Pune', aqi: 114, category: 'Moderate', pm25: 42, pm10: 88, color: '#EAB308' },
              { name: 'Chennai', aqi: 88, category: 'Satisfactory', pm25: 31, pm10: 66, color: '#84CC16' },
              { name: 'Bengaluru', aqi: 74, category: 'Satisfactory', pm25: 24, pm10: 58, color: '#84CC16' },
            ].map((c) => (
              <div key={c.name} className="space-y-1">
                <div className={`flex justify-between text-xs ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  <span className="font-semibold">{c.name}</span>
                  <div className="flex items-center gap-2 font-mono-nums">
                    <span className="font-bold" style={{ color: c.color }}>{c.aqi} AQI</span>
                    <span className={`text-[10px] ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>({c.category})</span>
                  </div>
                </div>
                <div className={`w-full h-2 rounded-full overflow-hidden ${isLight ? 'bg-slate-100' : 'bg-slate-900'}`}>
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${(c.aqi / 350) * 100}%`, backgroundColor: c.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Aerosol Source Fingerprint (PM2.5 to PM10 Ratio) */}
        <div className={`p-5 rounded-2xl border space-y-4 ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#111C2E] border-slate-800'
        }`}>
          <div>
            <h3 className={`text-sm font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              <PieChart className="w-4 h-4 text-teal-500" />
              <span>Aerosol Source Fingerprint (PM2.5 / PM10 Ratio)</span>
            </h3>
            <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              Differentiates fine combustion smoke from coarse mechanical dust.
            </p>
          </div>

          <div className={`p-4 rounded-xl border flex items-center justify-between ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}>
            <div>
              <div className={`text-[10px] uppercase font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Current Ratio (Bhopal)</div>
              <div className={`text-3xl font-bold font-mono-nums mt-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>0.55</div>
              <div className="text-xs text-teal-600 font-semibold mt-1">Mixed Vehicular & Resuspension Mode</div>
            </div>
            <div className={`text-right text-[11px] max-w-[160px] leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              Ratio {'>'} 0.60 indicates dominant combustion; {'<'} 0.40 indicates crustal dust resuspension.
            </div>
          </div>

          <div className={`space-y-2.5 text-xs ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
            <div className={`p-2.5 rounded-lg border flex justify-between items-center ${
              isLight ? 'bg-white border-slate-200' : 'bg-[#0F172A] border-slate-800'
            }`}>
              <div>
                <strong className={`block text-[11px] ${isLight ? 'text-slate-900' : 'text-white'}`}>Vehicular Exhaust & Crop Smoke</strong>
                <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>High fine particle fraction (PM2.5 dominant)</span>
              </div>
              <span className="font-mono-nums font-bold text-cyan-600">0.65 — 0.85</span>
            </div>
            <div className={`p-2.5 rounded-lg border flex justify-between items-center ${
              isLight ? 'bg-white border-slate-200' : 'bg-[#0F172A] border-slate-800'
            }`}>
              <div>
                <strong className={`block text-[11px] ${isLight ? 'text-slate-900' : 'text-white'}`}>Industrial Processing & Fly Ash</strong>
                <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Intermediate aerosol distribution</span>
              </div>
              <span className="font-mono-nums font-bold text-amber-600">0.45 — 0.60</span>
            </div>
            <div className={`p-2.5 rounded-lg border flex justify-between items-center ${
              isLight ? 'bg-white border-slate-200' : 'bg-[#0F172A] border-slate-800'
            }`}>
              <div>
                <strong className={`block text-[11px] ${isLight ? 'text-slate-900' : 'text-white'}`}>Road Dust, Construction & Soil Sand</strong>
                <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Coarse mechanical abrasion (PM10 dominant)</span>
              </div>
              <span className="font-mono-nums font-bold text-teal-600">0.25 — 0.40</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
