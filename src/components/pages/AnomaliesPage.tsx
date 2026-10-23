import React, { useState } from 'react';
import { AnomalyRecord } from '../../types';
import {
  AlertTriangle,
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Eye,
  Activity,
  Layers,
} from 'lucide-react';

interface AnomaliesPageProps {
  anomalies: AnomalyRecord[];
  theme?: 'dark' | 'light';
}

export const AnomaliesPage: React.FC<AnomaliesPageProps> = ({ anomalies, theme = 'dark' }) => {
  const isLight = theme === 'light';
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [selectedAnomaly, setSelectedAnomaly] = useState<AnomalyRecord | null>(anomalies[0] || null);
  const [triageActionMsg, setTriageActionMsg] = useState<string | null>(null);

  const filtered = anomalies.filter((a) => {
    if (filterSeverity !== 'all' && a.severity !== filterSeverity) return false;
    return true;
  });

  const handleAction = (msg: string) => {
    setTriageActionMsg(msg);
    setTimeout(() => setTriageActionMsg(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 ${
        isLight ? 'border-slate-200' : 'border-slate-800'
      }`}>
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-amber-500 uppercase">
            <AlertTriangle className="w-4 h-4" />
            <span>STATISTICAL & PHYSICAL INTEGRITY VALIDATION</span>
          </div>
          <h2 className={`text-xl md:text-2xl font-bold mt-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Anomaly Detection & Sensor Fault Triage
          </h2>
          <p className={`text-xs mt-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            Automated Z-score outlier flagging, rate-of-change spike screening, and optical sensor chamber health audits.
          </p>
        </div>

        {/* Severity Filter */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs border ${
          isLight ? 'bg-white border-slate-300 text-slate-800 shadow-sm' : 'bg-[#111C2E] border-slate-700/80 text-slate-200'
        }`}>
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="bg-transparent focus:outline-none cursor-pointer"
          >
            <option value="all" className={isLight ? 'bg-white text-slate-900' : 'bg-[#111C2E]'}>All Severities</option>
            <option value="Critical" className={isLight ? 'bg-white text-slate-900' : 'bg-[#111C2E]'}>Critical</option>
            <option value="High" className={isLight ? 'bg-white text-slate-900' : 'bg-[#111C2E]'}>High</option>
            <option value="Medium" className={isLight ? 'bg-white text-slate-900' : 'bg-[#111C2E]'}>Medium</option>
            <option value="Low" className={isLight ? 'bg-white text-slate-900' : 'bg-[#111C2E]'}>Low</option>
          </select>
        </div>
      </div>

      {/* Detection Algorithms Explanation Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
        <div className={`p-3.5 rounded-xl border space-y-1 ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#111C2E] border-slate-800'
        }`}>
          <div className={`font-semibold flex items-center gap-1.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
            <span className="w-2 h-2 rounded-full bg-cyan-500" />
            <span>Rate of Change Spike</span>
          </div>
          <p className={`text-[11px] leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            Flags ΔPM10 &gt; 150 µg/m³ within 15 mins without surrounding regional elevation.
          </p>
        </div>

        <div className={`p-3.5 rounded-xl border space-y-1 ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#111C2E] border-slate-800'
        }`}>
          <div className={`font-semibold flex items-center gap-1.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Zero-Variance Flatline</span>
          </div>
          <p className={`text-[11px] leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            Identifies laser optical chamber freeze (&gt; 10 identical readings in succession).
          </p>
        </div>

        <div className={`p-3.5 rounded-xl border space-y-1 ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#111C2E] border-slate-800'
        }`}>
          <div className={`font-semibold flex items-center gap-1.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
            <span className="w-2 h-2 rounded-full bg-teal-500" />
            <span>Physical Bounds Check</span>
          </div>
          <p className={`text-[11px] leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            Rejects impossible values (negative readings, PM2.5 &gt; 1500 µg/m³, battery drops).
          </p>
        </div>

        <div className={`p-3.5 rounded-xl border space-y-1 ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#111C2E] border-slate-800'
        }`}>
          <div className={`font-semibold flex items-center gap-1.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            <span>PM2.5/PM10 Inversion</span>
          </div>
          <p className={`text-[11px] leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            Flags impossible cases where fine particulate mathematically exceeds total coarse.
          </p>
        </div>
      </div>

      {/* Anomalies Table & Selected Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table of anomalies */}
        <div className={`lg:col-span-2 p-5 rounded-2xl border shadow-xl space-y-3 ${
          isLight ? 'bg-white border-slate-200 shadow-slate-200/50' : 'bg-[#111C2E] border-slate-800'
        }`}>
          <h3 className={`text-sm font-bold flex items-center justify-between ${isLight ? 'text-slate-900' : 'text-white'}`}>
            <span>Detected Anomalies ({filtered.length})</span>
            <span className={`text-xs font-normal ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Click row to inspect diagnostic root cause</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className={`border-b text-[11px] ${isLight ? 'border-slate-200 text-slate-500' : 'border-slate-800 text-slate-400'}`}>
                  <th className="py-2.5">Entity / Station</th>
                  <th className="py-2.5">Parameter</th>
                  <th className="py-2.5">Observed Value</th>
                  <th className="py-2.5">Detection Method</th>
                  <th className="py-2.5">Severity</th>
                  <th className="py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className={`divide-y font-mono-nums ${isLight ? 'divide-slate-200' : 'divide-slate-800/60'}`}>
                {filtered.map((a) => {
                  const isSelected = selectedAnomaly?.id === a.id;
                  return (
                    <tr
                      key={a.id}
                      onClick={() => setSelectedAnomaly(a)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? isLight
                            ? 'bg-cyan-50 text-cyan-900 font-semibold'
                            : 'bg-cyan-500/10'
                          : isLight
                          ? 'hover:bg-slate-50'
                          : 'hover:bg-slate-850/50'
                      }`}
                    >
                      <td className={`py-3 font-sans font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        <div>{a.entityName}</div>
                        <div className={`text-[10px] font-mono-nums ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>{a.sensorOrStationId}</div>
                      </td>
                      <td className={`py-3 font-sans ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>{a.parameter}</td>
                      <td className="py-3 text-cyan-600 font-bold">{a.observedValue}</td>
                      <td className={`py-3 font-sans text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{a.method}</td>
                      <td className="py-3 font-sans">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                            a.severity === 'High' || a.severity === 'Critical'
                              ? isLight
                                ? 'bg-rose-50 text-rose-800 border-rose-300'
                                : 'bg-red-500/20 text-red-300 border border-red-500/30'
                              : isLight
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {a.severity}
                        </span>
                      </td>
                      <td className="py-3 font-sans">
                        <span className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>{a.status}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Anomaly Diagnostic Card */}
        {selectedAnomaly && (
          <div className={`p-5 rounded-2xl border space-y-4 ${
            isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#111C2E] border-slate-800'
          }`}>
            <div>
              <div className="text-[10px] uppercase font-bold text-amber-500 tracking-wider">
                DIAGNOSTIC TRIAGE FILE
              </div>
              <h4 className={`text-base font-bold mt-0.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>{selectedAnomaly.entityName}</h4>
              <p className={`text-xs font-mono-nums ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>ID: {selectedAnomaly.id}</p>
            </div>

            <div className="space-y-3 text-xs">
              <div className={`p-3 rounded-xl border space-y-1 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'
              }`}>
                <span className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Primary Anomaly Reason</span>
                <p className={`font-medium leading-relaxed ${isLight ? 'text-slate-900' : 'text-white'}`}>{selectedAnomaly.reason}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 font-mono-nums">
                <div className={`p-2.5 rounded-lg border ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'
                }`}>
                  <span className={`text-[10px] font-sans block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Observed Reading</span>
                  <span className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>{selectedAnomaly.observedValue}</span>
                </div>
                <div className={`p-2.5 rounded-lg border ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'
                }`}>
                  <span className={`text-[10px] font-sans block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Expected Baseline</span>
                  <span className="text-teal-600 font-bold text-xs">{selectedAnomaly.expectedRange}</span>
                </div>
              </div>

              <div className={`p-3 rounded-xl border text-[11px] space-y-1 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'
              }`}>
                <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Detection Methodology:</span>
                <div className={`font-medium ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>{selectedAnomaly.method}</div>
                <div className={`text-[10px] ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                  Timestamp: {new Date(selectedAnomaly.timestamp).toLocaleString()}
                </div>
              </div>
            </div>

            {triageActionMsg && (
              <div className="p-2.5 rounded-lg bg-teal-500/10 border border-teal-500/40 text-teal-600 font-medium text-xs">
                {triageActionMsg}
              </div>
            )}

            <div className={`pt-2 border-t space-y-2 ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
              <button
                onClick={() => handleAction(`Confirmed: Anomaly ${selectedAnomaly.id} logged as verified hardware malfunction.`)}
                className={`w-full py-2 rounded-lg font-medium text-xs transition-colors cursor-pointer border ${
                  isLight
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-900 border-slate-300'
                    : 'bg-slate-800 hover:bg-slate-700 text-white border-transparent'
                }`}
              >
                Confirm Hardware Fault
              </button>
              <button
                onClick={() => handleAction(`Cleared: Anomaly ${selectedAnomaly.id} classified as localized transient event.`)}
                className={`w-full py-2 bg-transparent rounded-lg font-medium text-xs transition-colors cursor-pointer border ${
                  isLight
                    ? 'hover:bg-slate-100 text-slate-700 border-slate-300'
                    : 'hover:bg-slate-800/60 text-slate-400 hover:text-white border-slate-700'
                }`}
              >
                Mark as False Positive / Environmental
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
