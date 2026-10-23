import React, { useState, useEffect } from 'react';
import { LocationInfo } from '../../types';
import { fetchHealth } from '../../services/api';
import {
  Settings,
  Sun,
  Moon,
  MapPin,
  Thermometer,
  Bell,
  RefreshCw,
  Shield,
  Activity,
  CheckCircle2,
  Cpu,
  Map,
  Compass,
} from 'lucide-react';

interface SettingsPageProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  locations: LocationInfo[];
  selectedCity: string;
  onSelectCity: (cityId: string) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  theme,
  onToggleTheme,
  locations,
  selectedCity,
  onSelectCity,
}) => {
  const isLight = theme === 'light';
  const [tempUnit, setTempUnit] = useState<'C' | 'F'>('C');
  const [refreshInterval, setRefreshInterval] = useState<string>('30s');
  const [soundAlerts, setSoundAlerts] = useState<boolean>(true);
  const [backendHealth, setBackendHealth] = useState<any>(null);
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    fetchHealth().then((h) => setBackendHealth(h));
  }, []);

  const handleSaveSettings = () => {
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const cities = locations.filter((l) => l.locationType === 'city' || (!l.locationType && !l.name.includes('Village') && !l.name.includes('Industrial')));
  const industrial = locations.filter((l) => l.locationType === 'industrial' || l.name.includes('Industrial') || l.name.includes('Energy'));
  const villages = locations.filter((l) => l.locationType === 'village' || l.name.includes('Village') || l.name.includes('Gram'));

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className={`border-b pb-4 ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
        <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-cyan-500 uppercase">
          <Settings className="w-4 h-4" />
          <span>MADHYA PRADESH ENVIRONMENTAL SYSTEM PREFERENCES</span>
        </div>
        <h2 className={`text-xl md:text-2xl font-black mt-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
          Platform Configuration & Telemetry Settings
        </h2>
        <p className={`text-xs mt-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
          Configure MP default monitoring nodes, Google Maps cartography layers, telemetry auto-polling, and theme options.
        </p>
      </div>

      <div className="space-y-4 text-xs">
        {/* Preference Section 1: Appearance & Default City */}
        <div
          className={`p-5 rounded-2xl border shadow-xl space-y-4 transition-colors ${
            isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#111C2E] border-slate-800 text-white'
          }`}
        >
          <h3 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
            1. Display & Default Madhya Pradesh Node
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Theme Toggle */}
            <div
              className={`p-3.5 rounded-xl border flex items-center justify-between ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'
              }`}
            >
              <div>
                <strong className={`block font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Interface Color Theme
                </strong>
                <span className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Dark mode for high-contrast monitoring, Light mode for reports
                </span>
              </div>
              <button
                onClick={onToggleTheme}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border font-bold transition-all cursor-pointer ${
                  isLight
                    ? 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300 shadow-xs'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                }`}
              >
                {theme === 'dark' ? (
                  <Moon className="w-3.5 h-3.5 text-cyan-400" />
                ) : (
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                )}
                <span className="capitalize">{theme} Theme</span>
              </button>
            </div>

            {/* Default MP Location */}
            <div
              className={`p-3.5 rounded-xl border flex items-center justify-between ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'
              }`}
            >
              <div>
                <strong className={`block font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Default MP Region
                </strong>
                <span className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Selected on startup
                </span>
              </div>
              <select
                value={selectedCity}
                onChange={(e) => onSelectCity(e.target.value)}
                className={`border rounded-lg px-2.5 py-1.5 text-xs font-bold focus:outline-none cursor-pointer max-w-[170px] truncate ${
                  isLight
                    ? 'bg-white border-slate-300 text-slate-900'
                    : 'bg-slate-800 border-slate-700 text-white'
                }`}
              >
                <optgroup label="MP Major Cities">
                  {cities.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Industrial Corridors">
                  {industrial.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      ⚠️ {loc.name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Rural Villages / Panchayats">
                  {villages.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      🌿 {loc.name}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>
          </div>
        </div>

        {/* Preference Section 2: Units & Auto-Refresh */}
        <div
          className={`p-5 rounded-2xl border shadow-xl space-y-4 transition-colors ${
            isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#111C2E] border-slate-800 text-white'
          }`}
        >
          <h3 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
            2. Telemetry Units & Auto-Polling
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Temperature Unit */}
            <div
              className={`p-3.5 rounded-xl border space-y-2 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'
              }`}
            >
              <span className={`font-semibold block ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                Temperature Unit
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setTempUnit('C')}
                  className={`flex-1 py-1.5 rounded-lg font-bold border cursor-pointer ${
                    tempUnit === 'C'
                      ? 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border-cyan-500/40'
                      : isLight
                      ? 'bg-white text-slate-600 border-slate-300'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  Celsius (°C)
                </button>
                <button
                  onClick={() => setTempUnit('F')}
                  className={`flex-1 py-1.5 rounded-lg font-bold border cursor-pointer ${
                    tempUnit === 'F'
                      ? 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border-cyan-500/40'
                      : isLight
                      ? 'bg-white text-slate-600 border-slate-300'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  Fahrenheit (°F)
                </button>
              </div>
            </div>

            {/* Refresh Cadence */}
            <div
              className={`p-3.5 rounded-xl border space-y-2 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'
              }`}
            >
              <span className={`font-semibold block ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                Background Telemetry Rate
              </span>
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(e.target.value)}
                className={`w-full border rounded-lg p-1.5 font-bold focus:outline-none cursor-pointer ${
                  isLight
                    ? 'bg-white border-slate-300 text-slate-900'
                    : 'bg-slate-800 border-slate-700 text-white'
                }`}
              >
                <option value="15s">15 Seconds (Rapid)</option>
                <option value="30s">30 Seconds (Default)</option>
                <option value="45s">45 Seconds</option>
                <option value="off">Manual Only</option>
              </select>
            </div>

            {/* Sound Alerts */}
            <div
              className={`p-3.5 rounded-xl border space-y-2 flex flex-col justify-between ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'
              }`}
            >
              <div>
                <span className={`font-semibold block ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  Severe Spike Audio Chimes
                </span>
                <span className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
                  Tone on Severe AQI &gt; 400
                </span>
              </div>
              <button
                onClick={() => setSoundAlerts(!soundAlerts)}
                className={`w-full py-1.5 rounded-lg font-bold border cursor-pointer ${
                  soundAlerts
                    ? 'bg-teal-500/20 text-teal-800 dark:text-teal-300 border-teal-500/40'
                    : isLight
                    ? 'bg-white text-slate-500 border-slate-300'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {soundAlerts ? 'Audio Chimes Enabled' : 'Muted'}
              </button>
            </div>
          </div>
        </div>

        {/* Backend Diagnostics & Health Audit */}
        <div
          className={`p-5 rounded-2xl border shadow-xl space-y-3 transition-colors ${
            isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#111C2E] border-slate-800 text-white'
          }`}
        >
          <div className="flex items-center justify-between">
            <h3 className={`text-sm font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              <Cpu className="w-4 h-4 text-cyan-500" />
              <span>Madhya Pradesh Telemetry & Google Maps Diagnostics</span>
            </h3>
            <span className="text-[10px] text-emerald-500 flex items-center gap-1 font-mono-nums font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" /> CAAQMS Connected
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono-nums text-[11px]">
            <div className={`p-3 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
              <span className={`block font-sans text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
                API Engine
              </span>
              <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {backendHealth?.system || 'AirPredict AI Platform'}
              </span>
            </div>
            <div className={`p-3 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
              <span className={`block font-sans text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
                Cartography Service
              </span>
              <span className="text-teal-600 dark:text-teal-300 font-bold">
                Google Maps Platform (@vis.gl)
              </span>
            </div>
            <div className={`p-3 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
              <span className={`block font-sans text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
                MP Coverage
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                Cities, Industrial & Rural Villages
              </span>
            </div>
          </div>
        </div>

        {/* Save CTA */}
        <div className="flex items-center justify-between pt-2">
          {savedNotice ? (
            <span className="text-emerald-500 font-bold flex items-center gap-1.5 font-mono-nums">
              <CheckCircle2 className="w-4 h-4" /> Preferences applied to active session
            </span>
          ) : (
            <div />
          )}
          <button
            onClick={handleSaveSettings}
            className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl transition-colors cursor-pointer shadow-md shadow-cyan-500/20"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};
