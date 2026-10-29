import { NextResponse } from 'next/server';
import { normalizeOpenMeteo, normalizeNws } from '@/lib/weather';

const headers = { 'User-Agent': '(StreamPlanner, https://github.com/john4526/fly-fishing-trip-planner)' };

async function getJson(url, revalidate) {
  const response = await fetch(url, { headers, next: { revalidate }, signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new Error(`Weather provider returned ${response.status}`);
  return response.json();
}

export async function GET(request) {
  const params = new URL(request.url).searchParams;
  const lat = params.get('lat');
  const lon = params.get('lon');
  if (!lat?.trim() || !lon?.trim() || !Number.isFinite(Number(lat)) || !Number.isFinite(Number(lon)) || Math.abs(Number(lat)) > 90 || Math.abs(Number(lon)) > 180) {
    return NextResponse.json({ error: 'Valid lat and lon coordinates are required' }, { status: 400 });
  }
  const query = new URLSearchParams({
    latitude: lat, longitude: lon,
    current: 'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,pressure_msl,cloud_cover,wind_speed_10m,wind_direction_10m,wind_gusts_10m',
    hourly: 'temperature_2m,precipitation,precipitation_probability,weather_code,wind_speed_10m,wind_gusts_10m,pressure_msl',
    daily: 'sunrise,sunset', temperature_unit: 'fahrenheit', wind_speed_unit: 'mph', precipitation_unit: 'inch',
    timezone: 'auto', timeformat: 'unixtime', forecast_days: '6',
  });
  try {
    return NextResponse.json(normalizeOpenMeteo(await getJson(`https://api.open-meteo.com/v1/forecast?${query}`, 900)));
  } catch {
    try {
      const points = await getJson(`https://api.weather.gov/points/${Number(lat)},${Number(lon)}`, 86400);
      const url = new URL(points.properties?.forecastHourly);
      if (url.origin !== 'https://api.weather.gov' || url.username || url.password) throw new Error('Invalid NWS forecast URL');
      return NextResponse.json(normalizeNws(await getJson(url.href, 900), points.properties.timeZone));
    } catch {
      return NextResponse.json({ error: 'Weather services temporarily unavailable' }, { status: 503 });
    }
  }
}
