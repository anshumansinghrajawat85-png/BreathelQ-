import React, { useState } from 'react';
import { IoTSensor } from '../../types';
import { ingestSensorReading } from '../../services/api';
import {
  Cpu,
  Wifi,
  Battery,
  Radio,
  CheckCircle2,
  AlertCircle,
  Clock,
  Play,
  Square,
  Send,
  Code2,
  Layers,
  Activity,
} from 'lucide-react';

interface SensorsPageProps {
  sensors: IoTSensor[];
  onRefreshSensors: () => void;
  theme?: 'dark' | 'light';
}

export const SensorsPage: React.FC<SensorsPageProps> = ({ sensors, onRefreshSensors, theme = 'dark' }) => {
  const isLight = theme === 'light';
  const [selectedSensor, setSelectedSensor] = useState<IoTSensor | null>(sensors[0] || null);
  const [isSimulatingStream, setIsSimulatingStream] = useState(false);
  const [simIntervalId, setSimIntervalId] = useState<any>(null);

  // Ingestion form state
  const [testSensorId, setTestSensorId] = useState('ESP32-AQI-01');
  const [testPM25, setTestPM25] = useState(82);
  const [testPM10, setTestPM10] = useState(148);
  const [testTemp, setTestTemp] = useState(27.4);
  const [testHumidity, setTestHumidity] = useState(55);
  const [ingestStatus, setIngestStatus] = useState<string | null>(null);

  // Toggle live simulated packet stream
  const toggleSimulation = () => {
    if (isSimulatingStream) {
      clearInterval(simIntervalId);
      setSimIntervalId(null);
      setIsSimulatingStream(false);
    } else {
      setIsSimulatingStream(true);
      const id = setInterval(() => {
        const randJitter = (Math.random() - 0.5) * 8;
        ingestSensorReading({
          sensorId: 'ESP32-AQI-01',
          pm25: Math.round(76 + randJitter),
          pm10: Math.round(138 + randJitter * 1.5),
          temperature: parseFloat((26.5 + (Math.random() - 0.5) * 0.4).toFixed(1)),
          humidity: parseFloat((58.2 + (Math.random() - 0.5) * 1.2).toFixed(1)),
          batteryVoltage: 4.12,
          wifiRssi: -62,
        }).then(() => {
          onRefreshSensors();
        });
      }, 2500);
      setSimIntervalId(id);
    }
  };

  const handleManualIngest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIngestStatus('Sending payload...');
    try {
      await ingestSensorReading({
        sensorId: testSensorId,
        pm25: Number(testPM25),
        pm10: Number(testPM10),
        temperature: Number(testTemp),
        humidity: Number(testHumidity),
        batteryVoltage: 4.15,
        wifiRssi: -65,
      });
      setIngestStatus('Payload ingested successfully into backend registry.');
      onRefreshSensors();
      setTimeout(() => setIngestStatus(null), 3000);
    } catch (err: any) {
      setIngestStatus(`Ingestion failed: ${err.message}`);
    }
  };

  const onlineCount = sensors.filter((s) => s.status === 'Online').length;
  const staleCount = sensors.filter((s) => s.status === 'Stale').length;
  const offlineCount = sensors.filter((s) => s.status === 'Offline').length;

  return (
    <div className="space-y-6">
      {/* Page Header with Stream Toggle */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 ${
        isLight ? 'border-slate-200' : 'border-slate-800'
      }`}>
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-cyan-500 uppercase">
            <Cpu className="w-4 h-4" />
            <span>ESP32 MICROCONTROLLER SENSOR MESH</span>
          </div>
          <h2 className={`text-xl md:text-2xl font-bold mt-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
            IoT Edge Sensor Registry & Hardware Telemetry
          </h2>
          <p className={`text-xs mt-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            Field-deployed Plantower PMS laser optical particulate counters, Wi-Fi RSSI diagnostics, and REST/MQTT ingestion pipeline.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleSimulation}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-sm border ${
              isSimulatingStream
                ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/50'
                : isLight
                ? 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300'
                : 'bg-[#111C2E] hover:bg-slate-800 text-slate-200 border-slate-700/80 hover:text-white'
            }`}
          >
            {isSimulatingStream ? (
              <>
                <Square className="w-3.5 h-3.5 fill-current text-amber-500" />
                <span>Pause Live Stream</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current text-cyan-500" />
                <span>Simulate Sensor Stream</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Network Health KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className={`p-4 rounded-xl border ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#111C2E] border-slate-800'
        }`}>
          <span className={`text-[11px] uppercase font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Total Registered Nodes</span>
          <div className={`text-2xl font-bold font-mono-nums mt-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>{sensors.length}</div>
          <div className={`text-[10px] mt-1 ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>Bhopal Metropolitan Mesh</div>
        </div>

        <div className={`p-4 rounded-xl border ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#111C2E] border-slate-800'
        }`}>
          <span className={`text-[11px] uppercase font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Online & Transmitting</span>
          <div className="text-2xl font-bold font-mono-nums text-emerald-600 mt-1">{onlineCount}</div>
          <div className="text-[10px] text-emerald-600 font-medium mt-1">Active packet transmission</div>
        </div>

        <div className={`p-4 rounded-xl border ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#111C2E] border-slate-800'
        }`}>
          <span className={`text-[11px] uppercase font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Stale Telemetry</span>
          <div className="text-2xl font-bold font-mono-nums text-amber-600 mt-1">{staleCount}</div>
          <div className="text-[10px] text-amber-600 font-medium mt-1">Packet loss &gt; 20%</div>
        </div>

        <div className={`p-4 rounded-xl border ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#111C2E] border-slate-800'
        }`}>
          <span className={`text-[11px] uppercase font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Offline / Power Cut</span>
          <div className="text-2xl font-bold font-mono-nums text-rose-600 mt-1">{offlineCount}</div>
          <div className="text-[10px] text-rose-600 font-medium mt-1">Battery cutoff triggered</div>
        </div>
      </div>

      {/* Sensor Nodes List & Detail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Nodes List */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className={`text-sm font-bold flex items-center justify-between ${isLight ? 'text-slate-900' : 'text-white'}`}>
            <span>Hardware Registry</span>
            <span className={`text-xs font-normal ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Click any node to inspect telemetry</span>
          </h3>

          <div className="space-y-2.5">
            {sensors.map((sensor) => {
              const isSelected = selectedSensor?.id === sensor.id;
              const isOnline = sensor.status === 'Online';
              const isStale = sensor.status === 'Stale';

              return (
                <div
                  key={sensor.id}
                  onClick={() => setSelectedSensor(sensor)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? isLight
                        ? 'bg-cyan-50/80 border-cyan-400 shadow-md'
                        : 'bg-[#152336] border-cyan-500/60 shadow-lg shadow-cyan-950/30'
                      : isLight
                      ? 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                      : 'bg-[#111C2E] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`font-mono-nums font-bold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>{sensor.id}</span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                            isOnline
                              ? isLight
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              : isStale
                              ? isLight
                                ? 'bg-amber-50 text-amber-800 border-amber-300'
                                : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                              : isLight
                              ? 'bg-rose-50 text-rose-800 border-rose-300'
                              : 'bg-red-500/20 text-red-300 border-red-500/30'
                          }`}
                        >
                          {sensor.status}
                        </span>
                        {sensor.isSimulated && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                            isLight
                              ? 'bg-slate-100 text-slate-600 border-slate-300'
                              : 'text-slate-400 bg-slate-900 border-slate-800'
                          }`}>
                            SIMULATED STREAM
                          </span>
                        )}
                      </div>
                      <div className={`text-xs mt-1 font-medium ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>{sensor.name}</div>
                      <div className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{sensor.locationName} · {sensor.city}</div>
                    </div>

                    {/* Sensor Readings Strip */}
                    <div className="flex items-center gap-4 text-xs font-mono-nums">
                      <div>
                        <span className={`text-[10px] block font-sans ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>PM2.5</span>
                        <span className="font-bold text-cyan-600 text-sm">
                          {isOnline || isStale ? `${sensor.latestPM25} µg/m³` : 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className={`text-[10px] block font-sans ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>PM10</span>
                        <span className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>
                          {isOnline || isStale ? `${sensor.latestPM10} µg/m³` : 'N/A'}
                        </span>
                      </div>
                      <div className="hidden sm:block">
                        <span className={`text-[10px] block font-sans ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Battery</span>
                        <span className={`text-xs ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                          {sensor.batteryVoltage > 0 ? `${sensor.batteryVoltage}V` : '0V'}
                        </span>
                      </div>
                      <div className="hidden sm:block">
                        <span className={`text-[10px] block font-sans ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Wi-Fi RSSI</span>
                        <span className={`text-xs ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>{sensor.wifiRssi} dBm</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Sensor Telemetry Deep Dive */}
        {selectedSensor && (
          <div className={`p-5 rounded-2xl border space-y-4 ${
            isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#111C2E] border-slate-800'
          }`}>
            <div>
              <div className="text-[10px] uppercase font-bold text-cyan-600 tracking-wider">
                NODE TELEMETRY AUDIT
              </div>
              <h4 className={`text-base font-bold mt-0.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>{selectedSensor.name}</h4>
              <p className={`text-xs font-mono-nums ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Device ID: {selectedSensor.id}</p>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className={`p-3 rounded-xl border space-y-1.5 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'
              }`}>
                <div className={`text-[11px] font-semibold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Sensor Architecture</div>
                <div className={`font-medium ${isLight ? 'text-slate-900' : 'text-white'}`}>{selectedSensor.sensorModel}</div>
                <div className={`text-[10px] font-mono-nums ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>Firmware: {selectedSensor.firmwareVersion}</div>
              </div>

              <div className="grid grid-cols-2 gap-2 font-mono-nums">
                <div className={`p-2.5 rounded-lg border ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'
                }`}>
                  <div className={`flex items-center gap-1.5 text-[10px] font-sans ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    <Battery className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Battery</span>
                  </div>
                  <div className={`font-bold text-sm mt-0.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>{selectedSensor.batteryVoltage} V</div>
                </div>

                <div className={`p-2.5 rounded-lg border ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'
                }`}>
                  <div className={`flex items-center gap-1.5 text-[10px] font-sans ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    <Wifi className="w-3.5 h-3.5 text-cyan-600" />
                    <span>Signal</span>
                  </div>
                  <div className={`font-bold text-sm mt-0.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>{selectedSensor.wifiRssi} dBm</div>
                </div>

                <div className={`p-2.5 rounded-lg border ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'
                }`}>
                  <div className={`flex items-center gap-1.5 text-[10px] font-sans ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    <Activity className="w-3.5 h-3.5 text-amber-600" />
                    <span>Packet Loss</span>
                  </div>
                  <div className={`font-bold text-sm mt-0.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>{selectedSensor.packetLossPercent}%</div>
                </div>

                <div className={`p-2.5 rounded-lg border ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'
                }`}>
                  <div className={`flex items-center gap-1.5 text-[10px] font-sans ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    <Clock className="w-3.5 h-3.5 text-teal-600" />
                    <span>Last Uplink</span>
                  </div>
                  <div className={`text-[11px] mt-0.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    {new Date(selectedSensor.lastTransmission).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            </div>

            {/* REST / MQTT Ingestion Test Form */}
            <div className={`pt-2 border-t space-y-3 ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
              <div className={`text-xs font-bold flex items-center gap-1.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                <Send className="w-3.5 h-3.5 text-cyan-500" />
                <span>Test HTTP Ingest Payload</span>
              </div>
              <form onSubmit={handleManualIngest} className="space-y-2 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>PM2.5 (µg/m³)</label>
                    <input
                      type="number"
                      value={testPM25}
                      onChange={(e) => setTestPM25(Number(e.target.value))}
                      className={`w-full rounded p-1.5 font-mono-nums border ${
                        isLight
                          ? 'bg-slate-50 border-slate-300 text-slate-900'
                          : 'bg-slate-900 border-slate-800 text-white'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>PM10 (µg/m³)</label>
                    <input
                      type="number"
                      value={testPM10}
                      onChange={(e) => setTestPM10(Number(e.target.value))}
                      className={`w-full rounded p-1.5 font-mono-nums border ${
                        isLight
                          ? 'bg-slate-50 border-slate-300 text-slate-900'
                          : 'bg-slate-900 border-slate-800 text-white'
                      }`}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className={`w-full py-2 font-semibold rounded-lg transition-colors cursor-pointer border ${
                    isLight
                      ? 'bg-cyan-100 hover:bg-cyan-200 text-cyan-900 border-cyan-300 shadow-sm'
                      : 'bg-cyan-500/20 hover:bg-cyan-500/30 border-cyan-500/40 text-cyan-300'
                  }`}
                >
                  Post Telemetry to /api/sensors/ingest
                </button>
              </form>
              {ingestStatus && (
                <div className={`text-[11px] font-mono-nums p-2 rounded border ${
                  isLight
                    ? 'bg-cyan-50 text-cyan-800 border-cyan-200'
                    : 'bg-cyan-950/40 text-cyan-400 border-cyan-800/40'
                }`}>
                  {ingestStatus}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ESP32 Arduino Sketch Code Spec Card */}
      <div className={`p-5 rounded-2xl border space-y-3 ${
        isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#111C2E] border-slate-800'
      }`}>
        <div className="flex items-center justify-between">
          <div className={`flex items-center gap-2 font-bold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>
            <Code2 className="w-4 h-4 text-cyan-500" />
            <span>ESP32 Plantower PMS5003 Hardware Ingestion Snippet (Arduino C++)</span>
          </div>
          <span className={`text-[10px] font-mono-nums ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>POST /api/sensors/ingest</span>
        </div>
        <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
          This sample C++ firmware snippet can be flashed directly onto an ESP32 microcontroller with a Plantower PMS5003 particulate sensor to push live observations into the AirPredict backend:
        </p>

        <div className={`border rounded-xl p-4 font-mono text-[11px] overflow-x-auto leading-relaxed ${
          isLight
            ? 'bg-slate-900 text-slate-200 border-slate-700'
            : 'bg-[#070D18] text-slate-300 border-slate-800'
        }`}>
          <pre>{`// AirPredict AI — ESP32 Sensor Ingestion Firmware Snippet
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* serverEndpoint = "https://your-airpredict-app.com/api/sensors/ingest";

void postSensorTelemetry(float pm25, float pm10, float temp, float humidity) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverEndpoint);
    http.addHeader("Content-Type", "application/json");

    StaticJsonDocument<256> doc;
    doc["sensorId"] = "ESP32-AQI-01";
    doc["pm25"] = pm25;
    doc["pm10"] = pm10;
    doc["temperature"] = temp;
    doc["humidity"] = humidity;
    doc["batteryVoltage"] = 4.12;
    doc["wifiRssi"] = WiFi.RSSI();

    String requestBody;
    serializeJson(doc, requestBody);
    int httpResponseCode = http.POST(requestBody);
    http.end();
  }
}`}</pre>
        </div>
      </div>
    </div>
  );
};
