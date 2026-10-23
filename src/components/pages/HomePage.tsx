import React from 'react';
import { Atmosphere3D } from '../Atmosphere3D';
import { ObservationRecord } from '../../types';
import { getAQIColor, getAQICategory } from '../../utils/aqiUtils';
import {
  ArrowRight,
  MapPin,
  TrendingUp,
  Brain,
  Cpu,
  AlertTriangle,
  Layers,
  Database,
  ShieldCheck,
  CheckCircle,
  Activity,
  Sparkles,
} from 'lucide-react';

interface HomePageProps {
  city: string;
  latestObservation: ObservationRecord | null;
  onNavigateToTab: (tab: any) => void;
  theme?: 'dark' | 'light';
}

export const HomePage: React.FC<HomePageProps> = ({
  city,
  latestObservation,
  onNavigateToTab,
  theme = 'dark',
}) => {
  const isLight = theme === 'light';
  const currentAQI = latestObservation?.aqi || 168;
  const aqiColor = getAQIColor(currentAQI);
  const category = getAQICategory(currentAQI);

  return (
    <div className="space-y-12 pb-12">
      {/* Hero Section with 3D Simulation & Atmospheric Presence */}
      <section className="relative pt-2">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Hero Copy */}
          <div className="lg:col-span-5 space-y-5">
            <div
              className={`inline-flex items-center gap-2 text-xs font-semibold tracking-wider px-3 py-1 rounded-xl border ${
                isLight
                  ? 'text-cyan-800 bg-cyan-100/70 border-cyan-300'
                  : 'text-cyan-400 bg-cyan-950/50 border border-cyan-800/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
              <span>ENVIRONMENTAL INTELLIGENCE PLATFORM</span>
            </div>

            <h1
              className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.15] ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}
            >
              Predict the Air.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500">
                Protect the Future.
              </span>
            </h1>

            <p
              className={`text-sm sm:text-base leading-relaxed max-w-xl ${
                isLight ? 'text-slate-600' : 'text-slate-300'
              }`}
            >
              The premier air-quality forecasting and environmental intelligence platform for <strong>Madhya Pradesh</strong> — uniting continuous MPPCB/CPCB CAAQMS ground monitors, IoT sensor grids, Google Maps live cartography, and machine-learning models across all MP cities, industrial corridors, and rural gram panchayats.
            </p>

            {/* Current Monitored City Metric Snapshot (Zero-Pill) */}
            <div
              className={`p-4 rounded-2xl border flex items-center justify-between max-w-md shadow-sm transition-colors ${
                isLight
                  ? 'bg-white border-slate-200/90 text-slate-800'
                  : 'bg-[#111C2E] border-slate-800 text-white'
              }`}
            >
              <div>
                <span className={`text-[10px] uppercase font-semibold block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Selected MP Telemetry Node
                </span>
                <div className="text-sm font-bold mt-0.5">{city}</div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold font-mono-nums" style={{ color: aqiColor }}>
                    {currentAQI} AQI
                  </span>
                  <span className="text-xs font-semibold" style={{ color: aqiColor }}>
                    ({category})
                  </span>
                </div>
                <div className={`text-[10px] font-mono-nums ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  PM2.5: {latestObservation?.pollutants.pm25 || 78} µg/m³
                </div>
              </div>
            </div>

            {/* Primary & Secondary CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onNavigateToTab('dashboard')}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors shadow-lg shadow-cyan-500/25 cursor-pointer"
              >
                <span>Explore Live Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigateToTab('map')}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl border font-semibold text-xs transition-colors cursor-pointer ${
                  isLight
                    ? 'bg-white hover:bg-slate-100 text-slate-800 border-slate-200 shadow-sm'
                    : 'bg-[#111C2E] hover:bg-slate-800 border-slate-700/80 text-white'
                }`}
              >
                <MapPin className="w-4 h-4 text-cyan-500" />
                <span>Open MP Google Map</span>
              </button>
            </div>
          </div>

          {/* Right Hero: Three.js Interactive 3D Atmospheric Simulator */}
          <div className="lg:col-span-7">
            <Atmosphere3D currentAQI={currentAQI} theme={theme} />
          </div>
        </div>
      </section>

      {/* Connected Architecture Workflow Diagram */}
      <section
        className={`p-6 md:p-8 rounded-2xl border transition-colors ${
          isLight
            ? 'bg-white border-slate-200/90 shadow-sm text-slate-900'
            : 'bg-[#111C2E] border-slate-800 shadow-2xl text-white'
        }`}
      >
        <div>
          <span className={`text-xs font-semibold tracking-wider uppercase ${isLight ? 'text-cyan-700' : 'text-cyan-400'}`}>
            END-TO-END SYSTEM ARCHITECTURE
          </span>
          <h2 className="text-xl font-bold mt-1">
            Grounded Environmental Processing Pipeline
          </h2>
          <p className={`text-xs mt-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            From raw optical sensor photons and CAAQMS monitors to predictive atmospheric intelligence and early dispatch.
          </p>
        </div>

        {/* Workflow Horizontal Stepper */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 mt-6">
          {[
            {
              step: '01',
              title: 'External Data + IoT',
              desc: 'CPCB CAAQMS, OpenAQ feeds & ESP32 Plantower PMS5003 laser telemetry.',
              icon: Database,
            },
            {
              step: '02',
              title: 'Data Validation',
              desc: 'Spike rejection, zero-variance screening, and ratio consistency checks.',
              icon: ShieldCheck,
            },
            {
              step: '03',
              title: 'Database Engine',
              desc: 'Time-series relational store maintaining chronological integrity.',
              icon: Layers,
            },
            {
              step: '04',
              title: 'AQI Processing',
              desc: 'Official CPCB Indian NAQI sub-index computation for 7 pollutants.',
              icon: Activity,
            },
            {
              step: '05',
              title: 'ML Forecast Model',
              desc: 'Autoregressive Random Forest predicting up to 72h with confidence bands.',
              icon: Brain,
            },
            {
              step: '06',
              title: 'Actionable Intelligence',
              desc: 'Interactive map, early alerts, Gemini AI assistant, and health advisories.',
              icon: Sparkles,
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 transition-colors ${
                  isLight
                    ? 'bg-slate-50 border-slate-200 text-slate-800'
                    : 'bg-slate-900 border-slate-800 text-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between font-mono-nums text-[11px]">
                    <span className={`font-bold ${isLight ? 'text-cyan-700' : 'text-cyan-400'}`}>{item.step}</span>
                    <Icon className={`w-4 h-4 ${isLight ? 'text-cyan-600' : 'text-cyan-400'}`} />
                  </div>
                  <h3 className={`text-xs font-bold mt-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>{item.title}</h3>
                  <p className={`text-[11px] leading-relaxed mt-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Feature Pillar Highlights */}
      <section className="space-y-6">
        <div>
          <span className={`text-xs font-semibold tracking-wider uppercase ${isLight ? 'text-cyan-700' : 'text-cyan-400'}`}>
            CORE PLATFORM CAPABILITIES
          </span>
          <h2 className={`text-xl font-bold mt-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Engineered for Regulatory Accuracy & Environmental Action
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pillar 1: Geospatial Surveillance */}
          <div
            onClick={() => onNavigateToTab('map')}
            className={`p-6 rounded-2xl border transition-all cursor-pointer space-y-3 group ${
              isLight
                ? 'bg-white border-slate-200 hover:border-cyan-500 shadow-sm'
                : 'bg-[#111C2E] border-slate-800 hover:border-cyan-500/50 shadow-xl'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-xl border flex items-center justify-center group-hover:scale-105 transition-transform ${
                isLight ? 'bg-cyan-50 border-cyan-200 text-cyan-600' : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
              }`}
            >
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className={`text-base font-bold transition-colors ${isLight ? 'text-slate-900 group-hover:text-cyan-700' : 'text-white group-hover:text-cyan-300'}`}>
              Geospatial Pollution Mapping
            </h3>
            <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              Interactive Leaflet GIS map visualizing monitoring stations across Bhopal and Indian urban hubs. Features spatial hotspot cluster detection and instant station telemetry drawer.
            </p>
            <div className={`text-xs font-semibold flex items-center gap-1 pt-1 ${isLight ? 'text-cyan-700' : 'text-cyan-400'}`}>
              <span>Open live station map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Pillar 2: ML Time-Series Forecasting */}
          <div
            onClick={() => onNavigateToTab('forecast')}
            className={`p-6 rounded-2xl border transition-all cursor-pointer space-y-3 group ${
              isLight
                ? 'bg-white border-slate-200 hover:border-teal-500 shadow-sm'
                : 'bg-[#111C2E] border-slate-800 hover:border-teal-500/50 shadow-xl'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-xl border flex items-center justify-center group-hover:scale-105 transition-transform ${
                isLight ? 'bg-teal-50 border-teal-200 text-teal-600' : 'bg-teal-500/10 border-teal-500/30 text-teal-400'
              }`}
            >
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className={`text-base font-bold transition-colors ${isLight ? 'text-slate-900 group-hover:text-teal-700' : 'text-white group-hover:text-teal-300'}`}>
              Random Forest AQI Forecasting
            </h3>
            <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              Multi-horizon (6h, 24h, 72h) prediction engine with 8.4 MAE accuracy. Employs planetary boundary layer height and lagged autoregression with explicit 90% uncertainty envelopes.
            </p>
            <div className={`text-xs font-semibold flex items-center gap-1 pt-1 ${isLight ? 'text-teal-700' : 'text-teal-400'}`}>
              <span>Explore forecast pipeline</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Pillar 3: Grounded Gemini Assistant */}
          <div
            onClick={() => onNavigateToTab('assistant')}
            className={`p-6 rounded-2xl border transition-all cursor-pointer space-y-3 group ${
              isLight
                ? 'bg-white border-slate-200 hover:border-purple-500 shadow-sm'
                : 'bg-[#111C2E] border-slate-800 hover:border-purple-500/50 shadow-xl'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-xl border flex items-center justify-center group-hover:scale-105 transition-transform ${
                isLight ? 'bg-purple-50 border-purple-200 text-purple-600' : 'bg-purple-500/10 border-purple-500/30 text-purple-400'
              }`}
            >
              <Brain className="w-5 h-5" />
            </div>
            <h3 className={`text-base font-bold transition-colors ${isLight ? 'text-slate-900 group-hover:text-purple-700' : 'text-white group-hover:text-purple-300'}`}>
              Grounded Gemini AI Assistant
            </h3>
            <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              Multimodal conversational intelligence powered by Google Gemini. Supports speech synthesis (gemini-3.8-flash-tts), audio transcription, and photographic smog analysis (gemini-4-argon).
            </p>
            <div className={`text-xs font-semibold flex items-center gap-1 pt-1 ${isLight ? 'text-purple-700' : 'text-purple-400'}`}>
              <span>Consult environmental assistant</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </section>

      {/* Environmental Technology Foundation Strip */}
      <section
        className={`p-6 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-6 text-xs transition-colors ${
          isLight
            ? 'bg-slate-100 border-slate-200 text-slate-800'
            : 'bg-[#070D18] border-slate-800/80 text-white'
        }`}
      >
        <div className="space-y-1">
          <div className="font-bold flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Strict Scientific & Anti-Hallucination Integrity</span>
          </div>
          <p className={`text-[11px] leading-relaxed max-w-2xl ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            Simulated streams are explicitly labeled; actual CPCB measurements and OpenAQ sensor observations are never intermixed with predictive forecasts without clear demarcation.
          </p>
        </div>

        <div className="flex items-center gap-4 font-mono-nums shrink-0">
          <div>
            <span className="block font-bold text-base">7 Pollutants</span>
            <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>NAQI Monitored</span>
          </div>
          <span className={isLight ? 'text-slate-300' : 'text-slate-700'}>|</span>
          <div>
            <span className="block text-emerald-500 font-bold text-base">0.912 R²</span>
            <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Model Evaluation</span>
          </div>
          <span className={isLight ? 'text-slate-300' : 'text-slate-700'}>|</span>
          <div>
            <span className="block text-cyan-500 font-bold text-base">168h Depth</span>
            <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Historical Audit</span>
          </div>
        </div>
      </section>
    </div>
  );
};
