import React, { useState, useEffect, useCallback } from 'react';
import { Navigation, NavTab } from './components/Navigation';
import { Header } from './components/Header';
import { HomePage } from './components/pages/HomePage';
import { DashboardPage } from './components/pages/DashboardPage';
import { LiveMapPage } from './components/pages/LiveMapPage';
import { ForecastPage } from './components/pages/ForecastPage';
import { AnalyticsPage } from './components/pages/AnalyticsPage';
import { SensorsPage } from './components/pages/SensorsPage';
import { AnomaliesPage } from './components/pages/AnomaliesPage';
import { AlertsPage } from './components/pages/AlertsPage';
import { AIAssistantPage } from './components/pages/AIAssistantPage';
import { ChartSheetPage } from './components/pages/ChartSheetPage';
import { HistoricalDataPage } from './components/pages/HistoricalDataPage';
import { MethodologyPage } from './components/pages/MethodologyPage';
import { SettingsPage } from './components/pages/SettingsPage';
import { AIChatLogo } from './components/common/AIChatLogo';
import {
  LocationInfo,
  ObservationRecord,
  MonitoringStation,
  ForecastPoint,
  ModelMetrics,
  IoTSensor,
  AnomalyRecord,
  AlertRecord,
} from './types';
import {
  fetchLocations,
  fetchObservations,
  fetchStations,
  fetchForecast,
  fetchSensors,
  fetchAnomalies,
  fetchAlerts,
} from './services/api';
import { Bot, TreePine, Flame, Activity, ShieldCheck } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [selectedCity, setSelectedCity] = useState<string>('bhopal');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  // Platform state
  const [locations, setLocations] = useState<LocationInfo[]>([]);
  const [observations, setObservations] = useState<ObservationRecord[]>([]);
  const [latestObs, setLatestObs] = useState<ObservationRecord | null>(null);
  const [stations, setStations] = useState<MonitoringStation[]>([]);
  const [forecast, setForecast] = useState<ForecastPoint[]>([]);
  const [modelMetrics, setModelMetrics] = useState<ModelMetrics | undefined>(undefined);
  const [sensors, setSensors] = useState<IoTSensor[]>([]);
  const [anomalies, setAnomalies] = useState<AnomalyRecord[]>([]);
  const [alerts, setAlerts] = useState<AlertRecord[]>([]);

  // Load all platform data
  const loadPlatformData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [locs, obsData, stns, fcData, sens, anoms, alts] = await Promise.all([
        fetchLocations(),
        fetchObservations(selectedCity, 48),
        fetchStations(selectedCity),
        fetchForecast(selectedCity, 72),
        fetchSensors(),
        fetchAnomalies(),
        fetchAlerts(),
      ]);

      setLocations(locs);
      setObservations(obsData.observations);
      setLatestObs(obsData.latest);
      setStations(stns);
      setForecast(fcData.forecast);
      setModelMetrics(fcData.modelMetrics);
      setSensors(sens);
      setAnomalies(anoms);
      setAlerts(alts);
      setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err) {
      console.error('Error loading platform data:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [selectedCity]);

  useEffect(() => {
    loadPlatformData();
  }, [loadPlatformData]);

  // Periodic poll every 45s
  useEffect(() => {
    const timer = setInterval(() => {
      loadPlatformData();
    }, 45000);
    return () => clearInterval(timer);
  }, [loadPlatformData]);

  // Synchronize document theme class
  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.remove('dark');
      document.body.className = 'bg-slate-50 text-slate-900 antialiased selection:bg-cyan-500/20 selection:text-cyan-800';
    } else {
      document.documentElement.classList.add('dark');
      document.body.className = 'bg-[#0B1220] text-[#F8FAFC] antialiased selection:bg-cyan-500/20 selection:text-cyan-300';
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const unreadAlerts = alerts.filter((a) => a.status === 'Active').length;
  const currentCityName = locations.find((l) => l.id === selectedCity)?.name || 'Bhopal';

  return (
    <div className={`min-h-screen flex flex-col ${theme === 'dark' ? 'bg-[#0B1220] text-[#F8FAFC]' : 'bg-slate-50 text-slate-900'}`}>
      {/* 1. Executive Top Header (Brand, City/Village Selector, AQI Badge, Theme Toggle, Settings) */}
      <Header
        locations={locations}
        selectedCity={selectedCity}
        onSelectCity={(cityId) => setSelectedCity(cityId)}
        lastUpdated={lastUpdated}
        isRefreshing={isRefreshing}
        onRefresh={loadPlatformData}
        unreadAlerts={unreadAlerts}
        onOpenAlerts={() => setActiveTab('alerts')}
        onOpenSettings={() => setActiveTab('settings')}
        theme={theme}
        onToggleTheme={toggleTheme}
        currentAQI={latestObs?.aqi || 168}
      />

      {/* 2. Full Top Navigation Bar (All Icons on Top) */}
      <Navigation
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        alertCount={unreadAlerts}
        anomalyCount={anomalies.length}
        theme={theme}
      />

      {/* 3. Madhya Pradesh Environmental Telemetry State Ticker */}
      <div
        className={`w-full border-b px-4 sm:px-6 lg:px-8 py-2 text-[11px] font-medium transition-colors ${
          theme === 'light'
            ? 'bg-teal-50/70 border-teal-100 text-teal-900'
            : 'bg-[#070D18] border-slate-800/80 text-slate-300'
        }`}
      >
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-4 overflow-x-auto scrollbar-none">
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-bold">MP Continuous Network:</span>
              <span className="font-mono-nums font-semibold">{stations.length} Active Stations</span>
            </div>

            <span className="text-slate-400">·</span>

            <div className="flex items-center gap-1.5 shrink-0">
              <TreePine className="w-3.5 h-3.5 text-emerald-500" />
              <span>Cleanest Eco-Zone:</span>
              <strong className="text-emerald-500 font-mono-nums">Pachmarhi Biosphere (AQI 34 - Good)</strong>
            </div>

            <span className="text-slate-400">·</span>

            <div className="flex items-center gap-1.5 shrink-0">
              <Flame className="w-3.5 h-3.5 text-red-500" />
              <span>Critical Hotspot:</span>
              <strong className="text-red-400 font-mono-nums">Singrauli Coal Belt (AQI 285)</strong>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 text-slate-400 text-[10px]">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>CPCB National Ambient Air Quality Index (NAQI) Standard</span>
          </div>
        </div>
      </div>

      {/* 4. Active Page View Container */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
        {activeTab === 'home' && (
          <HomePage
            city={currentCityName}
            latestObservation={latestObs}
            onNavigateToTab={(tab) => setActiveTab(tab)}
            theme={theme}
          />
        )}

        {activeTab === 'dashboard' && (
          <DashboardPage
            city={currentCityName}
            observations={observations}
            stations={stations}
            forecast={forecast}
            onNavigateToTab={(tab) => setActiveTab(tab)}
            theme={theme}
          />
        )}

        {activeTab === 'map' && (
          <LiveMapPage stations={stations} selectedCity={selectedCity} theme={theme} />
        )}

        {activeTab === 'forecast' && (
          <ForecastPage
            city={currentCityName}
            observed={observations}
            forecast={forecast}
            modelMetrics={modelMetrics}
            theme={theme}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsPage city={selectedCity} observations={observations} theme={theme} />
        )}

        {activeTab === 'sensors' && (
          <SensorsPage sensors={sensors} onRefreshSensors={loadPlatformData} theme={theme} />
        )}

        {activeTab === 'anomalies' && <AnomaliesPage anomalies={anomalies} theme={theme} />}

        {activeTab === 'alerts' && (
          <AlertsPage alerts={alerts} onRefreshAlerts={loadPlatformData} theme={theme} />
        )}

        {activeTab === 'assistant' && (
          <AIAssistantPage city={currentCityName} latestObservation={latestObs} theme={theme} />
        )}

        {activeTab === 'historical' && (
          <HistoricalDataPage observations={observations} city={currentCityName} theme={theme} />
        )}

        {activeTab === 'methodology' && <MethodologyPage theme={theme} />}

        {activeTab === 'settings' && (
          <SettingsPage
            theme={theme}
            onToggleTheme={toggleTheme}
            locations={locations}
            selectedCity={selectedCity}
            onSelectCity={(c) => setSelectedCity(c)}
          />
        )}
      </main>

      {/* Floating AI Assistant Quick Trigger (Available across all pages) */}
      {activeTab !== 'assistant' && (
        <button
          onClick={() => setActiveTab('assistant')}
          title="Open AirPredict MP AI Environmental Assistant"
          className="fixed bottom-6 right-6 z-40 p-3.5 bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 font-bold rounded-full shadow-2xl hover:scale-105 transition-all flex items-center gap-2 cursor-pointer border border-cyan-300"
        >
          <Bot className="w-5 h-5 text-slate-950" />
          <span className="hidden sm:inline text-xs font-bold tracking-tight">MP AI Assistant</span>
        </button>
      )}
    </div>
  );
}
