'use client';

import { CloudSun } from 'lucide-react';
import styles from './Dashboard.module.css';

const value = (number, unit, digits = 0) => Number.isFinite(number) ? `${number.toFixed(digits)}${unit}` : 'Unavailable';
export function weatherTime(date, timezone) {
  if (!date || !Number.isFinite(Date.parse(date))) return 'Unavailable';
  return new Intl.DateTimeFormat('en-US', { timeZone: timezone, month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZoneName: 'short' }).format(new Date(date));
}

export default function WeatherPanel({ data, loading, error, retry }) {
  const c = data?.current;
  const direction = c?.windDirection || (Number.isFinite(c?.windDeg) ? ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.round(((c.windDeg % 360) + 360) % 360 / 45) % 8] : '');
  return <section className={`${styles.card} glass`}>
    <h2 className={styles.cardTitle}><CloudSun size={18} /> Weather Forecast</h2>
    {loading && <p role="status">Loading weather…</p>}
    {error && <p role="alert">{data ? 'Refresh failed; showing the last retrieved forecast. ' : ''}{error} <button onClick={retry} className={styles.btnText}>Retry weather</button></p>}
    {c && <div className={styles.weatherContent}>
      <p className={styles.weatherTimestamp}>{data.currentKind} · {weatherTime(c.time, data.timezone)}</p>
      <div className={styles.weatherMain}>
        <span className={styles.weatherTemp}>{value(c.temp, '°F')}</span>
        <span className={styles.weatherDesc}>{c.description}</span>
      </div>
      <dl className={styles.weatherDetailsGrid}>
        <div><dt>Feels like</dt><dd>{value(c.feelsLike, '°F')}</dd></div>
        <div><dt>Humidity</dt><dd>{value(c.humidity, '%')}</dd></div>
        <div><dt>Wind</dt><dd>{c.windLabel || value(c.windSpeed, ' mph')} {direction}</dd></div>
        <div><dt>Gusts</dt><dd>{value(c.windGust, ' mph')}</dd></div>
        <div><dt>Barometer</dt><dd>{value(c.pressure, ' hPa')}{c.pressureTendency && ` (${c.pressureTendency})`}</dd></div>
        <div><dt>Cloud cover</dt><dd>{value(c.cloudCover, '%')}</dd></div>
        <div><dt>Precipitation{c.precipitationIntervalMinutes ? ` (${c.precipitationIntervalMinutes} min)` : ' amount'}</dt><dd>{value(c.precipitation, ' in', 2)}</dd></div>
        <div><dt>Precipitation chance</dt><dd>{value(c.precipitationProbability, '%')}</dd></div>
        <div><dt>Sunrise</dt><dd>{weatherTime(c.sunrise, data.timezone)}</dd></div>
        <div><dt>Sunset</dt><dd>{weatherTime(c.sunset, data.timezone)}</dd></div>
      </dl>
      <div>
        <h3 className={styles.forecastTitle}>Five-day outlook</h3>
        <p className={styles.weatherTimestamp}>Temperature range and highest hourly precipitation chance for available hours. Today may be partial.</p>
        <div className={styles.dailyForecast}>
          {data.daily.map(day => <div key={day.date} className={styles.forecastItem}>
            <span>{new Intl.DateTimeFormat('en-US', { timeZone: data.timezone, weekday: 'short', month: 'short', day: 'numeric' }).format(new Date(day.dt * 1000))}</span>
            <strong>{value(day.low, '°')} – {value(day.high, '°F')}</strong>
            <span>{value(day.precipitationProbability, '%')} precip.</span>
          </div>)}
        </div>
        {data.daily.length < 5 && <p role="status">The provider returned fewer than five days.</p>}
      </div>
      <details><summary>Every three hours</summary>
        <div className={styles.forecastScroll}>
          {data.forecast.map(hour => <div key={hour.dt} className={styles.forecastItem}>
            <span>{weatherTime(new Date(hour.dt * 1000).toISOString(), data.timezone)}</span>
            <strong>{value(hour.temp, '°F')}</strong>
            <span>{hour.description}</span>
            <span>{value(hour.precipitationProbability, '%')} precip. chance</span>
            <span>{value(hour.precipitation, ' in', 2)} / hour</span>
          </div>)}
        </div>
      </details>
      <p className={styles.weatherTimestamp}>Source: <a href={data.provider === 'NWS' ? 'https://www.weather.gov/' : 'https://open-meteo.com/'} target="_blank" rel="noreferrer">{data.provider}</a> · Times at destination ({data.timezone})</p>
    </div>}
  </section>;
}
