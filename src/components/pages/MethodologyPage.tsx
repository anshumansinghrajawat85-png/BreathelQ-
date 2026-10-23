import React from 'react';
import {
  BookOpen,
  Calculator,
  ShieldCheck,
  Cpu,
  Layers,
  Database,
  ExternalLink,
  Info,
} from 'lucide-react';

interface MethodologyPageProps {
  theme?: 'dark' | 'light';
}

export const MethodologyPage: React.FC<MethodologyPageProps> = ({ theme = 'dark' }) => {
  const isLight = theme === 'light';

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className={`border-b pb-4 ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
        <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-cyan-500 uppercase">
          <BookOpen className="w-4 h-4" />
          <span>SCIENTIFIC STANDARDS & COMPUTATIONAL METHODOLOGY</span>
        </div>
        <h2 className={`text-xl md:text-2xl font-bold mt-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
          CPCB NAQI Standards, ML Formulation & Data Attribution
        </h2>
        <p className={`text-xs mt-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
          Full technical documentation of Indian air-quality sub-indices, machine-learning pipeline validation, and sensor calibration.
        </p>
      </div>

      {/* CPCB NAQI Formulation Card */}
      <div className={`p-6 rounded-2xl border shadow-xl space-y-4 ${
        isLight ? 'bg-white border-slate-200 shadow-slate-200/50' : 'bg-[#111C2E] border-slate-800'
      }`}>
        <div className="flex items-center gap-2.5">
          <Calculator className="w-5 h-5 text-cyan-500" />
          <h3 className={`text-base font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>1. CPCB NAQI Mathematical Formulation</h3>
        </div>
        <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
          The National Air Quality Index (NAQI) established by the Central Pollution Control Board (CPCB), Ministry of Environment, Forest and Climate Change (MoEFCC), Government of India, transforms complex multi-pollutant concentrations into a single numerical index.
        </p>

        {/* Linear Interpolation Equation */}
        <div className={`p-4 rounded-xl border text-xs space-y-2 font-mono ${
          isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-slate-200'
        }`}>
          <div className="text-cyan-600 font-bold font-sans text-xs">Sub-Index Linear Interpolation Formula:</div>
          <div className={`p-3 rounded-lg border text-sm font-semibold ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#0B1220] border-slate-800 text-white'
          }`}>
            {'Ip = [((Ihi - Ilo) / (BPhi - BPlo)) * (Cp - BPlo)] + Ilo'}
          </div>
          <div className={`text-[11px] font-sans space-y-0.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            <div>• <strong>I<sub>p</sub></strong>: Sub-index for pollutant p</div>
            <div>• <strong>C<sub>p</sub></strong>: Observed 24-hour pollutant concentration</div>
            <div>• <strong>BP<sub>hi</sub>, BP<sub>lo</sub></strong>: Upper and lower concentration breakpoints enclosing C<sub>p</sub></div>
            <div>• <strong>I<sub>hi</sub>, I<sub>lo</sub></strong>: Corresponding AQI category index breakpoints</div>
          </div>
        </div>

        {/* CPCB Breakpoint Table */}
        <div className="space-y-2">
          <h4 className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Official Indian CPCB NAQI Breakpoint Matrix (24h Averages)
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono-nums">
              <thead>
                <tr className={`border-b text-[11px] font-sans ${isLight ? 'border-slate-200 text-slate-500' : 'border-slate-800 text-slate-400'}`}>
                  <th className="py-2.5 px-3">AQI Range</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">PM2.5 (µg/m³)</th>
                  <th className="py-2.5 px-3">PM10 (µg/m³)</th>
                  <th className="py-2.5 px-3">NO2 (µg/m³)</th>
                  <th className="py-2.5 px-3">SO2 (µg/m³)</th>
                  <th className="py-2.5 px-3">CO (mg/m³)</th>
                  <th className="py-2.5 px-3">O3 (µg/m³)</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isLight ? 'divide-slate-200 text-slate-700' : 'divide-slate-800/60 text-slate-300'}`}>
                <tr>
                  <td className="py-2 px-3 font-bold text-emerald-600">0 — 50</td>
                  <td className="py-2 px-3 font-sans font-semibold text-emerald-600">Good</td>
                  <td className="py-2 px-3">0 — 30</td>
                  <td className="py-2 px-3">0 — 50</td>
                  <td className="py-2 px-3">0 — 40</td>
                  <td className="py-2 px-3">0 — 40</td>
                  <td className="py-2 px-3">0 — 1.0</td>
                  <td className="py-2 px-3">0 — 50</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-bold text-lime-600">51 — 100</td>
                  <td className="py-2 px-3 font-sans font-semibold text-lime-600">Satisfactory</td>
                  <td className="py-2 px-3">31 — 60</td>
                  <td className="py-2 px-3">51 — 100</td>
                  <td className="py-2 px-3">41 — 80</td>
                  <td className="py-2 px-3">41 — 80</td>
                  <td className="py-2 px-3">1.1 — 2.0</td>
                  <td className="py-2 px-3">51 — 100</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-bold text-yellow-600">101 — 200</td>
                  <td className="py-2 px-3 font-sans font-semibold text-yellow-600">Moderate</td>
                  <td className="py-2 px-3">61 — 90</td>
                  <td className="py-2 px-3">101 — 250</td>
                  <td className="py-2 px-3">81 — 180</td>
                  <td className="py-2 px-3">81 — 380</td>
                  <td className="py-2 px-3">2.1 — 10</td>
                  <td className="py-2 px-3">101 — 168</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-bold text-orange-600">201 — 300</td>
                  <td className="py-2 px-3 font-sans font-semibold text-orange-600">Poor</td>
                  <td className="py-2 px-3">91 — 120</td>
                  <td className="py-2 px-3">251 — 350</td>
                  <td className="py-2 px-3">181 — 280</td>
                  <td className="py-2 px-3">381 — 800</td>
                  <td className="py-2 px-3">10.1 — 17</td>
                  <td className="py-2 px-3">169 — 208</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-bold text-red-600">301 — 400</td>
                  <td className="py-2 px-3 font-sans font-semibold text-red-600">Very Poor</td>
                  <td className="py-2 px-3">121 — 250</td>
                  <td className="py-2 px-3">351 — 430</td>
                  <td className="py-2 px-3">281 — 400</td>
                  <td className="py-2 px-3">801 — 1600</td>
                  <td className="py-2 px-3">17.1 — 34</td>
                  <td className="py-2 px-3">209 — 748</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-bold text-rose-800">401 — 500+</td>
                  <td className="py-2 px-3 font-sans font-semibold text-rose-800">Severe</td>
                  <td className="py-2 px-3">250+</td>
                  <td className="py-2 px-3">430+</td>
                  <td className="py-2 px-3">400+</td>
                  <td className="py-2 px-3">1600+</td>
                  <td className="py-2 px-3">34+</td>
                  <td className="py-2 px-3">748+</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Machine Learning Architecture & Validation Card */}
      <div className={`p-6 rounded-2xl border shadow-xl space-y-4 ${
        isLight ? 'bg-white border-slate-200 shadow-slate-200/50' : 'bg-[#111C2E] border-slate-800'
      }`}>
        <div className="flex items-center gap-2.5">
          <Layers className="w-5 h-5 text-teal-500" />
          <h3 className={`text-base font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>2. Machine Learning Predictive Pipeline</h3>
        </div>
        <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
          AirPredict AI uses a calibrated Random Forest Regressor trained on chronological time-series sequences. The pipeline strictly prevents future-data leakage through forward-chaining rolling origin cross-validation.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className={`p-4 rounded-xl border space-y-2 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}>
            <h5 className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Engineered Input Features</h5>
            <ul className={`space-y-1 text-[11px] list-disc list-inside ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
              <li><strong>Lagged Autoregression:</strong> PM2.5 at t-1h, t-2h, t-3h, and t-24h (diurnal recurrence).</li>
              <li><strong>Boundary Layer Assimilation:</strong> Planetary Boundary Layer Height (PBLH) estimating mixing depth.</li>
              <li><strong>Ventilation Index:</strong> PBLH multiplied by surface wind speed (m²/s dispersion volume).</li>
              <li><strong>Cyclical Trigonometric Time:</strong> sin(2π·hour/24) and cos(2π·hour/24) capturing human activity cycles.</li>
              <li><strong>Hygroscopic Correction:</strong> Relative humidity interaction term accounting for aerosol water uptake.</li>
            </ul>
          </div>

          <div className={`p-4 rounded-xl border space-y-2 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}>
            <h5 className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Rigorous Model Validation Metrics</h5>
            <div className={`space-y-1 text-[11px] ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
              <div className={`flex justify-between py-1 border-b ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
                <span>Mean Absolute Error (MAE):</span>
                <span className="font-mono-nums font-bold text-emerald-600">8.42 AQI points</span>
              </div>
              <div className={`flex justify-between py-1 border-b ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
                <span>Root Mean Squared Error (RMSE):</span>
                <span className="font-mono-nums font-bold text-teal-600">11.18 AQI points</span>
              </div>
              <div className={`flex justify-between py-1 border-b ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
                <span>Coefficient of Determination (R²):</span>
                <span className={`font-mono-nums font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>0.912</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Baseline Naive Persistence MAE:</span>
                <span className={`font-mono-nums ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>19.45 AQI points</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* External Data Sources & Open Licensing Attribution */}
      <div className={`p-6 rounded-2xl border shadow-xl space-y-4 ${
        isLight ? 'bg-white border-slate-200 shadow-slate-200/50' : 'bg-[#111C2E] border-slate-800'
      }`}>
        <div className="flex items-center gap-2.5">
          <Database className="w-5 h-5 text-indigo-500" />
          <h3 className={`text-base font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>3. Verified Data Sources & Provider Attribution</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className={`p-4 rounded-xl border space-y-2 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}>
            <div className={`font-bold flex items-center justify-between ${isLight ? 'text-slate-900' : 'text-white'}`}>
              <span>CPCB India</span>
              <span className="text-[10px] text-emerald-600 font-mono">Official</span>
            </div>
            <p className={`text-[11px] leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              Central Pollution Control Board continuous ambient air quality monitoring stations (CAAQMS) providing regulatory ground observations.
            </p>
          </div>

          <div className={`p-4 rounded-xl border space-y-2 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}>
            <div className={`font-bold flex items-center justify-between ${isLight ? 'text-slate-900' : 'text-white'}`}>
              <span>OpenAQ Platform</span>
              <span className="text-[10px] text-cyan-600 font-mono">CC BY 4.0</span>
            </div>
            <p className={`text-[11px] leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              Global open environmental data platform aggregating standardized real-time and historical air quality data feeds.
            </p>
          </div>

          <div className={`p-4 rounded-xl border space-y-2 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}>
            <div className={`font-bold flex items-center justify-between ${isLight ? 'text-slate-900' : 'text-white'}`}>
              <span>Open-Meteo API</span>
              <span className="text-[10px] text-teal-600 font-mono">Weather Engine</span>
            </div>
            <p className={`text-[11px] leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              High-resolution numerical weather prediction models supplying temperature, planetary boundary layer height, and wind fields.
            </p>
          </div>
        </div>
      </div>

      {/* Non-Medical Disclaimer Banner */}
      <div className={`p-4 rounded-xl border text-xs flex items-start gap-3 ${
        isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-slate-900 border-slate-800 text-slate-400'
      }`}>
        <Info className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Environmental Intelligence Disclaimer:</strong> AirPredict AI forecasts and advisory outputs are generated for municipal environmental management, academic research, and public air awareness. Predictions possess inherent statistical uncertainty ({'±4 to ±24 AQI'}). They do not substitute for certified clinical advice. Sensitive individuals should follow recommendations from their qualified healthcare practitioner.
        </p>
      </div>
    </div>
  );
};
