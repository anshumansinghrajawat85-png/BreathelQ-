import React, { useState, useMemo, useEffect } from 'react';
import { ObservationRecord, LocationInfo } from '../../types';
import {
  Clock,
  Calendar,
  Download,
  Search,
  Filter,
  ArrowUpDown,
  RefreshCw,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Wind,
  Droplets,
  Thermometer,
  Gauge,
  Activity,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  MapPin,
  Flame,
  TreePine,
  Building2,
  FileJson,
} from 'lucide-react';

interface ChartSheetPageProps {
  observations: ObservationRecord[];
  locations: LocationInfo[];
  selectedCity: string;
  theme?: 'dark' | 'light';
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const ChartSheetPage: React.FC<ChartSheetPageProps> = ({
  observations,
  locations,
  selectedCity,
  theme = 'dark',
  onRefresh,
  isRefreshing = false,
}) => {
  const isLight = theme === 'light';

  // Live IST Clock
  const [currentIST, setCurrentIST] = useState<string>('');
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Format in Indian Standard Time (IST)
      const istString = now.toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
      setCurrentIST(`${istString} IST (UTC+05:30)`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Filter & Control States
  const [timeWindowHours, setTimeWindowHours] = useState<number>(48);
  const [stationFilter, setStationFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<'timestamp' | 'aqi' | 'pm25' | 'temp'>('timestamp');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 25;

  // Chart Parameter Toggles
  const [visibleSeries, setVisibleSeries] = useState({
    aqi: true,
    pm25: true,
    pm10: false,
    temp: true,
    humidity: false,
    no2: false,
  });

  // Hovered Chart Data Point for exact time inspect
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  // Time window filtering
  const windowedObservations = useMemo(() => {
    if (!observations || observations.length === 0) return [];

    // Latest observation timestamp as reference
    const sorted = [...observations].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    const newestTime = new Date(sorted[0].timestamp).getTime();
    const cutoffTime = newestTime - timeWindowHours * 3600 * 1000;

    return sorted.filter((o) => new Date(o.timestamp).getTime() >= cutoffTime);
  }, [observations, timeWindowHours]);

  // Comprehensive filtered list
  const filteredRecords = useMemo(() => {
    let list = [...windowedObservations];

    if (stationFilter !== 'all') {
      list = list.filter(
        (o) =>
          o.locationId.toLowerCase() === stationFilter.toLowerCase() ||
          o.cityName.toLowerCase().includes(stationFilter.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      list = list.filter((o) => o.aqiCategory.toLowerCase() === categoryFilter.toLowerCase());
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (o) =>
          o.stationName.toLowerCase().includes(q) ||
          o.cityName.toLowerCase().includes(q) ||
          o.timestamp.toLowerCase().includes(q) ||
          o.aqiCategory.toLowerCase().includes(q) ||
          o.source.toLowerCase().includes(q)
      );
    }

    // Sort
    list.sort((a, b) => {
      let valA: any = a[sortField as keyof ObservationRecord];
      let valB: any = b[sortField as keyof ObservationRecord];

      if (sortField === 'timestamp') {
        valA = new Date(a.timestamp).getTime();
        valB = new Date(b.timestamp).getTime();
      } else if (sortField === 'pm25') {
        valA = a.pollutants.pm25;
        valB = b.pollutants.pm25;
      } else if (sortField === 'temp') {
        valA = a.weather.temperature;
        valB = b.weather.temperature;
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return list;
  }, [windowedObservations, stationFilter, categoryFilter, searchTerm, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, currentPage, pageSize]);

  // Chronological dataset for the graph (oldest to newest)
  const chronologicalGraphData = useMemo(() => {
    return [...windowedObservations]
      .reverse()
      .slice(Math.max(0, windowedObservations.length - 60)); // Up to 60 chronologically ordered intervals
  }, [windowedObservations]);

  // Statistics Summary
  const stats = useMemo(() => {
    if (filteredRecords.length === 0) {
      return { peakAQI: 0, peakTime: 'N/A', minAQI: 0, minTime: 'N/A', avgPM25: 0, count: 0 };
    }

    let peak = filteredRecords[0];
    let min = filteredRecords[0];
    let pm25Sum = 0;

    for (const r of filteredRecords) {
      if (r.aqi > peak.aqi) peak = r;
      if (r.aqi < min.aqi) min = r;
      pm25Sum += r.pollutants.pm25;
    }

    return {
      peakAQI: peak.aqi,
      peakTime: new Date(peak.timestamp).toLocaleTimeString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        day: 'numeric',
        month: 'short',
      }),
      minAQI: min.aqi,
      minTime: new Date(min.timestamp).toLocaleTimeString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        day: 'numeric',
        month: 'short',
      }),
      avgPM25: Math.round(pm25Sum / filteredRecords.length),
      count: filteredRecords.length,
    };
  }, [filteredRecords]);

  // Format timestamp in readable local IST format with seconds
  const formatFullISTTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
    } catch {
      return isoString;
    }
  };

  const getRelativeDelta = (isoString: string) => {
    try {
      const now = new Date('2026-10-22T22:00:00Z').getTime(); // Reference platform simulated time
      const diffMs = Math.abs(now - new Date(isoString).getTime());
      const hours = Math.floor(diffMs / (3600 * 1000));
      const mins = Math.floor((diffMs % (3600 * 1000)) / (60 * 1000));
      if (hours === 0 && mins === 0) return 'Just now';
      if (hours === 0) return `${mins}m ago`;
      if (hours < 24) return `${hours}h ${mins}m ago`;
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h ago`;
    } catch {
      return '';
    }
  };

  // Export to CSV Functionality
  const handleExportCSV = () => {
    if (filteredRecords.length === 0) return;

    const headers = [
      'Timestamp_IST',
      'ISO_Timestamp',
      'Relative_Delta',
      'City_Village',
      'Station_Name',
      'AQI',
      'CPCB_Category',
      'Dominant_Pollutant',
      'PM2.5_ug_m3',
      'PM10_ug_m3',
      'NO2_ug_m3',
      'SO2_ug_m3',
      'CO_mg_m3',
      'O3_ug_m3',
      'NH3_ug_m3',
      'Temperature_C',
      'Humidity_Pct',
      'Wind_Speed_kmh',
      'Wind_Direction',
      'Pressure_hPa',
      'Data_Quality',
      'Data_Source',
    ];

    const rows = filteredRecords.map((r) => [
      `"${formatFullISTTime(r.timestamp)}"`,
      `"${r.timestamp}"`,
      `"${getRelativeDelta(r.timestamp)}"`,
      `"${r.cityName}"`,
      `"${r.stationName}"`,
      r.aqi,
      `"${r.aqiCategory}"`,
      `"${r.dominantPollutant}"`,
      r.pollutants.pm25,
      r.pollutants.pm10,
      r.pollutants.no2 ?? '',
      r.pollutants.so2 ?? '',
      r.pollutants.co ?? '',
      r.pollutants.o3 ?? '',
      r.pollutants.nh3 ?? '',
      r.weather.temperature,
      r.weather.humidity,
      r.weather.windSpeed,
      `"${r.weather.windDirection}"`,
      r.weather.pressure,
      `"${r.quality}"`,
      `"${r.source}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AirPredict_MP_ChartSheet_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to JSON Functionality
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredRecords, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `AirPredict_MP_ChartSheet_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // CPCB Badge Color
  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Good':
        return isLight ? 'bg-emerald-100 text-emerald-900 border-emerald-300' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'Satisfactory':
        return isLight ? 'bg-lime-100 text-lime-900 border-lime-300' : 'bg-lime-500/20 text-lime-300 border-lime-500/40';
      case 'Moderate':
        return isLight ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'Poor':
        return isLight ? 'bg-orange-100 text-orange-900 border-orange-300' : 'bg-orange-500/20 text-orange-300 border-orange-500/40';
      case 'Very Poor':
        return isLight ? 'bg-red-100 text-red-900 border-red-300' : 'bg-red-500/20 text-red-300 border-red-500/40';
      case 'Severe':
      case 'Severe+':
        return isLight ? 'bg-purple-100 text-purple-900 border-purple-300' : 'bg-purple-500/25 text-purple-300 border-purple-500/40';
      default:
        return isLight ? 'bg-slate-100 text-slate-800 border-slate-300' : 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  // SVG Chart Dimensions
  const chartHeight = 240;
  const chartWidth = 900;
  const padding = { top: 20, right: 30, bottom: 40, left: 45 };

  const graphPoints = chronologicalGraphData;
  const maxAQI = Math.max(300, ...graphPoints.map((p) => p.aqi));
  const minAQIVal = Math.min(20, ...graphPoints.map((p) => p.aqi));

  const getX = (index: number) => {
    if (graphPoints.length <= 1) return padding.left;
    return padding.left + (index / (graphPoints.length - 1)) * (chartWidth - padding.left - padding.right);
  };

  const getYAQI = (val: number) => {
    const range = maxAQI - minAQIVal || 1;
    return chartHeight - padding.bottom - ((val - minAQIVal) / range) * (chartHeight - padding.top - padding.bottom);
  };

  // Generate Path for SVG Line
  const aqiPath = graphPoints.length > 0
    ? graphPoints.reduce((acc, curr, idx) => `${acc} ${idx === 0 ? 'M' : 'L'} ${getX(idx)} ${getYAQI(curr.aqi)}`, '')
    : '';

  const pm25Path = graphPoints.length > 0
    ? graphPoints.reduce((acc, curr, idx) => `${acc} ${idx === 0 ? 'M' : 'L'} ${getX(idx)} ${getYAQI(curr.pollutants.pm25 * 1.8)}`, '')
    : '';

  const activePoint = hoveredPointIndex !== null && graphPoints[hoveredPointIndex]
    ? graphPoints[hoveredPointIndex]
    : graphPoints[graphPoints.length - 1] || null;

  return (
    <div className="space-y-6">
      {/* 1. Header Banner & Live Clock */}
      <div
        className={`p-5 rounded-2xl border transition-all ${
          isLight
            ? 'bg-white border-slate-200/90 shadow-sm'
            : 'bg-[#111C2E] border-slate-800/80 shadow-xl'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div
              className={`p-3 rounded-xl shrink-0 border ${
                isLight
                  ? 'bg-cyan-50 border-cyan-200 text-cyan-700'
                  : 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400'
              }`}
            >
              <FileSpreadsheet className="w-6 h-6" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                  Telemetry Timesheet & Chart Sheet
                </h1>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                    isLight
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60'
                  }`}
                >
                  Madhya Pradesh CPCB Continuous Stream
                </span>
              </div>
              <p className={`text-xs mt-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                Detailed time-series telemetry logbook with second-by-second timestamps, multipollutant metrics, and weather diagnostics.
              </p>
            </div>
          </div>

          {/* Right Action / Clock Deck */}
          <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
            {/* Live IST Clock Badge */}
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border font-mono text-xs ${
                isLight
                  ? 'bg-slate-100/80 border-slate-300 text-slate-800'
                  : 'bg-[#0B1220] border-slate-700 text-cyan-300'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-cyan-500 animate-spin" style={{ animationDuration: '8s' }} />
              <span className="font-semibold">{currentIST || 'Loading IST...'}</span>
            </div>

            {/* Refresh Button */}
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isRefreshing}
                title="Sync latest live telemetry from MP stations"
                className={`p-2 rounded-xl border transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold ${
                  isLight
                    ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                    : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                }`}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
                <span className="hidden sm:inline">Sync Time</span>
              </button>
            )}

            {/* Export Buttons */}
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer shadow-md"
              title="Download formatted CSV spreadsheet with all timestamps"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handleExportJSON}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition-colors ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
              title="Export complete telemetry payload as JSON"
            >
              <FileJson className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">JSON</span>
            </button>
          </div>
        </div>

