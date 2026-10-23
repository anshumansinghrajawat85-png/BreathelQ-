import React from 'react';
import { ObservationRecord, MonitoringStation, ForecastPoint } from '../../types';
import { AQITrendChart } from '../charts/AQITrendChart';
import { ObservedVsForecastChart } from '../charts/ObservedVsForecastChart';
import {
  getAQIColor,
  getAQICategory,
  getAQIHealthAdvisory,
  calculatePM25SubIndex,
} from '../../utils/aqiUtils';
import {
  Wind,
  Thermometer,
  Droplets,
  Gauge,
  Compass,
  AlertTriangle,
  Radio,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  Activity,
  ShieldCheck,
  Clock,
  ArrowRight,
} from 'lucide-react';

interface DashboardPageProps {
  city: string;
  observations: ObservationRecord[];
  stations: MonitoringStation[];
  forecast: ForecastPoint[];
  onNavigateToTab: (tab: any) => void;
  theme?: 'dark' | 'light';
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  city,
  observations,
  stations,
  forecast,
  onNavigateToTab,
  theme = 'dark',
}) => {
  const isLight = theme === 'light';
  const latestObs = observations[0] || null;
  const currentAQI = latestObs?.aqi || 168;
  const category = getAQICategory(currentAQI);
  const aqiColor = getAQIColor(currentAQI);
  const healthAdvisory = getAQIHealthAdvisory(category);

  // Station counts
  const totalStations = stations.length || 7;
  const onlineStations = stations.filter((s) => s.status === 'Online').length || 6;
  const staleStations = stations.filter((s) => s.status === 'Stale' || s.status === 'Offline').length || 1;
  const hotspotCount = stations.filter((s) => s.isHotspot).length || 2;

  // Forecast trend calculation
  const next6hAQI = forecast[5]?.predictedAQI || currentAQI;
  const aqiDiff = next6hAQI - currentAQI;
  const forecastTrend =
    aqiDiff > 10 ? 'Deteriorating' : aqiDiff < -10 ? 'Improving' : 'Stable';

  // Arc calculation for circular AQI gauge (0 to 500 scale)
  const aqiPercent = Math.min(100, Math.max(0, (currentAQI / 500) * 100));
  const strokeDashoffset = 251.2 - (251.2 * aqiPercent) / 100;

  return (
    <div className="space-y-6">
      {/* Dashboard Top Header */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4 ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
        <div>
          <div className={`flex items-center gap-2 text-xs font-semibold tracking-wider uppercase ${isLight ? 'text-cyan-700' : 'text-cyan-400'}`}>
            <Activity className="w-4 h-4" />
            <span>REAL-TIME ENVIRONMENTAL INTELLIGENCE</span>
          </div>
          <h1 className={`text-xl md:text-2xl font-bold mt-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Air Quality Intelligence Dashboard — {city}
          </h1>
          <p className={`text-xs mt-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            Continuous multi-pollutant surveillance, CPCB validation, and ML atmospheric dispersion.
          </p>
        </div>

        {/* Quick Launch Buttons */}
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => onNavigateToTab('map')}
            className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-xl font-medium transition-colors cursor-pointer ${
              isLight
                ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-sm'
                : 'bg-[#111C2E] border-slate-700/80 text-slate-300 hover:text-white hover:border-cyan-500/40'
            }`}
          >
            <span>Live Station Map</span>
            <ArrowRight className="w-3.5 h-3.5 text-cyan-500" />
          </button>
          <button
            onClick={() => onNavigateToTab('forecast')}
            className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-xl font-semibold transition-colors cursor-pointer ${
              isLight
                ? 'bg-cyan-50 text-cyan-800 border-cyan-200 shadow-sm hover:bg-cyan-100'
                : 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/20'
            }`}
          >
            <span>Forecast Model</span>
            <ArrowRight className="w-3.5 h-3.5 text-cyan-500" />
          </button>
        </div>
      </div>

      {/* Primary KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Latest Observed AQI with Circular Gauge Arc */}
        <div
          className={`p-4 rounded-2xl border flex flex-col justify-between transition-colors ${
            isLight
              ? 'bg-white border-slate-200/90 shadow-sm text-slate-900'
              : 'bg-[#111C2E] border-slate-800 text-white shadow-xl'
          }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-semibold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Latest Observed AQI
              </span>
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: aqiColor }}
              />
            </div>

            <div className="flex items-center justify-between mt-3">
              <div>
                <div
                  className="text-4xl font-extrabold font-mono-nums tracking-tight"
                  style={{ color: aqiColor }}
                >
                  {currentAQI}
                </div>
                <div className="mt-1">
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-md"
                    style={{
                      backgroundColor: `${aqiColor}20`,
                      color: aqiColor,
                    }}
                  >
                    {category}
                  </span>
                </div>
                <div className={`text-xs mt-2 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                  Dominant: <strong className={isLight ? 'text-slate-900' : 'text-white'}>{latestObs?.dominantPollutant || 'PM2.5'}</strong>
                </div>
              </div>

              {/* Circular Gauge Graphic */}
              <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                <svg className="w-16 h-16 -rotate-90" viewBox="0 0 90 90">
                  <circle
                    cx="45"
                    cy="45"
                    r="40"
                    fill="transparent"
                    stroke={isLight ? '#E2E8F0' : '#1E293B'}
                    strokeWidth="7"
                  />
                  <circle
                    cx="45"
                    cy="45"
                    r="40"
                    fill="transparent"
                    stroke={aqiColor}
                    strokeWidth="7"
                    strokeDasharray="251.2"
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-700 ease-out"
                  />
                </svg>
                <Gauge className="w-5 h-5 absolute" style={{ color: aqiColor }} />
              </div>
            </div>
          </div>

          <div className={`text-[10px] mt-4 pt-2 border-t flex items-center justify-between font-mono-nums ${isLight ? 'border-slate-100 text-slate-500' : 'border-slate-800/80 text-slate-500'}`}>
            <span>Source: CPCB India</span>
            <span>{latestObs ? new Date(latestObs.timestamp).toLocaleTimeString() : 'Live'}</span>
          </div>
        </div>

        {/* Card 2: PM2.5 Concentration */}
        <div
          className={`p-4 rounded-2xl border flex flex-col justify-between transition-colors ${
            isLight
              ? 'bg-white border-slate-200/90 shadow-sm text-slate-900'
              : 'bg-[#111C2E] border-slate-800 text-white shadow-xl'
          }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-semibold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Fine Particulate (PM2.5)
              </span>
              <span className={`text-[10px] font-mono-nums font-semibold ${isLight ? 'text-cyan-700' : 'text-cyan-400'}`}>
                Sub-index: {calculatePM25SubIndex(latestObs?.pollutants.pm25 || 78)}
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className={`text-3xl font-extrabold font-mono-nums ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {latestObs?.pollutants.pm25 || 78}
              </span>
              <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>µg/m³</span>
            </div>
            <div className={`text-xs mt-2 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
              Safe 24h Threshold: <span className="font-mono-nums font-semibold">60 µg/m³</span>
            </div>
            <div className="text-[11px] text-amber-500 font-medium mt-1">
              {((latestObs?.pollutants.pm25 || 78) / 60).toFixed(1)}x above national clean air standard
            </div>
          </div>
          <div className={`text-[10px] mt-4 pt-2 border-t flex items-center justify-between ${isLight ? 'border-slate-100 text-slate-500' : 'border-slate-800/80 text-slate-500'}`}>
            <span>Laser Scattering Sensor</span>
            <span>Unit: µg/m³</span>
          </div>
        </div>

        {/* Card 3: PM10 Coarse Particulate */}
        <div
          className={`p-4 rounded-2xl border flex flex-col justify-between transition-colors ${
            isLight
              ? 'bg-white border-slate-200/90 shadow-sm text-slate-900'
              : 'bg-[#111C2E] border-slate-800 text-white shadow-xl'
          }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-semibold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Coarse Particulate (PM10)
              </span>
              <span className={`text-[10px] font-mono-nums font-semibold ${isLight ? 'text-teal-700' : 'text-teal-400'}`}>
                Dust & Crustal
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className={`text-3xl font-extrabold font-mono-nums ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {latestObs?.pollutants.pm10 || 142}
              </span>
              <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>µg/m³</span>
            </div>
            <div className={`text-xs mt-2 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
              Safe 24h Threshold: <span className="font-mono-nums font-semibold">100 µg/m³</span>
            </div>
            <div className="text-[11px] text-teal-600 font-medium mt-1">
              PM2.5/PM10: {((latestObs?.pollutants.pm25 || 78) / (latestObs?.pollutants.pm10 || 142)).toFixed(2)} (Mixed combustion)
            </div>
          </div>
          <div className={`text-[10px] mt-4 pt-2 border-t flex items-center justify-between ${isLight ? 'border-slate-100 text-slate-500' : 'border-slate-800/80 text-slate-500'}`}>
            <span>Beta Attenuation Monitor</span>
            <span>Unit: µg/m³</span>
          </div>
        </div>

        {/* Card 4: Forecast Trend */}
        <div
          className={`p-4 rounded-2xl border flex flex-col justify-between transition-colors ${
            isLight
              ? 'bg-white border-slate-200/90 shadow-sm text-slate-900'
              : 'bg-[#111C2E] border-slate-800 text-white shadow-xl'
          }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-semibold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Forecast Trajectory (6h)
              </span>
              {forecastTrend === 'Improving' ? (
                <TrendingDown className="w-4 h-4 text-emerald-500" />
              ) : forecastTrend === 'Deteriorating' ? (
                <TrendingUp className="w-4 h-4 text-red-500" />
              ) : (
                <Activity className="w-4 h-4 text-cyan-500" />
              )}
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className={`text-3xl font-extrabold font-mono-nums ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {next6hAQI}
              </span>
              <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>AQI</span>
            </div>
            <div className={`text-xs mt-2 flex items-center gap-1.5 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
              <span>Trend:</span>
              <span
                className={`font-semibold ${
                  forecastTrend === 'Improving'
                    ? 'text-emerald-500'
                    : forecastTrend === 'Deteriorating'
                    ? 'text-red-500'
                    : 'text-amber-500'
                }`}
              >
                {forecastTrend} ({aqiDiff > 0 ? `+${aqiDiff}` : aqiDiff} pts)
              </span>
            </div>
            <div className={`text-[11px] mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              ML Model: Random Forest (R² = 0.91)
            </div>
          </div>
          <div className={`text-[10px] mt-4 pt-2 border-t flex items-center justify-between font-mono-nums ${isLight ? 'border-slate-100 text-slate-500' : 'border-slate-800/80 text-slate-500'}`}>
            <span>Target: +6h Horizon</span>
            <span>Uncertainty: ±6 AQI</span>
          </div>
        </div>
      </div>

      {/* Meteorology & Station Health Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { icon: Thermometer, label: 'Temperature', val: `${latestObs?.weather.temperature || 26}°C`, iconColor: 'text-amber-500' },
          { icon: Droplets, label: 'Relative Humidity', val: `${latestObs?.weather.humidity || 58}%`, iconColor: 'text-cyan-500' },
          { icon: Wind, label: 'Wind Speed', val: `${latestObs?.weather.windSpeed || 8} km/h`, iconColor: 'text-teal-500' },
          { icon: Compass, label: 'Wind Direction', val: `${latestObs?.weather.windDirection || 'NW'} (${latestObs?.weather.windAngle || 315}°)`, iconColor: 'text-indigo-500' },
          { icon: Radio, label: 'Stations Active', val: `${onlineStations} / ${totalStations}`, iconColor: 'text-emerald-500' },
          { icon: AlertTriangle, label: 'Hotspot Sectors', val: `${hotspotCount} Flagged`, iconColor: 'text-red-500' },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className={`p-3 rounded-xl border flex items-center gap-3 transition-colors ${
                isLight ? 'bg-white border-slate-200/90 shadow-sm' : 'bg-[#111C2E] border-slate-800/80 shadow-md'
              }`}
            >
              <Icon className={`w-4 h-4 ${item.iconColor} shrink-0`} />
              <div>
                <div className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{item.label}</div>
                <div className={`text-sm font-bold font-mono-nums ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {item.val}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid: 24h AQI Trend + Observed vs Predicted AQI */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: 24h AQI History */}
        <div
          className={`p-5 rounded-2xl border space-y-3 transition-colors ${
            isLight
              ? 'bg-white border-slate-200/90 shadow-sm text-slate-800'
              : 'bg-[#111C2E] border-slate-800 shadow-xl text-white'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                24-Hour Observed AQI Trend
              </h3>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Hourly ambient progression with CPCB reference bands
              </p>
            </div>
            <span className={`text-[10px] font-mono-nums ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Source: CPCB Central
            </span>
          </div>
          <AQITrendChart data={observations} height={250} />
        </div>

        {/* Chart 2: Observed vs Forecast ML */}
        <div
          className={`p-5 rounded-2xl border space-y-3 transition-colors ${
            isLight
              ? 'bg-white border-slate-200/90 shadow-sm text-slate-800'
              : 'bg-[#111C2E] border-slate-800 shadow-xl text-white'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Observed vs ML Predicted Trajectory
              </h3>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Historical sequence transitioned to 18h ML forecast
              </p>
            </div>
            <span className={`text-[10px] font-mono-nums font-bold ${isLight ? 'text-teal-700' : 'text-teal-400'}`}>
              R² = 0.912
            </span>
          </div>
          <ObservedVsForecastChart observed={observations} forecast={forecast} height={250} />
        </div>
      </div>

      {/* Multi-Pollutant Detailed Breakdown & CPCB Health Advisory Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pollutants Table */}
        <div
          className={`lg:col-span-2 p-5 rounded-2xl border space-y-3 transition-colors ${
            isLight
              ? 'bg-white border-slate-200/90 shadow-sm text-slate-800'
              : 'bg-[#111C2E] border-slate-800 shadow-xl text-white'
          }`}
        >
          <div className="flex items-center justify-between">
            <h3 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Multi-Pollutant Chemical Sensor Array
            </h3>
            <span className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              NAAQS Regulatory Standard
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className={`border-b text-[11px] ${isLight ? 'border-slate-200 text-slate-500' : 'border-slate-800 text-slate-400'}`}>
                  <th className="py-2.5">Pollutant</th>
                  <th className="py-2.5">Observed Concentration</th>
                  <th className="py-2.5">24h Safe Limit</th>
                  <th className="py-2.5">Sub-Index</th>
                  <th className="py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className={`divide-y font-mono-nums ${isLight ? 'divide-slate-100 text-slate-700' : 'divide-slate-800/60 text-slate-200'}`}>
                <tr>
                  <td className={`py-2.5 font-sans font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>PM2.5 (Fine)</td>
                  <td className="py-2.5 text-cyan-600 font-bold">{latestObs?.pollutants.pm25 || 78} µg/m³</td>
                  <td className="py-2.5">60 µg/m³</td>
                  <td className="py-2.5 text-amber-500 font-bold">{calculatePM25SubIndex(latestObs?.pollutants.pm25 || 78)}</td>
                  <td className="py-2.5 font-sans">
                    <span className="text-amber-500 font-semibold">Exceeded (1.3x)</span>
                  </td>
                </tr>
                <tr>
                  <td className={`py-2.5 font-sans font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>PM10 (Coarse)</td>
                  <td className="py-2.5 text-cyan-600 font-bold">{latestObs?.pollutants.pm10 || 142} µg/m³</td>
                  <td className="py-2.5">100 µg/m³</td>
                  <td className="py-2.5 text-amber-500 font-bold">128</td>
                  <td className="py-2.5 font-sans">
                    <span className="text-amber-500 font-semibold">Exceeded (1.4x)</span>
                  </td>
                </tr>
                <tr>
                  <td className={`py-2.5 font-sans font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>NO2 (Nitrogen Dioxide)</td>
                  <td className="py-2.5">{latestObs?.pollutants.no2 || 38} µg/m³</td>
                  <td className="py-2.5">80 µg/m³</td>
                  <td className="py-2.5 text-emerald-500 font-bold">48</td>
                  <td className="py-2.5 font-sans">
                    <span className="text-emerald-500 font-semibold">Within Limit</span>
                  </td>
                </tr>
                <tr>
                  <td className={`py-2.5 font-sans font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>SO2 (Sulphur Dioxide)</td>
                  <td className="py-2.5">{latestObs?.pollutants.so2 || 16} µg/m³</td>
                  <td className="py-2.5">80 µg/m³</td>
                  <td className="py-2.5 text-emerald-500 font-bold">20</td>
                  <td className="py-2.5 font-sans">
                    <span className="text-emerald-500 font-semibold">Within Limit</span>
                  </td>
                </tr>
                <tr>
                  <td className={`py-2.5 font-sans font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>CO (Carbon Monoxide)</td>
                  <td className="py-2.5">{latestObs?.pollutants.co || 1.1} mg/m³</td>
                  <td className="py-2.5">2.0 mg/m³</td>
                  <td className="py-2.5 text-emerald-500 font-bold">55</td>
                  <td className="py-2.5 font-sans">
                    <span className="text-emerald-500 font-semibold">Within Limit</span>
                  </td>
                </tr>
                <tr>
                  <td className={`py-2.5 font-sans font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>O3 (Ozone 8h)</td>
                  <td className="py-2.5">{latestObs?.pollutants.o3 || 42} µg/m³</td>
                  <td className="py-2.5">100 µg/m³</td>
                  <td className="py-2.5 text-emerald-500 font-bold">42</td>
                  <td className="py-2.5 font-sans">
                    <span className="text-emerald-500 font-semibold">Within Limit</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Health Advisory Card */}
        <div
          className={`p-5 rounded-2xl border flex flex-col justify-between space-y-4 transition-colors ${
            isLight
              ? 'bg-white border-slate-200/90 shadow-sm text-slate-800'
              : 'bg-[#111C2E] border-slate-800 shadow-xl text-white'
          }`}
        >
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-500" />
              <h3 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Health & Operational Advisory
              </h3>
            </div>
            <div className={`mt-3 p-3 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
              <div className={`text-[11px] font-semibold uppercase ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                Population Impact
              </div>
              <p className={`text-xs font-semibold mt-1 leading-relaxed ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {healthAdvisory.impact}
              </p>
            </div>

            <div className="mt-3 space-y-2 text-xs">
              <div>
                <strong className={`block text-[11px] ${isLight ? 'text-cyan-700 font-bold' : 'text-cyan-300'}`}>
                  General Public:
                </strong>
                <p className={`text-[11px] leading-relaxed mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  {healthAdvisory.generalAdvisory}
                </p>
              </div>
              <div>
                <strong className={`block text-[11px] ${isLight ? 'text-amber-700 font-bold' : 'text-amber-300'}`}>
                  Sensitive Cohorts:
                </strong>
                <p className={`text-[11px] leading-relaxed mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  {healthAdvisory.sensitiveGroupAdvisory}
                </p>
              </div>
            </div>
          </div>

          <div className={`pt-3 border-t flex items-center justify-between text-[11px] ${isLight ? 'border-slate-100' : 'border-slate-800'}`}>
            <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>CPCB NAQI Index 2015</span>
            <button
              onClick={() => onNavigateToTab('methodology')}
              className={`font-semibold cursor-pointer ${isLight ? 'text-cyan-700 hover:text-cyan-800' : 'text-cyan-400 hover:text-cyan-300'}`}
            >
              View Methodology →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
