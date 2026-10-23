import {
  LocationInfo,
  ObservationRecord,
  MonitoringStation,
  ForecastPoint,
  ModelMetrics,
  IoTSensor,
  AnomalyRecord,
  AlertRecord,
} from '../types';

export async function fetchHealth() {
  try {
    const res = await fetch('/api/health');
    return await res.json();
  } catch (e) {
    return { status: 'offline', error: (e as Error).message };
  }
}

export async function fetchLocations(): Promise<LocationInfo[]> {
  try {
    const res = await fetch('/api/locations');
    const data = await res.json();
    return data.locations || [];
  } catch (e) {
    console.error('Failed to fetch locations', e);
    return [];
  }
}

export async function fetchObservations(
  city: string = 'bhopal',
  limit: number = 48,
  stationId?: string
): Promise<{ observations: ObservationRecord[]; latest: ObservationRecord | null }> {
  try {
    const url = new URL('/api/observations', window.location.origin);
    url.searchParams.set('city', city);
    url.searchParams.set('limit', limit.toString());
    if (stationId) url.searchParams.set('station', stationId);

    const res = await fetch(url.toString());
    const data = await res.json();
    return {
      observations: data.observations || [],
      latest: data.latest || null,
    };
  } catch (e) {
    console.error('Failed to fetch observations', e);
    return { observations: [], latest: null };
  }
}

export async function fetchStations(city?: string): Promise<MonitoringStation[]> {
  try {
    const url = new URL('/api/stations', window.location.origin);
    if (city) url.searchParams.set('city', city);

    const res = await fetch(url.toString());
    const data = await res.json();
    return data.stations || [];
  } catch (e) {
    console.error('Failed to fetch stations', e);
    return [];
  }
}

export async function fetchForecast(
  city: string = 'bhopal',
  horizon: number = 72
): Promise<{
  city: string;
  generatedAt: string;
  modelMetrics: ModelMetrics;
  forecast: ForecastPoint[];
}> {
  try {
    const url = new URL('/api/forecast', window.location.origin);
    url.searchParams.set('city', city);
    url.searchParams.set('horizon', horizon.toString());

    const res = await fetch(url.toString());
    const data = await res.json();
    return data;
  } catch (e) {
    console.error('Failed to fetch forecast', e);
    throw e;
  }
}

export async function fetchSensors(): Promise<IoTSensor[]> {
  try {
    const res = await fetch('/api/sensors');
    const data = await res.json();
    return data.sensors || [];
  } catch (e) {
    console.error('Failed to fetch sensors', e);
    return [];
  }
}

export async function ingestSensorReading(payload: {
  sensorId: string;
  pm25: number;
  pm10: number;
  temperature?: number;
  humidity?: number;
  batteryVoltage?: number;
  wifiRssi?: number;
}) {
  try {
    const res = await fetch('/api/sensors/ingest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (e) {
    console.error('Failed to ingest sensor payload', e);
    throw e;
  }
}

export async function fetchAnomalies(): Promise<AnomalyRecord[]> {
  try {
    const res = await fetch('/api/anomalies');
    const data = await res.json();
    return data.anomalies || [];
  } catch (e) {
    console.error('Failed to fetch anomalies', e);
    return [];
  }
}

export async function fetchAlerts(): Promise<AlertRecord[]> {
  try {
    const res = await fetch('/api/alerts');
    const data = await res.json();
    return data.alerts || [];
  } catch (e) {
    console.error('Failed to fetch alerts', e);
    return [];
  }
}

export async function acknowledgeAlert(alertId: string) {
  try {
    const res = await fetch(`/api/alerts/${encodeURIComponent(alertId)}/ack`, {
      method: 'POST',
    });
    return await res.json();
  } catch (e) {
    console.error('Failed to acknowledge alert', e);
    throw e;
  }
}

export async function fetchAnalytics(city: string = 'bhopal') {
  try {
    const url = new URL('/api/analytics', window.location.origin);
    url.searchParams.set('city', city);
    const res = await fetch(url.toString());
    return await res.json();
  } catch (e) {
    console.error('Failed to fetch analytics', e);
    return null;
  }
}

export async function sendChatMessage(params: {
  message: string;
  history?: Array<{ role: string; text: string }>;
  modelPreference?: 'fast' | 'general' | 'complex';
  city?: string;
  enableThinking?: boolean;
}) {
  const res = await fetch('/api/assistant/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.details || errorData.error || 'Chat request failed');
  }
  return await res.json();
}

export async function synthesizeTTS(text: string): Promise<{ audioBase64: string; format: string }> {
  const res = await fetch('/api/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'TTS synthesis failed');
  }
  return await res.json();
}

export async function transcribeAudio(audioBase64: string, mimeType: string = 'audio/webm') {
  const res = await fetch('/api/transcribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ audioBase64, mimeType }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Audio transcription failed');
  }
  return await res.json();
}

export async function analyzeEnvironmentalImage(imageBase64: string, mimeType: string = 'image/jpeg', prompt?: string) {
  const res = await fetch('/api/analyze-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64, mimeType, prompt }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Image analysis failed');
  }
  return await res.json();
}