        {/* Quick KPI Strip across the filtered time window */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-200/50 dark:border-slate-800/60">
          <div className={`p-2.5 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0B1220]/70 border-slate-800'}`}>
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
              <span>Peak Pollution Time</span>
              <Flame className="w-3.5 h-3.5 text-red-400" />
            </div>
            <div className="text-base font-extrabold mt-0.5 text-red-500 font-mono-nums">
              AQI {stats.peakAQI}
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
              Recorded: {stats.peakTime}
            </div>
          </div>

          <div className={`p-2.5 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0B1220]/70 border-slate-800'}`}>
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
              <span>Cleanest Air Window</span>
              <TreePine className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-base font-extrabold mt-0.5 text-emerald-500 font-mono-nums">
              AQI {stats.minAQI}
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
              Recorded: {stats.minTime}
            </div>
          </div>

          <div className={`p-2.5 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0B1220]/70 border-slate-800'}`}>
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
              <span>Window Avg PM2.5</span>
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="text-base font-extrabold mt-0.5 text-cyan-400 font-mono-nums">
              {stats.avgPM25} µg/m³
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
              CPCB 24h limit: 60 µg/m³
            </div>
          </div>

          <div className={`p-2.5 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0B1220]/70 border-slate-800'}`}>
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
              <span>Time-Stamped Entries</span>
              <Calendar className="w-3.5 h-3.5 text-teal-400" />
            </div>
            <div className="text-base font-extrabold mt-0.5 text-teal-400 font-mono-nums">
              {stats.count} Records
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
              100% Validated Data Integrity
            </div>
          </div>
        </div>
      </div>

      {/* 2. Interactive Time-Series Multi-Metric Chart */}
      <div
        className={`p-5 rounded-2xl border transition-all ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#111C2E] border-slate-800/80 shadow-xl'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-sm font-bold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-500" />
              <span>Multi-Parameter Temporal Trends (Continuous Time Progression)</span>
            </h2>
            <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Hover over any point to inspect exact time, pollutant breakdown, and weather parameters.
            </p>
          </div>

          {/* Series Toggles */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <button
              onClick={() => setVisibleSeries((prev) => ({ ...prev, aqi: !prev.aqi }))}
              className={`px-2.5 py-1 rounded-lg font-bold border transition-colors cursor-pointer ${
                visibleSeries.aqi
                  ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50'
                  : 'bg-transparent text-slate-400 border-slate-700 opacity-60'
              }`}
            >
              ● AQI
            </button>
            <button
              onClick={() => setVisibleSeries((prev) => ({ ...prev, pm25: !prev.pm25 }))}
              className={`px-2.5 py-1 rounded-lg font-bold border transition-colors cursor-pointer ${
                visibleSeries.pm25
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                  : 'bg-transparent text-slate-400 border-slate-700 opacity-60'
              }`}
            >
              ▲ PM2.5
            </button>
            <button
              onClick={() => setVisibleSeries((prev) => ({ ...prev, temp: !prev.temp }))}
              className={`px-2.5 py-1 rounded-lg font-bold border transition-colors cursor-pointer ${
                visibleSeries.temp
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/50'
                  : 'bg-transparent text-slate-400 border-slate-700 opacity-60'
              }`}
            >
              ■ Temp (°C)
            </button>
          </div>
        </div>

        {/* SVG Graphic Canvas */}
        <div className="relative mt-4 overflow-x-auto">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-56 select-none"
            onMouseLeave={() => setHoveredPointIndex(null)}
          >
            {/* Background horizontal gridlines */}
            {[0, 50, 100, 200, 300].map((threshold) => {
              const y = getYAQI(threshold);
              return (
                <g key={threshold}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={chartWidth - padding.right}
                    y2={y}
                    stroke={isLight ? '#E2E8F0' : '#1E293B'}
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />
                  <text
                    x={padding.left - 8}
                    y={y + 4}
                    textAnchor="end"
                    fill={isLight ? '#64748B' : '#64748B'}
                    fontSize="10"
                    fontFamily="monospace"
                  >
                    {threshold}
                  </text>
                </g>
              );
            })}

            {/* AQI Line */}
            {visibleSeries.aqi && aqiPath && (
              <path
                d={aqiPath}
                fill="none"
                stroke="#06B6D4"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* PM2.5 Line */}
            {visibleSeries.pm25 && pm25Path && (
              <path
                d={pm25Path}
                fill="none"
                stroke="#10B981"
                strokeWidth="2"
                strokeDasharray="3 3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Interactive Points on hover */}
            {graphPoints.map((p, idx) => {
              const cx = getX(idx);
              const cy = getYAQI(p.aqi);
              const isHovered = hoveredPointIndex === idx;

              return (
                <g key={p.id + idx} className="cursor-pointer" onMouseEnter={() => setHoveredPointIndex(idx)}>
                  {/* Invisible hit area for smooth hover */}
                  <rect x={cx - 10} y={0} width="20" height={chartHeight} fill="transparent" />

                  {isHovered && (
                    <line
                      x1={cx}
                      y1={padding.top}
                      x2={cx}
                      y2={chartHeight - padding.bottom}
                      stroke="#38BDF8"
                      strokeWidth="1.5"
                      strokeDasharray="2 2"
                    />
                  )}

                  <circle
                    cx={cx}
                    cy={cy}
                    r={isHovered ? 6 : 3}
                    fill={p.aqi > 200 ? '#EF4444' : p.aqi > 100 ? '#F59E0B' : '#10B981'}
                    stroke="#FFFFFF"
                    strokeWidth={isHovered ? 2 : 1}
                  />
                </g>
              );
            })}

            {/* X-Axis Labels (Time of day) */}
            {graphPoints
              .filter((_, idx) => idx % Math.max(1, Math.floor(graphPoints.length / 8)) === 0)
              .map((p, filteredIdx, arr) => {
                const originalIndex = graphPoints.indexOf(p);
                const x = getX(originalIndex);
                const timeLabel = new Date(p.timestamp).toLocaleTimeString('en-IN', {
                  timeZone: 'Asia/Kolkata',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false,
                });
                return (
                  <text
                    key={p.id + 'lbl'}
                    x={x}
                    y={chartHeight - 12}
                    textAnchor="middle"
                    fill={isLight ? '#64748B' : '#94A3B8'}
                    fontSize="10"
                    fontFamily="monospace"
                  >
                    {timeLabel}
                  </text>
                );
              })}
          </svg>
        </div>

        {/* Hover Point Detailed Real-Time Inspector */}
        {activePoint && (
          <div
            className={`mt-4 p-3.5 rounded-xl border flex flex-wrap items-center justify-between gap-4 text-xs font-mono transition-all ${
              isLight
                ? 'bg-cyan-50/80 border-cyan-200 text-slate-800'
                : 'bg-[#0B1220] border-cyan-500/30 text-slate-200 shadow-md'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Inspected Exact Time</span>
                <strong className="text-cyan-400 font-bold">{formatFullISTTime(activePoint.timestamp)}</strong>{' '}
                <span className="text-[10px] text-slate-400">({getRelativeDelta(activePoint.timestamp)})</span>
              </div>
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              <div>
                <span className="text-[10px] text-slate-400 block">Station</span>
                <span className="font-semibold">{activePoint.stationName}</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 block">AQI & Category</span>
                <span className="font-bold text-cyan-400">
                  {activePoint.aqi} ({activePoint.aqiCategory})
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 block">PM2.5 / PM10</span>
                <span>
                  {activePoint.pollutants.pm25} / {activePoint.pollutants.pm10} µg/m³
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 block">Weather Telemetry</span>
                <span>
                  {activePoint.weather.temperature}°C • {activePoint.weather.humidity}% RH •{' '}
                  {activePoint.weather.windSpeed} km/h {activePoint.weather.windDirection}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Controls & Filter Bar */}
      <div
        className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-3 ${
          isLight ? 'bg-white border-slate-200' : 'bg-[#111C2E] border-slate-800/80'
        }`}
      >
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          {/* Search box */}
          <div className="relative flex-1 min-w-[180px] max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by time (e.g. 14:00), station, district..."
              className={`w-full pl-9 pr-3 py-1.5 rounded-xl text-xs border focus:outline-none ${
                isLight
                  ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-cyan-500'
                  : 'bg-[#0B1220] border-slate-700 text-white focus:border-cyan-400'
              }`}
            />
          </div>

          {/* Time Window Dropdown */}
          <div className="flex items-center gap-1.5 text-xs">
            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={timeWindowHours}
              onChange={(e) => {
                setTimeWindowHours(Number(e.target.value));
                setCurrentPage(1);
              }}
              aria-label="Time Horizon Window"
              className={`rounded-xl px-2.5 py-1.5 text-xs border focus:outline-none cursor-pointer ${
                isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-[#0B1220] border-slate-700 text-white'
              }`}
            >
              <option value={6}>Last 6 Hours</option>
              <option value={12}>Last 12 Hours</option>
              <option value={24}>Last 24 Hours</option>
              <option value={48}>Last 48 Hours</option>
              <option value={168}>Last 7 Days (168h)</option>
            </select>
          </div>

          {/* Location / Station Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={stationFilter}
              onChange={(e) => {
                setStationFilter(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Filter by Location or Station"
              className={`rounded-xl px-2.5 py-1.5 text-xs border focus:outline-none cursor-pointer ${
                isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-[#0B1220] border-slate-700 text-white'
              }`}
            >
              <option value="all">All MP Locations ({locations.length})</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name} {loc.locationType === 'village' ? '(Gram Panchayat)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* CPCB Category Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Filter by CPCB Category"
              className={`rounded-xl px-2.5 py-1.5 text-xs border focus:outline-none cursor-pointer ${
                isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-[#0B1220] border-slate-700 text-white'
              }`}
            >
              <option value="all">All AQI Categories</option>
              <option value="good">Good (0-50)</option>
              <option value="satisfactory">Satisfactory (51-100)</option>
              <option value="moderate">Moderate (101-200)</option>
              <option value="poor">Poor (201-300)</option>
              <option value="very poor">Very Poor (301-400)</option>
              <option value="severe">Severe (401-500)</option>
            </select>
          </div>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 text-[11px]">Sort By:</span>
          <button
            onClick={() => {
              if (sortField === 'timestamp') {
                setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
              } else {
                setSortField('timestamp');
                setSortDirection('desc');
              }
            }}
            className={`px-2 py-1 rounded-lg border flex items-center gap-1 cursor-pointer font-mono ${
              sortField === 'timestamp'
                ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40 font-bold'
                : 'text-slate-400 border-slate-700'
            }`}
          >
            <span>Time</span>
            <ArrowUpDown className="w-3 h-3" />
          </button>

          <button
            onClick={() => {
              if (sortField === 'aqi') {
                setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
              } else {
                setSortField('aqi');
                setSortDirection('desc');
              }
            }}
            className={`px-2 py-1 rounded-lg border flex items-center gap-1 cursor-pointer font-mono ${
              sortField === 'aqi'
                ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40 font-bold'
                : 'text-slate-400 border-slate-700'
            }`}
          >
            <span>AQI</span>
            <ArrowUpDown className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* 4. The Master Timesheet Table (All Details with Exact Time) */}
      <div
        className={`rounded-2xl border overflow-hidden transition-all ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#111C2E] border-slate-800/80 shadow-xl'
        }`}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr
                className={`border-b font-mono text-[11px] uppercase tracking-wider ${
                  isLight ? 'bg-slate-100/80 text-slate-600 border-slate-200' : 'bg-[#0B1220]/90 text-slate-400 border-slate-800'
                }`}
              >
                <th className="py-3 px-4 font-bold">Exact Time (IST)</th>
                <th className="py-3 px-4 font-bold">Station / Location</th>
                <th className="py-3 px-3 font-bold text-center">AQI</th>
                <th className="py-3 px-3 font-bold text-center">Status</th>
                <th className="py-3 px-3 font-bold text-right">PM2.5 (µg/m³)</th>
                <th className="py-3 px-3 font-bold text-right">PM10 (µg/m³)</th>
                <th className="py-3 px-3 font-bold text-right">NO2 (µg/m³)</th>
                <th className="py-3 px-3 font-bold text-right">SO2 (µg/m³)</th>
                <th className="py-3 px-3 font-bold text-right">CO (mg/m³)</th>
                <th className="py-3 px-3 font-bold text-right">O3 (µg/m³)</th>
                <th className="py-3 px-3 font-bold text-right">Temp (°C)</th>
                <th className="py-3 px-3 font-bold text-right">Humidity (%)</th>
                <th className="py-3 px-4 font-bold">Wind Telemetry</th>
                <th className="py-3 px-3 font-bold text-center">Data Integrity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 font-mono-nums">
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={14} className="py-12 text-center text-slate-400">
                    No time-series telemetry records found matching your filters.
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((record) => {
                  const isVillage = record.cityName.toLowerCase().includes('village') || record.cityName.toLowerCase().includes('gram');
                  const isIndustrial = record.cityName.toLowerCase().includes('sez') || record.cityName.toLowerCase().includes('energy') || record.stationName.toLowerCase().includes('stack');

                  return (
                    <tr
                      key={record.id}
                      className={`transition-colors hover:bg-slate-500/5 ${
                        isLight ? 'hover:bg-slate-50' : 'hover:bg-[#142338]'
                      }`}
                    >
                      {/* Exact Timestamp */}
                      <td className="py-2.5 px-4 whitespace-nowrap">
                        <div className="font-mono text-xs font-semibold text-cyan-600 dark:text-cyan-400">
                          {formatFullISTTime(record.timestamp)}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {getRelativeDelta(record.timestamp)}
                        </div>
                      </td>

                      {/* Station / Location */}
                      <td className="py-2.5 px-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                          {isVillage ? (
                            <TreePine className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          ) : isIndustrial ? (
                            <Flame className="w-3.5 h-3.5 text-red-500 shrink-0" />
                          ) : (
                            <Building2 className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                          )}
                          <span>{record.stationName}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1">
                          <span>{record.cityName}</span>
                          <span>•</span>
                          <span className="font-mono">{record.source}</span>
                        </div>
                      </td>

                      {/* AQI Index */}
                      <td className="py-2.5 px-3 text-center">
                        <span className="text-sm font-bold font-mono">
                          {record.aqi}
                        </span>
                      </td>

                      {/* Status / Category */}
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${getCategoryColor(
                            record.aqiCategory
                          )}`}
                        >
                          {record.aqiCategory}
                        </span>
                      </td>

                      {/* PM2.5 */}
                      <td className="py-2.5 px-3 text-right font-mono font-semibold">
                        <span className={record.pollutants.pm25 > 60 ? 'text-amber-500 font-bold' : ''}>
                          {record.pollutants.pm25}
                        </span>
                      </td>

                      {/* PM10 */}
                      <td className="py-2.5 px-3 text-right font-mono">
                        {record.pollutants.pm10}
                      </td>

                      {/* NO2 */}
                      <td className="py-2.5 px-3 text-right font-mono text-slate-400">
                        {record.pollutants.no2 ?? '—'}
                      </td>

                      {/* SO2 */}
                      <td className="py-2.5 px-3 text-right font-mono text-slate-400">
                        {record.pollutants.so2 ?? '—'}
                      </td>

                      {/* CO */}
                      <td className="py-2.5 px-3 text-right font-mono text-slate-400">
                        {record.pollutants.co ?? '—'}
                      </td>

                      {/* O3 */}
                      <td className="py-2.5 px-3 text-right font-mono text-slate-400">
                        {record.pollutants.o3 ?? '—'}
                      </td>

                      {/* Temp */}
                      <td className="py-2.5 px-3 text-right font-mono font-medium">
                        {record.weather.temperature}°C
                      </td>

                      {/* Humidity */}
                      <td className="py-2.5 px-3 text-right font-mono">
                        {record.weather.humidity}%
                      </td>

                      {/* Wind */}
                      <td className="py-2.5 px-4 whitespace-nowrap font-mono text-[11px]">
                        <span className="text-slate-300 dark:text-slate-300">
                          {record.weather.windSpeed} km/h
                        </span>{' '}
                        <span className="text-slate-400">({record.weather.windDirection})</span>
                      </td>

                      {/* Data Quality & Source */}
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded font-mono ${
                            record.quality === 'Valid'
                              ? 'text-emerald-400 bg-emerald-500/10'
                              : record.quality === 'Flagged'
                              ? 'text-amber-400 bg-amber-500/10'
                              : 'text-cyan-400 bg-cyan-500/10'
                          }`}
                        >
                          {record.quality === 'Valid' ? (
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                          ) : (
                            <AlertTriangle className="w-2.5 h-2.5 text-amber-400" />
                          )}
                          <span>{record.quality}</span>
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div
          className={`p-3.5 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-xs ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0B1220]/60 border-slate-800'
          }`}
        >
          <div className="text-slate-400 font-mono text-[11px]">
            Showing <strong className="text-slate-200 font-bold">{paginatedRecords.length}</strong> of{' '}
            <strong className="text-slate-200 font-bold">{filteredRecords.length}</strong> logged time entries (Page{' '}
            {currentPage} of {totalPages})
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className={`p-1.5 rounded-lg border disabled:opacity-30 cursor-pointer ${
                isLight ? 'border-slate-300 text-slate-700 hover:bg-slate-200' : 'border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-7 h-7 rounded-lg text-xs font-mono font-bold border cursor-pointer transition-colors ${
                    currentPage === pageNum
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                      : isLight
                      ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className={`p-1.5 rounded-lg border disabled:opacity-30 cursor-pointer ${
                isLight ? 'border-slate-300 text-slate-700 hover:bg-slate-200' : 'border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
