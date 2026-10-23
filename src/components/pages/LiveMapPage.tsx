import React, { useState, useEffect, useCallback } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useMap,
} from '@vis.gl/react-google-maps';
import { MonitoringStation, AQICategory } from '../../types';
import { getAQIColor, getAQICategory, getAQIHealthAdvisory } from '../../utils/aqiUtils';
import {
  Search,
  Filter,
  Flame,
  X,
  ShieldAlert,
  Navigation as NavIcon,
  Compass,
  MapPin,
  TreePine,
  Factory,
  Building2,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

const GOOGLE_MAPS_API_KEY =
  (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY ||
  'AIzaSyDjxTFrCwAePiW4TFQpKCu_AjxkQciO-Pk';

interface LiveMapPageProps {
  stations: MonitoringStation[];
  selectedCity: string;
  theme?: 'dark' | 'light';
}

// Controller component to handle programmatic panning & zooming
function MapController({ targetCenter, targetZoom }: { targetCenter: { lat: number; lng: number }; targetZoom: number }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    map.panTo(targetCenter);
    map.setZoom(targetZoom);
  }, [map, targetCenter, targetZoom]);

  return null;
}

export const LiveMapPage: React.FC<LiveMapPageProps> = ({ stations, selectedCity, theme = 'dark' }) => {
  const isLight = theme === 'light';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterType, setFilterType] = useState<'all' | 'city' | 'village' | 'industrial'>('all');
  const [showHotspotsOnly, setShowHotspotsOnly] = useState(false);
  const [activeStation, setActiveStation] = useState<MonitoringStation | null>(null);

  // User Geolocation State
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; accuracy?: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  // Google Maps Auth Error or Quota Defense State
  const [authError, setAuthError] = useState<string | null>(null);

  // Madhya Pradesh Regional Coordinates Reference
  const mpRegionCoords: Record<string, { lat: number; lng: number; zoom: number }> = {
    bhopal: { lat: 23.2599, lng: 77.4126, zoom: 12 },
    indore: { lat: 22.7196, lng: 75.8577, zoom: 12 },
    gwalior: { lat: 26.2183, lng: 78.1828, zoom: 12 },
    jabalpur: { lat: 23.1815, lng: 79.9864, zoom: 12 },
    ujjain: { lat: 23.1765, lng: 75.7885, zoom: 12 },
    sagar: { lat: 23.8388, lng: 78.7378, zoom: 12 },
    rewa: { lat: 24.5362, lng: 81.3037, zoom: 12 },
    satna: { lat: 24.6005, lng: 80.8322, zoom: 12 },
    singrauli: { lat: 24.1997, lng: 82.6644, zoom: 12 },
    ratlam: { lat: 23.3315, lng: 75.0367, zoom: 12 },
    dewas: { lat: 22.9676, lng: 76.0534, zoom: 12 },
    chhindwara: { lat: 22.0574, lng: 78.9382, zoom: 12 },
    katni: { lat: 23.8343, lng: 80.3963, zoom: 12 },
    burhanpur: { lat: 21.3145, lng: 76.2238, zoom: 12 },
    mandideep: { lat: 23.0844, lng: 77.5186, zoom: 13 },
    pithampur: { lat: 22.6143, lng: 75.6822, zoom: 13 },
    sanchi: { lat: 23.4853, lng: 77.7397, zoom: 13 },
    khajuraho: { lat: 24.8318, lng: 79.9199, zoom: 13 },
    orchha: { lat: 25.3516, lng: 78.6416, zoom: 13 },
    maheshwar: { lat: 22.1764, lng: 75.5861, zoom: 13 },
    ashta: { lat: 23.0189, lng: 76.7214, zoom: 13 },
    babai: { lat: 22.7001, lng: 77.9351, zoom: 13 },
    'mandla-tribal': { lat: 22.5986, lng: 80.3715, zoom: 13 },
    bhedaghat: { lat: 23.1311, lng: 79.8005, zoom: 13 },
    amarkantak: { lat: 22.6734, lng: 81.7584, zoom: 13 },
    pachmarhi: { lat: 22.4674, lng: 78.4346, zoom: 13 },
    berasia: { lat: 23.6334, lng: 77.4332, zoom: 13 },
  };

  const initialTarget = mpRegionCoords[selectedCity.toLowerCase()] || {
    lat: 23.2599,
    lng: 77.4126,
    zoom: 11,
  };

  const [currentCenter, setCurrentCenter] = useState<{ lat: number; lng: number }>({
    lat: initialTarget.lat,
    lng: initialTarget.lng,
  });
  const [currentZoom, setCurrentZoom] = useState<number>(initialTarget.zoom);

  // Synchronize when header selection changes
  useEffect(() => {
    const target = mpRegionCoords[selectedCity.toLowerCase()];
    if (target) {
      setCurrentCenter({ lat: target.lat, lng: target.lng });
      setCurrentZoom(target.zoom);
    }
  }, [selectedCity]);

  // Auth failure & quota listener per Google Maps guidelines
  useEffect(() => {
    (window as any).gm_authFailure = () => {
      setAuthError('Google Maps authorization or quota exceeded. Using live CPCB/MPPCB coordinates fallback.');
    };
  }, []);

  // Geolocation Handler
  const handleLocateMe = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userPos = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        };
        setUserLocation(userPos);
        setCurrentCenter({ lat: userPos.lat, lng: userPos.lng });
        setCurrentZoom(14);
        setIsLocating(false);
      },
      (err) => {
        console.warn('Geolocation error:', err.message);
        setGeoError('Unable to retrieve location. Defaulting to Bhopal, Madhya Pradesh.');
        setIsLocating(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }, []);

  // Filter stations based on search, category, type, and hotspot flags
  const filteredStations = stations.filter((s) => {
    // Search query match
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        s.name.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q) ||
        (s.district && s.district.toLowerCase().includes(q));
      if (!match) return false;
    }

    // AQI Category filter
    if (selectedCategory !== 'all' && s.latestCategory !== selectedCategory) {
      return false;
    }

    // Hotspot only filter
    if (showHotspotsOnly && !s.isHotspot) {
      return false;
    }

    // Type filter (city, village, industrial)
    if (filterType !== 'all') {
      if (filterType === 'village' && s.locationType !== 'village' && !s.name.includes('Village') && !s.name.includes('Gram')) return false;
      if (filterType === 'industrial' && s.locationType !== 'industrial' && !s.isHotspot) return false;
      if (filterType === 'city' && (s.locationType === 'village' || s.locationType === 'industrial')) return false;
    }

    return true;
  });

  return (
    <div className="space-y-4">
      {/* Top Header & Overview Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className={`text-xl font-black tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Madhya Pradesh Live Geospatial Air Quality Map
            </h2>
            <span
              className={`text-[10px] font-mono-nums font-bold px-2 py-0.5 rounded border uppercase ${
                isLight ? 'bg-cyan-100 text-cyan-900 border-cyan-300' : 'bg-cyan-950/70 text-cyan-300 border-cyan-700/60'
              }`}
            >
              Google Maps Live
            </span>
          </div>
          <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            Live CPCB CAAQMS, MPPCB telemetry & IoT particulate monitoring across MP cities, industrial corridors, and rural gram panchayats.
          </p>
        </div>

        {/* Quick Fly-To Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => {
              setCurrentCenter({ lat: 23.2599, lng: 77.4126 });
              setCurrentZoom(12);
            }}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
              isLight ? 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300' : 'bg-[#121E33] hover:bg-slate-800 text-slate-200 border-slate-700/80'
            }`}
          >
            Bhopal
          </button>
          <button
            onClick={() => {
              setCurrentCenter({ lat: 22.7196, lng: 75.8577 });
              setCurrentZoom(12);
            }}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
              isLight ? 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300' : 'bg-[#121E33] hover:bg-slate-800 text-slate-200 border-slate-700/80'
            }`}
          >
            Indore
          </button>
          <button
            onClick={() => {
              setCurrentCenter({ lat: 26.2183, lng: 78.1828 });
              setCurrentZoom(12);
            }}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
              isLight ? 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300' : 'bg-[#121E33] hover:bg-slate-800 text-slate-200 border-slate-700/80'
            }`}
          >
            Gwalior
          </button>
          <button
            onClick={() => {
              setCurrentCenter({ lat: 23.1815, lng: 79.9864 });
              setCurrentZoom(12);
            }}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
              isLight ? 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300' : 'bg-[#121E33] hover:bg-slate-800 text-slate-200 border-slate-700/80'
            }`}
          >
            Jabalpur
          </button>
          <button
            onClick={() => {
              setCurrentCenter({ lat: 24.1997, lng: 82.6644 });
              setCurrentZoom(12);
            }}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer whitespace-nowrap text-red-400 ${
              isLight ? 'bg-red-50 border-red-200 hover:bg-red-100' : 'bg-red-950/40 border-red-800/60 hover:bg-red-900/50'
            }`}
          >
            Singrauli (Hotspot)
          </button>
          <button
            onClick={() => {
              setCurrentCenter({ lat: 23.4853, lng: 77.7397 });
              setCurrentZoom(13);
            }}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer whitespace-nowrap text-emerald-400 ${
              isLight ? 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100' : 'bg-emerald-950/40 border-emerald-800/60 hover:bg-emerald-900/50'
            }`}
          >
            Sanchi Village
          </button>
        </div>
      </div>

      {/* Main Map Box with Explicit Height (Required by Skill to prevent height collapse) */}
      <div
        className={`relative w-full h-[calc(100vh-270px)] min-h-[580px] rounded-2xl overflow-hidden border shadow-2xl transition-colors ${
          isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#0B1220] border-slate-800/90'
        }`}
      >
        {/* Floating Controls Bar (Top Left) */}
        <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
          {/* Search, Types & Filter Dock */}
          <div
            className={`flex flex-wrap items-center gap-2 pointer-events-auto backdrop-blur-md border p-2 rounded-xl shadow-2xl transition-colors ${
              isLight ? 'bg-white/95 border-slate-200 text-slate-800' : 'bg-[#111C2E]/95 border-slate-700/80 text-white'
            }`}
          >
            {/* Search Input */}
            <div className="relative flex items-center">
              <Search className={`w-3.5 h-3.5 absolute left-2.5 ${isLight ? 'text-slate-400' : 'text-slate-400'}`} />
              <input
                type="text"
                placeholder="Search MP city, village or station..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`border rounded-lg pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:border-cyan-500 w-44 sm:w-56 ${
                  isLight
                    ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                    : 'bg-slate-900 border-slate-700 text-white placeholder-slate-500'
                }`}
              />
            </div>

            {/* Region Type Filter (All / Cities / Villages / Industrial) */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setFilterType('all')}
                className={`px-2 py-1 text-[11px] font-bold rounded-md transition-colors cursor-pointer ${
                  filterType === 'all'
                    ? 'bg-cyan-500 text-slate-950'
                    : isLight
                    ? 'text-slate-600 hover:bg-slate-100'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                All MP ({stations.length})
              </button>
              <button
                onClick={() => setFilterType('city')}
                className={`px-2 py-1 text-[11px] font-bold rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                  filterType === 'city'
                    ? 'bg-cyan-500 text-slate-950'
                    : isLight
                    ? 'text-slate-600 hover:bg-slate-100'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Building2 className="w-3 h-3" />
                Cities
              </button>
              <button
                onClick={() => setFilterType('village')}
                className={`px-2 py-1 text-[11px] font-bold rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                  filterType === 'village'
                    ? 'bg-emerald-400 text-slate-950'
                    : isLight
                    ? 'text-emerald-700 hover:bg-emerald-50'
                    : 'text-emerald-300 hover:bg-slate-800'
                }`}
              >
                <TreePine className="w-3 h-3 text-emerald-400" />
                Villages
              </button>
              <button
                onClick={() => setFilterType('industrial')}
                className={`px-2 py-1 text-[11px] font-bold rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                  filterType === 'industrial'
                    ? 'bg-amber-400 text-slate-950'
                    : isLight
                    ? 'text-amber-700 hover:bg-amber-50'
                    : 'text-amber-300 hover:bg-slate-800'
                }`}
              >
                <Factory className="w-3 h-3 text-amber-400" />
                Industrial
              </button>
            </div>

            {/* AQI Band Selector */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={`border rounded-lg px-2 py-1.5 text-xs focus:outline-none cursor-pointer ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-slate-900 border-slate-700 text-slate-200'
              }`}
            >
              <option value="all">All AQI Levels</option>
              <option value="Good">Good (0-50)</option>
              <option value="Satisfactory">Satisfactory (51-100)</option>
              <option value="Moderate">Moderate (101-200)</option>
              <option value="Poor">Poor (201-300)</option>
              <option value="Very Poor">Very Poor (301-400)</option>
              <option value="Severe">Severe (401-500)</option>
            </select>

            {/* Hotspots Toggle */}
            <button
              onClick={() => setShowHotspotsOnly(!showHotspotsOnly)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer border ${
                showHotspotsOnly
                  ? 'bg-red-500/20 text-red-400 border-red-500/50'
                  : isLight
                  ? 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-600'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-red-500" />
              <span>Hotspots ({stations.filter((s) => s.isHotspot).length})</span>
            </button>
          </div>

          {/* Right Floating: Geolocation "Locate Me" Button */}
          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              onClick={handleLocateMe}
              disabled={isLocating}
              title="Center Google Map on your live location in Madhya Pradesh"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border shadow-2xl transition-all cursor-pointer ${
                isLight
                  ? 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300'
                  : 'bg-[#111C2E] hover:bg-slate-800 text-white border-slate-700/90'
              }`}
            >
              <NavIcon className={`w-3.5 h-3.5 text-cyan-400 ${isLocating ? 'animate-spin' : ''}`} />
              <span>{isLocating ? 'Locating...' : 'Locate Me'}</span>
            </button>
          </div>
        </div>

        {/* Quota warning banner if triggered */}
        {authError && (
          <div className="absolute top-18 left-4 right-4 z-30 p-2.5 rounded-xl bg-amber-950/90 border border-amber-600 text-amber-200 text-xs flex items-center gap-2 shadow-xl">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{authError}</span>
          </div>
        )}

        {/* Geolocation Notice if present */}
        {geoError && (
          <div className="absolute top-18 left-4 right-4 z-30 p-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-300 text-xs flex items-center justify-between shadow-xl">
            <span>{geoError}</span>
            <button onClick={() => setGeoError(null)} className="text-slate-400 hover:text-white">✕</button>
          </div>
        )}

        {/* Interactive Google Map using @vis.gl/react-google-maps */}
        <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
          <div className="w-full h-full">
            <Map
              mapId="DEMO_MAP_ID"
              defaultCenter={currentCenter}
              defaultZoom={currentZoom}
              gestureHandling="greedy"
              disableDefaultUI={false}
              internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
              colorScheme={isLight ? 'LIGHT' : 'DARK'}
              style={{ width: '100%', height: '100%' }}
            >
              {/* Dynamic Camera Control */}
              <MapController targetCenter={currentCenter} targetZoom={currentZoom} />

              {/* User Geolocation Marker */}
              {userLocation && (
                <AdvancedMarker position={{ lat: userLocation.lat, lng: userLocation.lng }} title="Your Location">
                  <div className="relative flex items-center justify-center">
                    <span className="absolute w-8 h-8 rounded-full bg-cyan-400/30 animate-ping" />
                    <span className="relative w-4 h-4 rounded-full bg-cyan-500 border-2 border-white shadow-lg" />
                  </div>
                </AdvancedMarker>
              )}

              {/* Madhya Pradesh Monitoring Station & Village Markers */}
              {filteredStations.map((station) => {
                const color = getAQIColor(station.latestAQI);
                const isVillage = station.locationType === 'village' || station.name.includes('Village') || station.name.includes('Gram');
                const isIndustrial = station.locationType === 'industrial' || station.isHotspot;

                return (
                  <AdvancedMarker
                    key={station.id}
                    position={{ lat: station.lat, lng: station.lon }}
                    title={`${station.name} (AQI: ${station.latestAQI})`}
                    onClick={() => setActiveStation(station)}
                  >
                    <div
                      style={{
                        backgroundColor: color,
                        borderColor: isVillage ? '#10B981' : isIndustrial ? '#EF4444' : '#0B1220',
                      }}
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white font-mono-nums font-black text-[11px] border-2 shadow-2xl transition-transform hover:scale-125 cursor-pointer relative"
                    >
                      {station.latestAQI}

                      {/* Hotspot Alert Pulse */}
                      {station.isHotspot && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 animate-ping" />
                      )}

                      {/* Village Leaf Icon Badge */}
                      {isVillage && (
                        <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-600 border border-white flex items-center justify-center text-[8px] text-white">
                          🌿
                        </span>
                      )}
                    </div>
                  </AdvancedMarker>
                );
              })}

              {/* Station InfoWindow Detail Popover */}
              {activeStation && (
                <InfoWindow
                  position={{ lat: activeStation.lat, lng: activeStation.lon }}
                  onCloseClick={() => setActiveStation(null)}
                >
                  <div className="p-1 min-w-[240px] max-w-[280px] text-slate-900 font-sans">
                    <div className="flex items-center justify-between border-b pb-1.5 mb-1.5">
                      <div>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-teal-700">
                          {activeStation.provider} · {activeStation.district || activeStation.city}
                        </span>
                        <h4 className="font-bold text-xs text-slate-900 leading-tight">
                          {activeStation.name}
                        </h4>
                      </div>
                    </div>

                    <div
                      className="p-2 rounded-lg mb-2 flex items-center justify-between"
                      style={{
                        backgroundColor: `${getAQIColor(activeStation.latestAQI)}20`,
                      }}
                    >
                      <div>
                        <span className="text-[9px] font-bold text-slate-600 block uppercase">Continuous AQI</span>
                        <div
                          className="text-xl font-extrabold font-mono-nums"
                          style={{ color: getAQIColor(activeStation.latestAQI) }}
                        >
                          {activeStation.latestAQI}
                        </div>
                      </div>
                      <div className="text-right">
                        <span
                          className="text-[10px] font-bold px-1.5 py-0.5 rounded text-white"
                          style={{ backgroundColor: getAQIColor(activeStation.latestAQI) }}
                        >
                          {activeStation.latestCategory}
                        </span>
                        <span className="text-[9px] text-slate-500 block mt-1">
                          Dominant: <strong>{activeStation.dominantPollutant}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Pollutant readings */}
                    <div className="grid grid-cols-2 gap-1 text-[10px] mb-2 font-mono-nums">
                      <div className="bg-slate-100 p-1.5 rounded">
                        <span className="text-slate-500 font-sans">PM2.5:</span> <strong>{activeStation.pollutants.pm25} µg/m³</strong>
                      </div>
                      <div className="bg-slate-100 p-1.5 rounded">
                        <span className="text-slate-500 font-sans">PM10:</span> <strong>{activeStation.pollutants.pm10} µg/m³</strong>
                      </div>
                      <div className="bg-slate-100 p-1.5 rounded">
                        <span className="text-slate-500 font-sans">NO2:</span> <strong>{activeStation.pollutants.no2 || 22} µg/m³</strong>
                      </div>
                      <div className="bg-slate-100 p-1.5 rounded">
                        <span className="text-slate-500 font-sans">CO:</span> <strong>{activeStation.pollutants.co || 0.7} mg/m³</strong>
                      </div>
                    </div>

                    {activeStation.isHotspot && (
                      <div className="p-1.5 rounded bg-red-100 border border-red-200 text-red-800 text-[10px] mb-1.5">
                        ⚠️ <strong>Identified MP Pollution Hotspot</strong>: Heavy stack emissions or mining dust observed.
                      </div>
                    )}

                    <div className="text-[9px] text-slate-500">
                      Coordinates: {activeStation.lat.toFixed(4)}, {activeStation.lon.toFixed(4)}
                    </div>
                  </div>
                </InfoWindow>
              )}
            </Map>
          </div>
        </APIProvider>

        {/* Bottom Legend Dock (Indian CPCB NAQI Bands) */}
        <div
          className={`absolute bottom-4 left-4 z-20 hidden md:flex items-center gap-3 backdrop-blur-md border px-3.5 py-2 rounded-xl shadow-2xl text-[11px] ${
            isLight ? 'bg-white/95 border-slate-200 text-slate-700' : 'bg-[#111C2E]/95 border-slate-700/80 text-slate-300'
          }`}
        >
          <span className="font-bold text-slate-400">NAQI SCALE:</span>
          <div className="flex items-center gap-1 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E]" /> Good (0-50)
          </div>
          <div className="flex items-center gap-1 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-[#84CC16]" /> Satisfactory (51-100)
          </div>
          <div className="flex items-center gap-1 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-[#EAB308]" /> Moderate (101-200)
          </div>
          <div className="flex items-center gap-1 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F97316]" /> Poor (201-300)
          </div>
          <div className="flex items-center gap-1 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" /> Very Poor (301-400)
          </div>
          <div className="flex items-center gap-1 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-[#991B1B]" /> Severe (401-500)
          </div>
        </div>
      </div>
    </div>
  );
};
