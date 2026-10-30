'use client';

import { useEffect, useState } from 'react';
import { RefreshCw, Waves } from 'lucide-react';
import { classifyFlow, isStale, measurementTime, readingAge } from '@/lib/river';
import { GAUGE_NAMES } from '@/config/gauges';
import styles from './Dashboard.module.css';

function Observation({ label, value, unit, timestamp, now }) {
  const age = readingAge(timestamp, now);
  const old = ['old', 'invalid', 'unknown'].includes(age.state);
  return <div className={styles.observation}>
    <h3>{label}</h3>
    <strong className={styles.observationValue}>{!Number.isFinite(value) ? 'Unavailable' : old ? 'No recent reading' : `${value} ${unit}`}</strong>
    {Number.isFinite(value) && old && <p>Last available: {value} {unit}</p>}
    <p className={age.state === 'recent' ? styles.observationRecent : styles.observationDelayed}>
      {age.state === 'old' ? '24+ hours old · ' : age.state === 'delayed' ? 'Delayed · ' : ''}{age.label}
    </p>
    <p className={styles.weatherTimestamp}>{measurementTime(timestamp)}</p>
  </div>;
}

export default function RiverPanel({ corridor, river, extra, gauges, activeGaugeId, onGaugeChange }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const tick = () => setNow(Date.now());
    const timer = setInterval(tick, 30000);
    window.addEventListener('focus', tick);
    return () => { clearInterval(timer); window.removeEventListener('focus', tick); };
  }, []);
  const active = gauges.find(g => g.siteId === activeGaugeId);
  const primary = activeGaugeId === corridor.gaugeId;
  const config = primary ? corridor : corridor.additionalGauges?.find(g => g.id === activeGaugeId);
  const source = corridor.gaugeSource;
  const range = active && !isStale(active.flowTimestamp, now) ? classifyFlow(active.flow, active.flowRange) : null;
  const busy = river.refreshing || extra.refreshing;
  const stationName = active?.name || GAUGE_NAMES[activeGaugeId] || corridor.gaugeName;
  const noLiveGauge = !corridor.gaugeId || corridor.gaugeHistorical;
  const choices = [
    ...(corridor.gaugeId ? [{ id: corridor.gaugeId, name: GAUGE_NAMES[corridor.gaugeId] || corridor.gaugeName || corridor.name }] : []),
    ...(corridor.additionalGauges || []).map(g => ({ id: g.id, name: GAUGE_NAMES[g.id] || g.name })),
  ];
  const retry = () => { river.retry(); extra.retry(); };

  return <section className={`${styles.card} ${styles.gaugePanel} glass`} aria-label="River observations">
    <div className={styles.gaugeHeading}>
      <h2 className={styles.cardTitle}><Waves size={18} /> USGS river observations</h2>
      {!noLiveGauge && <button className={styles.gaugeRefresh} onClick={retry} disabled={busy}>
        <RefreshCw size={14} /> {busy ? 'Checking…' : 'Refresh readings'}
      </button>}
    </div>
    {choices.length > 1 && <label className={styles.gaugeSelect}>Gauge location
      <select value={activeGaugeId || ''} onChange={e => onGaugeChange(e.target.value)}>{choices.map(g => <option key={g.id} value={g.id}>{g.name} ({g.id})</option>)}</select>
    </label>}
    {stationName && <p className={styles.gaugeStation}>{stationName}</p>}
    {(primary ? corridor.gaugeNote : config?.note) && <p className={styles.weatherTimestamp}>{primary ? corridor.gaugeNote : config.note} Source review: October 29, 2026.</p>}
    {noLiveGauge && <p className={styles.gaugeMessage}>{corridor.gaugeHistorical ? 'Historical station — no live readings requested.' : 'Live USGS readings unavailable for this corridor.'}</p>}
    {river.loading && <p role="status">Loading river observations…</p>}
    {active && <>
      <div className={styles.observationGrid}>
        <Observation label="Streamflow" value={active.flow} unit={active.flowUnit} timestamp={active.flowTimestamp} now={now} />
        <Observation label="Gauge height" value={active.height} unit={active.heightUnit} timestamp={active.heightTimestamp} now={now} />
      </div>
      {range?.percent !== undefined && <div className={styles.gaugeComparison}>
        <p>{range.label} · Reference {active.flowRange.min}–{active.flowRange.max} cfs</p>
        <div className={styles.progressBarTrack}><div className={styles.progressBarFill} style={{ width: `${range.percent}%`, backgroundColor: 'var(--color-primary-hover)' }} /></div>
      </div>}
      <p className={styles.weatherTimestamp}>USGS checked: {measurementTime(active.checkedAt)}. Measurement times above are separate and shown in your timezone.</p>
      {active.flowApproval && <p className={styles.weatherTimestamp}>Flow status: {active.flowApproval}{active.flowQualifier?.length ? ` · ${active.flowQualifier.join(', ')}` : ''}.</p>}
    </>}
    {!river.loading && !active && !noLiveGauge && !river.error && <p>No observation is available for the selected gauge.</p>}
    {river.error && <p role="alert" className={styles.gaugeError}>{river.data ? 'Refresh failed; the last received readings retain their original measurement times.' : 'Could not load river observations.'} Try Refresh readings again.</p>}
    {extra.error && <p role="alert" className={styles.gaugeError}>Some additional gauges could not be refreshed. Any retained reading keeps its original measurement time.</p>}
    {!noLiveGauge && <p className={styles.weatherTimestamp}>The app checks every five minutes and when you return to this tab. USGS stations may transmit hourly or experience delays; refreshing cannot create a newer observation. Readings over one hour old are marked delayed. Readings over 24 hours old are not presented as current conditions.</p>}
    <p className={styles.weatherTimestamp}>
      {activeGaugeId && <a href={`https://waterdata.usgs.gov/monitoring-location/USGS-${activeGaugeId}`} target="_blank" rel="noopener noreferrer">Open USGS station {activeGaugeId}</a>}
      {source && <a href={source.url} target="_blank" rel="noopener noreferrer">{source.label}</a>}
    </p>
    <p className={styles.weatherTimestamp}>Gauge readings and reference ranges do not establish safe wading at your access point.</p>
  </section>;
}
