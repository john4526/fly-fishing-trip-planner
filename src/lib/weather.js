function getWmoCodeDetails(code) {
  const mapping = {
    0: { description: "clear sky", main: "Clear", icon: "01d" },
    1: { description: "mainly clear", main: "Clear", icon: "02d" },
    2: { description: "partly cloudy", main: "Clouds", icon: "03d" },
    3: { description: "overcast", main: "Clouds", icon: "04d" },
    45: { description: "foggy", main: "Fog", icon: "50d" },
    48: { description: "depositing rime fog", main: "Fog", icon: "50d" },
    51: { description: "light drizzle", main: "Rain", icon: "09d" },
    53: { description: "moderate drizzle", main: "Rain", icon: "09d" },
    55: { description: "dense drizzle", main: "Rain", icon: "09d" },
    61: { description: "light rain", main: "Rain", icon: "10d" },
    63: { description: "moderate rain", main: "Rain", icon: "10d" },
    65: { description: "heavy rain", main: "Rain", icon: "10d" },
    71: { description: "light snow", main: "Snow", icon: "13d" },
    73: { description: "moderate snow", main: "Snow", icon: "13d" },
    75: { description: "heavy snow", main: "Snow", icon: "13d" },
    80: { description: "light rain showers", main: "Rain", icon: "09d" },
    81: { description: "moderate rain showers", main: "Rain", icon: "09d" },
    82: { description: "violent rain showers", main: "Rain", icon: "09d" },
    95: { description: "thunderstorm", main: "Thunderstorm", icon: "11d" }
  };
  return mapping[code] || { description: "unknown conditions", main: "Clouds", icon: "03d" };
}


const number = value => typeof value === 'number' && Number.isFinite(value) ? value : null;
const iso = value => number(value) !== null ? new Date(value * 1000).toISOString() : null;

export function localDate(seconds, timezone) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(seconds * 1000));
}

function validate(timezone, time, temperature) {
  if (!timezone || !Number.isFinite(time) || !Number.isFinite(temperature)) throw new Error('Incomplete weather response');
  localDate(time, timezone); // Reject an invalid IANA timezone before rendering.
}

function summarize(hours, timezone) {
  const days = new Map();
  for (const hour of hours) {
    const date = localDate(hour.dt, timezone);
    if (!days.has(date)) days.set(date, []);
    days.get(date).push(hour);
  }
  return [...days.entries()].slice(0, 5).map(([date, items]) => {
    const temperatures = items.map(h => h.temp).filter(Number.isFinite);
    const probabilities = items.map(h => h.precipitationProbability).filter(Number.isFinite);
    return {
      date, dt: items[0].dt,
      high: temperatures.length ? Math.max(...temperatures) : null,
      low: temperatures.length ? Math.min(...temperatures) : null,
      precipitationProbability: probabilities.length ? Math.max(...probabilities) : null,
    };
  });
}

export function normalizeOpenMeteo(data) {
  const c = data.current;
  validate(data.timezone, c?.time, c?.temperature_2m);
  const h = data.hourly;
  if (!Array.isArray(h?.time)) throw new Error('Missing hourly forecast');
  const hours = h.time.map((dt, i) => ({
    dt, temp: number(h.temperature_2m?.[i]), ...getWmoCodeDetails(h.weather_code?.[i]),
    windSpeed: number(h.wind_speed_10m?.[i]), windGust: number(h.wind_gusts_10m?.[i]),
    precipitation: number(h.precipitation?.[i]), precipitationProbability: number(h.precipitation_probability?.[i]),
  })).filter(h => Number.isFinite(h.dt) && h.dt >= c.time && h.dt < c.time + 120 * 3600);
  if (!hours.length) throw new Error('Empty hourly forecast');
  const priorIndex = h.time.findLastIndex(t => t <= c.time - 3 * 3600 && t >= c.time - 4 * 3600);
  const priorPressure = number(h.pressure_msl?.[priorIndex]);
  const pressure = number(c.pressure_msl);
  const change = pressure !== null && priorPressure !== null ? pressure - priorPressure : null;
  const today = localDate(c.time, data.timezone);
  const sunIndex = data.daily?.sunrise?.findIndex(t => Number.isFinite(t) && localDate(t, data.timezone) === today) ?? -1;
  return {
    provider: 'Open-Meteo', timezone: data.timezone, currentKind: 'Modeled current conditions',
    current: {
      time: iso(c.time), temp: c.temperature_2m, feelsLike: number(c.apparent_temperature),
      humidity: number(c.relative_humidity_2m), windSpeed: number(c.wind_speed_10m), windDeg: number(c.wind_direction_10m),
      windGust: number(c.wind_gusts_10m), ...getWmoCodeDetails(c.weather_code), pressure,
      pressureTendency: change === null ? null : change > 1 ? 'rising' : change < -1 ? 'falling' : 'steady',
      cloudCover: number(c.cloud_cover), precipitation: number(c.precipitation), precipitationProbability: null,
      precipitationIntervalMinutes: number(c.interval) === null ? null : c.interval / 60,
      sunrise: iso(data.daily?.sunrise?.[sunIndex]), sunset: iso(data.daily?.sunset?.[sunIndex]),
    },
    forecast: hours.filter((_, i) => i % 3 === 0), daily: summarize(hours, data.timezone),
  };
}

function temperature(period) {
  if (number(period.temperature) === null) return null;
  if (period.temperatureUnit === 'F') return period.temperature;
  if (period.temperatureUnit === 'C') return period.temperature * 9 / 5 + 32;
  return null;
}

function wind(value) {
  // Preserve ranges as source text; only single numeric mph values have a numeric speed.
  const match = typeof value === 'string' && value.match(/^(\d+(?:\.\d+)?) mph$/i);
  return match ? Number(match[1]) : null;
}

export function normalizeNws(data, timezone) {
  const periods = (data.properties?.periods || []).filter(p => Number.isFinite(Date.parse(p.startTime)) && temperature(p) !== null)
    .sort((a, b) => Date.parse(a.startTime) - Date.parse(b.startTime));
  const c = periods[0];
  const time = Date.parse(c?.startTime) / 1000;
  validate(timezone, time, c && temperature(c));
  const hours = periods.filter(p => Date.parse(p.startTime) / 1000 < time + 120 * 3600).map(p => ({
    dt: Date.parse(p.startTime) / 1000, temp: temperature(p), description: p.shortForecast || 'Conditions unavailable',
    windSpeed: wind(p.windSpeed), windLabel: p.windSpeed || null, windGust: wind(p.windGust),
    precipitation: null, precipitationProbability: number(p.probabilityOfPrecipitation?.value),
  }));
  return {
    provider: 'NWS', timezone, currentKind: 'Current hourly forecast',
    current: {
      time: c.startTime, temp: temperature(c), feelsLike: null, humidity: number(c.relativeHumidity?.value),
      windSpeed: wind(c.windSpeed), windLabel: c.windSpeed || null, windDirection: c.windDirection || null,
      windGust: wind(c.windGust), description: c.shortForecast || 'Conditions unavailable',
      pressure: null, pressureTendency: null, cloudCover: null, precipitation: null,
      precipitationProbability: number(c.probabilityOfPrecipitation?.value), precipitationIntervalMinutes: null,
      sunrise: null, sunset: null,
    },
    forecast: hours.filter((_, i) => i % 3 === 0), daily: summarize(hours, timezone),
  };
}
