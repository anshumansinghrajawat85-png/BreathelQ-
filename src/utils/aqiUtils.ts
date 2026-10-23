import { AQICategory } from '../types';

/**
 * Official Indian CPCB NAQI (National Air Quality Index) breakpoints & categories
 */
export const AQI_LEVELS = [
  { min: 0, max: 50, category: 'Good' as AQICategory, color: '#22C55E', bgLight: 'rgba(34, 197, 94, 0.12)', label: 'Good' },
  { min: 51, max: 100, category: 'Satisfactory' as AQICategory, color: '#84CC16', bgLight: 'rgba(132, 204, 22, 0.12)', label: 'Satisfactory' },
  { min: 101, max: 200, category: 'Moderate' as AQICategory, color: '#EAB308', bgLight: 'rgba(234, 179, 8, 0.12)', label: 'Moderate' },
  { min: 201, max: 300, category: 'Poor' as AQICategory, color: '#F97316', bgLight: 'rgba(249, 115, 22, 0.12)', label: 'Poor' },
  { min: 301, max: 400, category: 'Very Poor' as AQICategory, color: '#EF4444', bgLight: 'rgba(239, 68, 68, 0.12)', label: 'Very Poor' },
  { min: 401, max: 500, category: 'Severe' as AQICategory, color: '#991B1B', bgLight: 'rgba(153, 27, 27, 0.15)', label: 'Severe' },
  { min: 501, max: 999, category: 'Severe+' as AQICategory, color: '#7F1D1D', bgLight: 'rgba(127, 29, 29, 0.2)', label: 'Severe Emergency' },
];

export function getAQICategory(aqi: number): AQICategory {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Satisfactory';
  if (aqi <= 200) return 'Moderate';
  if (aqi <= 300) return 'Poor';
  if (aqi <= 400) return 'Very Poor';
  if (aqi <= 500) return 'Severe';
  return 'Severe+';
}

export function getAQIColor(aqi: number): string {
  if (aqi <= 50) return '#22C55E';
  if (aqi <= 100) return '#84CC16';
  if (aqi <= 200) return '#EAB308';
  if (aqi <= 300) return '#F97316';
  if (aqi <= 400) return '#EF4444';
  if (aqi <= 500) return '#991B1B';
  return '#7F1D1D';
}

export function getAQIHealthAdvisory(category: AQICategory): {
  impact: string;
  generalAdvisory: string;
  sensitiveGroupAdvisory: string;
} {
  switch (category) {
    case 'Good':
      return {
        impact: 'Minimal health impact.',
        generalAdvisory: 'Air quality is ideal for all outdoor activities and exercises.',
        sensitiveGroupAdvisory: 'Enjoy full outdoor activities without restrictions.',
      };
    case 'Satisfactory':
      return {
        impact: 'Minor breathing discomfort to sensitive people.',
        generalAdvisory: 'Air quality is acceptable for outdoor walks and sports.',
        sensitiveGroupAdvisory: 'Unusually sensitive individuals should monitor symptoms.',
      };
    case 'Moderate':
      return {
        impact: 'Breathing discomfort to people with lung disease, asthma and heart ailments.',
        generalAdvisory: 'Plan vigorous outdoor exercise during early morning or late afternoon when dispersion improves.',
        sensitiveGroupAdvisory: 'Children, elderly, and individuals with respiratory issues should limit prolonged exertion.',
      };
    case 'Poor':
      return {
        impact: 'Breathing discomfort to most people on prolonged exposure.',
        generalAdvisory: 'Reduce prolonged or heavy outdoor exertion. Keep windows closed during traffic peaks.',
        sensitiveGroupAdvisory: 'Vulnerable groups should remain indoors and run HEPA air filtration if available.',
      };
    case 'Very Poor':
      return {
        impact: 'Respiratory illness on prolonged exposure. Significant effect on vulnerable cohorts.',
        generalAdvisory: 'Avoid outdoor exercise. Use N95 respirators if traveling through traffic corridors.',
        sensitiveGroupAdvisory: 'Strictly avoid outdoor activity; keep emergency rescue inhalers accessible.',
      };
    case 'Severe':
    case 'Severe+':
      return {
        impact: 'Affects healthy people and seriously impacts those with existing diseases.',
        generalAdvisory: 'Emergency health warning. Remain indoors, keep clean air rooms, avoid all non-essential exposure.',
        sensitiveGroupAdvisory: 'Complete physical exertion prohibition outdoors. Seek medical assistance if experiencing dyspnea.',
      };
  }
}

/**
 * Calculate Indian NAQI sub-index for PM2.5 (24h average breakpoints in µg/m³)
 */
export function calculatePM25SubIndex(pm25: number): number {
  if (pm25 <= 0) return 0;
  if (pm25 <= 30) return Math.round((50 / 30) * pm25);
  if (pm25 <= 60) return Math.round(50 + ((50 / 30) * (pm25 - 30)));
  if (pm25 <= 90) return Math.round(100 + ((100 / 30) * (pm25 - 60)));
  if (pm25 <= 120) return Math.round(200 + ((100 / 30) * (pm25 - 90)));
  if (pm25 <= 250) return Math.round(300 + ((100 / 130) * (pm25 - 120)));
  if (pm25 <= 380) return Math.round(400 + ((100 / 130) * (pm25 - 250)));
  return Math.min(500, Math.round(400 + ((100 / 130) * (pm25 - 250))));
}
