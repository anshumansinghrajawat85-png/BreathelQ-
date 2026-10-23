import React from 'react';
import { RefreshCw, Bell, Sun, Moon, MapPin, CheckCircle2, Settings, ShieldCheck, Sparkles } from 'lucide-react';
import { LocationInfo } from '../types';
import { getAQIColor, getAQICategory } from '../utils/aqiUtils';
import { BrandLogo } from './BrandLogo';

interface HeaderProps {
  locations: LocationInfo[];
  selectedCity: string;
  onSelectCity: (cityId: string) => void;
  lastUpdated: string;
  isRefreshing: boolean;
  onRefresh: () => void;
  unreadAlerts: number;
  onOpenAlerts: () => void;
  onOpenSettings?: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  currentAQI?: number;
}

export const Header: React.FC<HeaderProps> = ({
  locations,
  selectedCity,
  onSelectCity,
  lastUpdated,
  isRefreshing,
  onRefresh,
  unreadAlerts,
  onOpenAlerts,
  onOpenSettings,
  theme,
  onToggleTheme,
  currentAQI = 168,
}) => {
  const isLight = theme === 'light';
  const aqiColor = getAQIColor(currentAQI);
  const aqiCat = getAQICategory(currentAQI);

  // Categorize MP locations
  const cities = locations.filter((l) => l.locationType === 'city' || (!l.locationType && !l.name.includes('Village') && !l.name.includes('Industrial')));
  const industrial = locations.filter((l) => l.locationType === 'industrial' || l.name.includes('Industrial') || l.name.includes('Energy'));
  const villages = locations.filter((l) => l.locationType === 'village' || l.name.includes('Village') || l.name.includes('Gram'));

  return (
    <header
      className={`w-full border-b backdrop-blur-xl px-4 sm:px-6 lg:px-8 py-3.5 transition-colors z-30 ${
        isLight
          ? 'bg-white/95 border-slate-200/90 shadow-xs text-slate-800'
          : 'bg-[#0B1220]/95 border-slate-800/80 text-white shadow-xl shadow-black/40'
      }`}
    >
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Brand Lockup: Logo + Website Name on Top Left */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BrandLogo layout="horizontal" size="md" showTagline={true} theme={theme} />
          </div>

          {/* Mobile Right Actions */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={onToggleTheme}
              title={`Switch to ${isLight ? 'dark' : 'light'} mode`}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                  : 'bg-[#121E33] hover:bg-slate-800 text-slate-300 border-slate-700/80'
              }`}
            >
              {isLight ? <Moon className="w-4 h-4 text-cyan-600" /> : <Sun className="w-4 h-4 text-amber-400" />}
            </button>

            {onOpenSettings && (
              <button
                onClick={onOpenSettings}
                title="Settings"
                className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                  isLight
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                    : 'bg-[#121E33] hover:bg-slate-800 text-slate-300 border-slate-700/80'
                }`}
              >
                <Settings className="w-4 h-4 text-slate-400" />
              </button>
            )}
          </div>
        </div>

        {/* Center/Right Executive Controls */}
        <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3">
          {/* Location Selector (MP Cities, Industrial Hubs & Rural Villages) */}
          <div
            className={`flex items-center gap-2.5 rounded-xl px-3 py-1.5 border shadow-xs transition-colors ${
              isLight
                ? 'bg-slate-50 border-slate-200 text-slate-900'
                : 'bg-[#111C2E] border-slate-700/80 text-white'
            }`}
          >
            <MapPin className="w-4 h-4 text-cyan-500 shrink-0" />
            <div className="flex flex-col">
              <span
                className={`text-[8.5px] font-bold tracking-wider uppercase leading-none ${
                  isLight ? 'text-teal-700' : 'text-cyan-400'
                }`}
              >
                MADHYA PRADESH REGION
              </span>
              <select
                value={selectedCity}
                onChange={(e) => onSelectCity(e.target.value)}
                className="bg-transparent text-xs font-bold focus:outline-none cursor-pointer pr-3 pt-0.5 max-w-[210px] truncate"
              >
                <optgroup label="Madhya Pradesh Major Cities">
                  {cities.map((loc) => (
                    <option
                      key={loc.id}
                      value={loc.id}
                      className={isLight ? 'bg-white text-slate-900' : 'bg-[#111C2E] text-white'}
                    >
                      {loc.name} {loc.district ? `(${loc.district})` : ''}
                    </option>
                  ))}
                </optgroup>

                {industrial.length > 0 && (
                  <optgroup label="Industrial Corridors & Pollution Hotspots">
                    {industrial.map((loc) => (
                      <option
                        key={loc.id}
                        value={loc.id}
                        className={isLight ? 'bg-white text-slate-900' : 'bg-[#111C2E] text-white'}
                      >
                        ⚠️ {loc.name}
                      </option>
                    ))}
                  </optgroup>
                )}

                {villages.length > 0 && (
                  <optgroup label="Rural Villages & Gram Panchayats">
                    {villages.map((loc) => (
                      <option
                        key={loc.id}
                        value={loc.id}
                        className={isLight ? 'bg-white text-slate-900' : 'bg-[#111C2E] text-white'}
                      >
                        🌿 {loc.name}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>
          </div>

          {/* Live AQI Indicator Badge */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border shadow-xs ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#111C2E] border-slate-700/80'
            }`}
          >
            <div
              className="w-2.5 h-2.5 rounded-full animate-pulse shadow-sm"
              style={{ backgroundColor: aqiColor }}
            />
            <div className="text-xs">
              <span className={`text-[10px] uppercase font-bold mr-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                LIVE AQI:
              </span>
              <span className="font-mono-nums font-extrabold text-sm" style={{ color: aqiColor }}>
                {currentAQI}
              </span>
              <span
                className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded"
                style={{
                  backgroundColor: `${aqiColor}20`,
                  color: aqiColor,
                }}
              >
                {aqiCat}
              </span>
            </div>
          </div>

          {/* Telemetry Status Indicator */}
          <div
            className={`hidden xl:flex items-center gap-2 text-xs px-2.5 py-1 rounded-lg ${
              isLight ? 'text-slate-500 bg-slate-100/70' : 'text-slate-400 bg-slate-900/60'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>
              Updated:{' '}
              <span className={`font-mono-nums font-semibold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                {lastUpdated || 'Live'}
              </span>
            </span>
          </div>

          {/* Refresh Action */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Refresh MP Environmental Telemetry"
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer disabled:opacity-50 ${
              isLight
                ? 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-300 shadow-xs'
                : 'bg-[#111C2E] hover:bg-slate-800 text-slate-200 hover:text-white border-slate-700/80'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* Alerts Bell Action */}
          <button
            onClick={onOpenAlerts}
            title="View Active Environmental Alerts"
            className={`relative p-2 rounded-xl border transition-colors cursor-pointer ${
              isLight
                ? 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-300 shadow-xs'
                : 'bg-[#111C2E] hover:bg-slate-800 text-slate-200 hover:text-white border-slate-700/80'
            }`}
          >
            <Bell className="w-4 h-4 text-amber-400" />
            {unreadAlerts > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center font-mono-nums shadow-sm animate-pulse">
                {unreadAlerts}
              </span>
            )}
          </button>

          {/* Desktop Theme Switcher */}
          <button
            onClick={onToggleTheme}
            title={`Switch to ${isLight ? 'dark' : 'light'} mode`}
            className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300 shadow-xs'
                : 'bg-[#111C2E] hover:bg-slate-800 text-slate-200 border-slate-700/80'
            }`}
          >
            {isLight ? (
              <>
                <Moon className="w-3.5 h-3.5 text-cyan-600" />
                <span className="text-xs font-bold">Dark</span>
              </>
            ) : (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs font-bold">Light</span>
              </>
            )}
          </button>

          {/* Desktop Settings Shortcut */}
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              title="Platform Settings"
              className={`hidden lg:flex items-center gap-1.5 p-2 rounded-xl border transition-colors cursor-pointer ${
                isLight
                  ? 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-300'
                  : 'bg-[#111C2E] hover:bg-slate-800 text-slate-200 border-slate-700/80'
              }`}
            >
              <Settings className="w-4 h-4 text-slate-400 hover:rotate-45 transition-transform" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
