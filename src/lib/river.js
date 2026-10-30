export const STALE_AFTER_MS = 60 * 60 * 1000;

export function isStale(timestamp, now = Date.now()) {
  const time = Date.parse(timestamp);
  return !Number.isFinite(time) || now - time > STALE_AFTER_MS || time > now + 5 * 60 * 1000;
}

export function readingAge(timestamp, now = Date.now()) {
  const measured = Date.parse(timestamp);
  if (!Number.isFinite(measured)) return { state: 'unknown', label: 'Time unavailable' };
  if (measured > now + 5 * 60 * 1000) return { state: 'invalid', label: 'Timestamp is in the future' };
  const minutes = Math.max(0, Math.floor((now - measured) / 60000));
  const age = minutes < 1 ? 'Less than a minute ago' : minutes < 60 ? `${minutes} min ago`
    : minutes < 1440 ? `${Math.floor(minutes / 60)}h ${minutes % 60}m ago`
      : minutes < 525600 ? `${Math.floor(minutes / 1440)} days ago` : `${Math.floor(minutes / 525600)} years ago`;
  return { state: now - measured >= 86400000 ? 'old' : isStale(timestamp, now) ? 'delayed' : 'recent', label: age };
}

export function measurementTime(timestamp) {
  const measured = Date.parse(timestamp);
  if (!Number.isFinite(measured)) return 'Unavailable';
  return new Date(measured).toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZoneName: 'short' });
}

export function classifyFlow(flow, range) {
  if (!Number.isFinite(flow)) return { label: 'Flow unavailable', tone: 'unknown' };
  if (!range || !Number.isFinite(range.min) || !Number.isFinite(range.max) || range.max <= range.min) {
    return { label: 'Comparison range unavailable', tone: 'unknown' };
  }
  const padding = (range.max - range.min) / 2;
  const lower = Math.max(0, range.min - padding);
  const upper = range.max + padding;
  const percent = Math.max(0, Math.min(100, (flow - lower) / (upper - lower) * 100));
  const result = flow < range.min ? { label: 'Below reference range', tone: 'marginal' }
    : flow > range.max ? { label: 'Above reference range', tone: 'unsafe' }
      : { label: 'Within reference range', tone: 'optimal' };
  return { ...result, percent, zoneStart: (range.min - lower) / (upper - lower) * 100, zoneEnd: (range.max - lower) / (upper - lower) * 100 };
}

export function normalizeRiver(data, siteId) {
  if (!Array.isArray(data?.features)) throw new Error('Invalid USGS response');
  const latest = {};
  for (const feature of data.features) {
    const p = feature.properties;
    if (!p || !['00060', '00065'].includes(p.parameter_code) || p.monitoring_location_id !== `USGS-${siteId}`) continue;
    if (p.statistic_id && p.statistic_id !== '00011') continue;
    if (!Number.isFinite(Date.parse(p.time))) continue;
    const old = latest[p.parameter_code]?.properties;
    if (!old || Date.parse(p.time) > Date.parse(old.time) || (Date.parse(p.time) === Date.parse(old.time) && Date.parse(p.last_modified) > Date.parse(old.last_modified))) {
      latest[p.parameter_code] = feature;
    }
  }
  const measurement = (code, units) => {
    const p = latest[code]?.properties;
    const value = p?.value === null || p?.value === undefined || String(p.value).trim() === '' ? NaN : Number(p.value);
    // Unknown units and USGS no-data sentinels must never enter a range comparison.
    return {
      value: Number.isFinite(value) && value > -999999 && units.includes(p.unit_of_measure) ? value : null,
      time: p?.time || null, approval: p?.approval_status || null, qualifier: Array.isArray(p?.qualifier) ? p.qualifier.filter(q => typeof q === 'string') : null,
    };
  };
  const flow = measurement('00060', ['ft^3/s', 'cfs']);
  const height = measurement('00065', ['ft']);
  const coords = (latest['00060'] || latest['00065'])?.geometry?.coordinates;
  const validCoords = Array.isArray(coords) && Number.isFinite(coords[0]) && Number.isFinite(coords[1]) && Math.abs(coords[0]) <= 180 && Math.abs(coords[1]) <= 90;
  return {
    siteId, flow: flow.value, flowUnit: 'cfs', height: height.value, heightUnit: 'ft',
    timestamp: flow.time, flowTimestamp: flow.time, heightTimestamp: height.time,
    flowApproval: flow.approval, flowQualifier: flow.qualifier,
    latitude: validCoords ? coords[1] : null, longitude: validCoords ? coords[0] : null,
  };
}
