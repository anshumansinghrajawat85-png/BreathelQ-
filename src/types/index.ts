export type AQICategory =
  | 'Good'
  | 'Satisfactory'
  | 'Moderate'
  | 'Poor'
  | 'Very Poor'
  | 'Severe'
  | 'Severe+';

export type DataQuality = 'Valid' | 'Flagged' | 'Imputed' | 'Missing';
export type DataSource = 'CPCB India' | 'OpenAQ' | 'Open-Meteo' | 'IoT ESP32 Sensor' | 'Simulated Stream';

export interface LocationInfo {
  id: string;
  name: string;
  city: string;
  state: string;
  country: string;
  lat: number;
  lon: number;
  elevationMeters: number;
  isDefault?: boolean;
  locationType?: 'city' | 'village' | 'industrial';
  district?: string;
}

export interface PollutantReadings {
  pm25: number; // µg/m³
  pm10: number; // µg/m³
  no2?: number; // µg/m³
  so2?: number; // µg/m³
  co?: number; // mg/m³
  o3?: number; // µg/m³
  nh3?: number; // µg/m³
}

export interface WeatherData {
  temperature: number; // °C
  humidity: number; // %
  windSpeed: number; // km/h
  windDirection: string; // e.g., 'NW', 'SE'
  windAngle: number; // 0-360 degrees
  pressure: number; // hPa
  rainfall: number; // mm
  uvIndex: number;
}

export interface ObservationRecord {
  id: string;
  timestamp: string; // ISO string
  locationId: string;
  cityName: string;
  stationName: string;
  aqi: number;
  aqiCategory: AQICategory;
  dominantPollutant: 'PM2.5' | 'PM10' | 'NO2' | 'O3' | 'CO';
  pollutants: PollutantReadings;
  weather: WeatherData;
  source: DataSource;
  quality: DataQuality;
  isForecast?: boolean;
  isSimulated?: boolean;
}

export interface MonitoringStation {
  id: string;
  name: string;
  city: string;
  lat: number;
  lon: number;
  status: 'Online' | 'Offline' | 'Stale';
  lastUpdate: string;
  latestAQI: number;
  latestCategory: AQICategory;
  dominantPollutant: 'PM2.5' | 'PM10' | 'NO2' | 'O3';
  pollutants: PollutantReadings;
  provider: DataSource;
  isHotspot?: boolean;
  hotspotScore?: number;
  anomalyDetected?: boolean;
  locationType?: 'city' | 'village' | 'industrial';
  district?: string;
}

export interface ForecastPoint {
  targetTimestamp: string;
  predictedAQI: number;
  predictedCategory: AQICategory;
  lowerConfidence: number; // 90% CI lower
  upperConfidence: number; // 90% CI upper
  predictedPM25: number;
  predictedPM10: number;
  modelType: string;
}

export interface ModelMetrics {
  modelName: string;
  modelVersion: string;
  horizonHours: number;
  mae: number;
  rmse: number;
  rSquared: number;
  baselineMae: number; // Naive persistence baseline MAE
  lastEvaluated: string;
  sampleCount: number;
  featuresUsed: string[];
}

export interface IoTSensor {
  id: string;
  name: string;
  locationName: string;
  city: string;
  lat: number;
  lon: number;
  sensorModel: string; // e.g. "Plantower PMS5003 + SHT31"
  firmwareVersion: string;
  status: 'Online' | 'Offline' | 'Stale';
  batteryVoltage: number;
  wifiRssi: number; // dBm
  packetLossPercent: number;
  lastTransmission: string;
  latestPM25: number;
  latestPM10: number;
  latestTemp: number;
  latestHumidity: number;
  isSimulated: boolean;
}

export interface AnomalyRecord {
  id: string;
  sensorOrStationId: string;
  entityName: string;
  timestamp: string;
  parameter: string;
  observedValue: number;
  expectedRange: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  method: 'Z-Score Statistical' | 'Rate of Change Spike' | 'Zero-Variance Frozen' | 'Physical Bound Check' | 'PM2.5/PM10 Ratio Inversion';
  reason: string;
  status: 'Investigating' | 'Confirmed Fault' | 'False Positive' | 'Resolved';
}

export interface AlertRecord {
  id: string;
  title: string;
  location: string;
  type: 'Elevated Observed AQI' | 'Elevated Forecast AQI' | 'Rapid Pollutant Surge' | 'Potential Hotspot' | 'Sensor Offline' | 'Stale Data';
  severity: 'Critical' | 'Warning' | 'Info';
  timestamp: string;
  triggerCondition: string;
  source: DataSource;
  supportingMeasurement: string;
  recommendedAction: string;
  acknowledged: boolean;
  status: 'Active' | 'Acknowledged' | 'Resolved';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  modelUsed?: string;
  audioBase64?: string;
  isAudioPlaying?: boolean;
  groundedSources?: string[];
  thinkingTokens?: string;
  attachedImageUrl?: string;
}
