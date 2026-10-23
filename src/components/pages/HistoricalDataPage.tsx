import React, { useState, useMemo } from 'react';
import { ObservationRecord, DataQuality, DataSource } from '../../types';
import { getAQIColor, getAQICategory } from '../../utils/aqiUtils';
import {
  Database,
  Search,
  Filter,
  Download,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  Clock,
  Layers,
} from 'lucide-react';

interface HistoricalDataPageProps {
  observations: ObservationRecord[];
  city: string;
  theme?: 'dark' | 'light';
}

type SortField = 'timestamp' | 'aqi' | 'pm25' | 'pm10';
type SortDirection = 'asc' | 'desc';

export const HistoricalDataPage: React.FC<HistoricalDataPageProps> = ({
  observations,
  city,
  theme = 'dark',
}) => {
  const isLight = theme === 'light';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedQuality, setSelectedQuality] = useState<string>('all');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('timestamp');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);

  // Filter and sort observations
  const filteredRecords = useMemo(() => {
    let result = [...observations];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (o) =>
          o.stationName.toLowerCase().includes(q) ||
          o.cityName.toLowerCase().includes(q) ||
          o.source.toLowerCase().includes(q) ||
          o.id.toLowerCase().includes(q)
      );
    }

    if (selectedQuality !== 'all') {
      result = result.filter((o) => o.quality === selectedQuality);
    }

    if (selectedSource !== 'all') {
      result = result.filter((o) => o.source === selectedSource);
    }

    // Sort
    result.sort((a, b) => {
      let valA: number = 0;
      let valB: number = 0;

      if (sortField === 'pm25') {
        valA = a.pollutants.pm25;
        valB = b.pollutants.pm25;
      } else if (sortField === 'pm10') {
        valA = a.pollutants.pm10;
        valB = b.pollutants.pm10;
      } else if (sortField === 'timestamp') {
        valA = new Date(a.timestamp).getTime();
        valB = new Date(b.timestamp).getTime();
      } else if (sortField === 'aqi') {
        valA = a.aqi;
        valB = b.aqi;
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [observations, searchQuery, selectedQuality, selectedSource, sortField, sortDirection]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredRecords.length / rowsPerPage) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredRecords.slice(start, start + rowsPerPage);
  }, [filteredRecords, currentPage, rowsPerPage]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleExportCSV = () => {
    const headers = [
      'Timestamp (ISO)',
      'City',
      'Station',
      'AQI',
      'Category',
      'PM2.5 (µg/m³)',
      'PM10 (µg/m³)',
      'NO2 (µg/m³)',
      'SO2 (µg/m³)',
      'CO (mg/m³)',
      'O3 (µg/m³)',
      'Temperature (°C)',
      'Humidity (%)',
      'Wind Speed (km/h)',
      'Data Source',
      'Quality Flag',
      'Is Forecast',
    ];

    const rows = filteredRecords.map((r) => [
      r.timestamp,
      r.cityName,
      `"${r.stationName}"`,
      r.aqi,
      r.aqiCategory,
      r.pollutants.pm25,
      r.pollutants.pm10,
      r.pollutants.no2 || '',
      r.pollutants.so2 || '',
      r.pollutants.co || '',
      r.pollutants.o3 || '',
      r.weather.temperature,
      r.weather.humidity,
      r.weather.windSpeed,
      `"${r.source}"`,
      r.quality,
      r.isForecast ? 'TRUE' : 'FALSE',
    ]);

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `AirPredict_Observations_${city}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header with Export CTA */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 ${
        isLight ? 'border-slate-200' : 'border-slate-800'
      }`}>
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-cyan-500 uppercase">
            <Database className="w-4 h-4" />
            <span>GROUNDED OBSERVATION REGISTRY</span>
          </div>
          <h2 className={`text-xl md:text-2xl font-bold mt-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Historical Environmental Observations — {city}
          </h2>
          <p className={`text-xs mt-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            Certified CPCB ground station measurements and IoT sensor records. Strictly actual observations, distinct from model forecasts.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className={`flex items-center gap-2 px-4 py-2 border rounded-xl text-xs font-semibold transition-colors shadow-sm cursor-pointer self-start sm:self-auto ${
            isLight
              ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-800'
              : 'bg-[#111C2E] hover:bg-slate-800 border-slate-700/80 text-white'
          }`}
        >
          <Download className="w-4 h-4 text-cyan-500" />
          <span>Export Filtered CSV ({filteredRecords.length})</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className={`flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl text-xs border ${
        isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#111C2E] border-slate-800'
      }`}>
        <div className="flex flex-wrap items-center gap-3">
          {/* Search box */}
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5" />
            <input
              type="text"
              placeholder="Filter by station, city, or ID..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className={`rounded-lg pl-8 pr-3 py-1.5 focus:outline-none w-52 sm:w-64 border ${
                isLight
                  ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-cyan-500'
                  : 'bg-slate-900 border-slate-700 text-white placeholder-slate-500 focus:border-cyan-400'
              }`}
            />
          </div>

          {/* Data Quality Filter */}
          <div className="flex items-center gap-1.5">
            <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Quality:</span>
            <select
              value={selectedQuality}
              onChange={(e) => {
                setSelectedQuality(e.target.value);
                setCurrentPage(1);
              }}
              className={`rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer border ${
                isLight
                  ? 'bg-slate-50 border-slate-300 text-slate-800'
                  : 'bg-slate-900 border-slate-700 text-slate-200'
              }`}
            >
              <option value="all">All Records</option>
              <option value="Valid">Valid (Pass)</option>
              <option value="Flagged">Flagged (Outlier)</option>
              <option value="Imputed">Imputed</option>
            </select>
          </div>

          {/* Source Filter */}
          <div className="flex items-center gap-1.5">
            <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Source:</span>
            <select
              value={selectedSource}
              onChange={(e) => {
                setSelectedSource(e.target.value);
                setCurrentPage(1);
              }}
              className={`rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer border ${
                isLight
                  ? 'bg-slate-50 border-slate-300 text-slate-800'
                  : 'bg-slate-900 border-slate-700 text-slate-200'
              }`}
            >
              <option value="all">All Sources</option>
              <option value="CPCB India">CPCB India</option>
              <option value="OpenAQ">OpenAQ Platform</option>
              <option value="Open-Meteo">Open-Meteo</option>
              <option value="IoT ESP32 Sensor">IoT ESP32 Sensor</option>
            </select>
          </div>
        </div>

        {/* Rows per page selector */}
        <div className={`flex items-center gap-2 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
          <span>Rows:</span>
          <select
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className={`rounded-lg px-2 py-1 focus:outline-none cursor-pointer border ${
              isLight
                ? 'bg-slate-50 border-slate-300 text-slate-800'
                : 'bg-slate-900 border-slate-700 text-slate-200'
            }`}
          >
            <option value={10}>10</option>
            <option value={15}>15</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {/* Observation Records Table */}
      <div className={`p-4 rounded-2xl border shadow-xl space-y-3 ${
        isLight ? 'bg-white border-slate-200 shadow-slate-200/50' : 'bg-[#111C2E] border-slate-800'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className={`border-b text-[11px] ${
                isLight ? 'border-slate-200 text-slate-500' : 'border-slate-800 text-slate-400'
              }`}>
                <th
                  onClick={() => toggleSort('timestamp')}
                  className={`py-3 px-3 cursor-pointer ${isLight ? 'hover:text-slate-900' : 'hover:text-white'}`}
                >
                  <div className="flex items-center gap-1">
                    <span>Observation Timestamp</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3">Location / Station</th>
                <th
                  onClick={() => toggleSort('aqi')}
                  className={`py-3 px-3 cursor-pointer ${isLight ? 'hover:text-slate-900' : 'hover:text-white'}`}
                >
                  <div className="flex items-center gap-1">
                    <span>AQI (NAQI)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('pm25')}
                  className={`py-3 px-3 cursor-pointer ${isLight ? 'hover:text-slate-900' : 'hover:text-white'}`}
                >
                  <div className="flex items-center gap-1">
                    <span>PM2.5 (µg/m³)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('pm10')}
                  className={`py-3 px-3 cursor-pointer ${isLight ? 'hover:text-slate-900' : 'hover:text-white'}`}
                >
                  <div className="flex items-center gap-1">
                    <span>PM10 (µg/m³)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3">Data Provider</th>
                <th className="py-3 px-3">Quality Integrity</th>
                <th className="py-3 px-3">Data Type</th>
              </tr>
            </thead>
            <tbody className={`divide-y font-mono-nums ${isLight ? 'divide-slate-200' : 'divide-slate-800/60'}`}>
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500 font-sans">
                    No matching observations found.
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((record) => {
                  const color = getAQIColor(record.aqi);
                  const isFlagged = record.quality === 'Flagged';

                  return (
                    <tr key={record.id} className={isLight ? 'hover:bg-slate-50 transition-colors' : 'hover:bg-slate-850/40 transition-colors'}>
                      <td className={`py-3 px-3 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                        {new Date(record.timestamp).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className={`py-3 px-3 font-sans font-medium ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        {record.stationName}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm" style={{ color }}>
                            {record.aqi}
                          </span>
                          <span
                            className="text-[10px] font-semibold px-1.5 py-0.5 rounded font-sans"
                            style={{ backgroundColor: `${color}20`, color }}
                          >
                            {record.aqiCategory}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-cyan-600 font-bold">{record.pollutants.pm25}</td>
                      <td className={`py-3 px-3 ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>{record.pollutants.pm10}</td>
                      <td className={`py-3 px-3 font-sans ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>{record.source}</td>
                      <td className="py-3 px-3 font-sans">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                            record.quality === 'Valid'
                              ? isLight
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : isFlagged
                              ? isLight
                                ? 'bg-rose-50 text-rose-800 border-rose-300'
                                : 'bg-red-500/20 text-red-300 border border-red-500/30'
                              : isLight
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {record.quality}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-sans">
                        <span className="text-[10px] text-teal-600 font-semibold uppercase tracking-wider">
                          Actual Observation
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t text-xs ${
          isLight ? 'border-slate-200 text-slate-500' : 'border-slate-800 text-slate-400'
        }`}>
          <div>
            Showing <span className={`font-mono-nums font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>{(currentPage - 1) * rowsPerPage + 1}</span> to{' '}
            <span className={`font-mono-nums font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {Math.min(currentPage * rowsPerPage, filteredRecords.length)}
            </span>{' '}
            of <span className={`font-mono-nums font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>{filteredRecords.length}</span> verified observations
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`p-1.5 rounded-lg border disabled:opacity-40 cursor-pointer ${
                isLight
                  ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100 shadow-xs'
                  : 'bg-slate-900 border-slate-700 hover:text-white'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono-nums px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`p-1.5 rounded-lg border disabled:opacity-40 cursor-pointer ${
                isLight
                  ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100 shadow-xs'
                  : 'bg-slate-900 border-slate-700 hover:text-white'
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
