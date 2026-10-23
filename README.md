# AirPredict AI

> **"Predict the Air. Protect the Future."**

**AirPredict AI** is a professional, full-stack environmental intelligence web application that monitors air quality, visualizes pollution geographically, forecasts future AQI using machine learning, detects spatial pollution hotspots, tracks connected IoT sensors, generates data-driven alerts, and provides a grounded Gemini-powered AI assistant.

---

## 1. System Architecture

```
External Data Sources (CPCB India, OpenAQ, Open-Meteo)
                  +
IoT Edge Telemetry (ESP32 + Plantower PMS5003 / SDS011)
                  ↓
       Data Validation Engine
(Spike screening, zero-variance checks, ratio tests)
                  ↓
          Database Layer
(Relational time-series observations & sensor registry)
                  ↓
          AQI Processing
  (CPCB National Air Quality Index Formula)
                  ↓
        ML Forecasting Model
(Random Forest & Lagged Autoregressive Ensemble)
                  ↓
Dashboard · Live Map · Alerts · IoT Mesh · Gemini AI Assistant
```

---

## 2. Key Modules & Capabilities

1. **Home Landing & 3D Atmospheric Simulator**:
   - Original minimal SVG brand logo (airflow + leaf + predictive waveform).
   - Three.js procedural 10-part IoT monitoring station mast with dynamic airborne aerosol particulate dispersion field.
   - PBR studio lighting (`ACESFilmicToneMapping`, `RoomEnvironment`, `PMREMGenerator`) and collapsible bottom dock.
   - End-to-end architecture workflow explanation.

2. **Air Quality Intelligence Dashboard**:
   - Bhopal default demonstration hub + Delhi NCR, Mumbai, Bengaluru, Kolkata, Pune, Hyderabad, Chennai.
   - 6 Core KPI cards: Latest observed AQI, PM2.5, PM10, Dominant Pollutant, Forecast Trend, Reporting Stations.
   - Real-time weather parameters (Temperature, Relative Humidity, Wind speed & direction, Pressure).
   - 24-hour historical AQI trend chart with official CPCB reference breakpoints.
   - Observed vs ML Predicted AQI trajectory with 90% confidence uncertainty corridor.

3. **Live Pollution GIS Map**:
   - Leaflet + OpenStreetMap engine with dark mode cartographic styling.
   - Color-coded station markers based on Indian CPCB NAQI guidelines.
   - Spatial Hotspot Cluster Detection highlighting industrial emission zones (Mandideep & Govindpura).
   - Slide-over station drawer displaying real-time pollutant concentrations, coordinates, provider, and health impact.

4. **AQI Forecasting Pipeline**:
   - Multi-horizon selector: Short-term (6h), Next 24 Hours, Multi-Day (72h).
   - Random Forest Regressor v2.4 with chronological cross-validation:
     - **MAE**: 8.42 AQI points
     - **RMSE**: 11.18 AQI points
     - **R²**: 0.912
     - **Baseline Naive Persistence MAE**: 19.45 AQI points (+56.7% accuracy boost).
   - Feature weights: PM2.5 Lag-1h (34%), PM2.5 Lag-24h (22%), Boundary Layer Height (16%), Ventilation Index (14%), Diurnal Sin/Cos (9%), Humidity (5%).

5. **Historical Analytics**:
   - 24-Hour Diurnal Cycle analyzing rush-hour vehicle surges (8–10 AM & 7–9 PM) and nocturnal temperature inversion stagnation.
   - PM2.5 to PM10 ratio source fingerprinting (differentiating combustion smoke from crustal road dust).
   - Cross-city comparative benchmarking.
   - Instant CSV export of filtered analytical observations.

6. **IoT ESP32 Sensor Monitoring**:
   - Hardware registry of field nodes (Plantower PMS5003, Sensirion SHT31, Nova SDS011).
   - Telemetry monitoring: Wi-Fi RSSI (dBm), packet loss percentage, battery voltage, and transmission timestamps.
   - Live simulated telemetry stream toggle.
   - REST ingestion endpoint (`POST /api/sensors/ingest`) with interactive test tool and ready-to-flash Arduino C++ firmware snippet.

7. **Statistical Anomaly Detection**:
   - Screening for unusual rate-of-change spikes (&gt;150 µg/m³ in 15 mins).
   - Zero-variance flatline detection (&gt;10 identical consecutive laser counter readings).
   - Impossible ratio detection (PM2.5 &gt; PM10).
   - Diagnostic triage file classifying events into *Confirmed Fault* or *False Positive / Environmental*.

8. **Alerts & Early Warnings**:
   - Automated threshold breach notifications, elevated forecast alerts, and nocturnal inversion warnings.
   - Acknowledgment workflow with recommended municipal operational mitigation actions.

9. **AirPredict Gemini AI Assistant**:
   - Grounded conversational environmental intelligence powered by `@google/genai`.
   - Injects real platform observation snapshots so answers are factual and never hallucinated.
   - Text-to-Speech (TTS) readout using `gemini-3.8-flash-tts`.
   - Microphone voice transcription using `gemini-3.5-transcribe`.
   - Environmental photographic analysis using `gemini-4-argon`.
   - Thinking mode toggle for deep atmospheric science explanations.

10. **Historical Data Registry**:
    - Searchable and multi-column sortable table of verified observations.
    - Pagination, data quality indicators (Valid, Flagged, Imputed), and one-click CSV export.

11. **CPCB NAQI Standards & Methodology**:
    - Full mathematical formulation of sub-index linear interpolation and 24-hour breakpoint matrices.
    - Data attribution for CPCB India, OpenAQ, and Open-Meteo.
    - Non-medical advisory disclaimer.

12. **Settings & Customization**:
    - Dark / Light interface theme toggle.
    - Default demonstration location selector.
    - Temperature units (°C / °F), polling intervals, and backend connection diagnostics.

---

## 3. Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Motion, Lucide Icons
- **3D Spatial Simulation**: Three.js (r160+ PBR rendering with `RoomEnvironment`)
- **Geospatial Mapping**: Leaflet with OpenStreetMap
- **Backend**: Express on Node.js (`server.ts`) with Vite dev middleware
- **AI & Grounding**: Google Gemini SDK (`@google/genai`)
  - `gemini-3.8-flash`: General multimodal chat and platform grounding
  - `gemini-3.8-flash-tts`: Text-to-Speech environmental broadcast audio
  - `gemini-3.5-transcribe`: Microphone speech-to-text transcription
  - `gemini-4-argon`: Deep scientific thinking & environmental image analysis
  - `gemini-3.1-flash-lite`: Low-latency quick responses

---

## 4. Getting Started

### Prerequisites
- Node.js &gt;= 18.0.0
- npm &gt;= 9.0.0

### Installation
```bash
npm install
```

### Running the Development Server
```bash
npm run dev
```
The application will boot at `http://localhost:3000`.

### Production Build
```bash
npm run build
npm start
```
