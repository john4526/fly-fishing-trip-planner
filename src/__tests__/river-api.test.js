import { GET } from '@/app/api/river/route';
import { normalizeRiver, isStale, classifyFlow } from '@/lib/river';

const siteId = '03267900';
const feature = (code, value, time, extra = {}) => ({ geometry: { type: 'Point', coordinates: [-83, 40] }, properties: {
  monitoring_location_id: `USGS-${siteId}`, parameter_code: code, value, time, unit_of_measure: code === '00060' ? 'ft^3/s' : 'ft', ...extra,
} });
const old = '2026-10-29T11:00:00Z';
const recent = '2026-10-29T12:00:00Z';
const originalFetch = global.fetch;
afterEach(() => { global.fetch = originalFetch; });

it('chooses the newest observation for each parameter independently of order and unrelated readings', () => {
  const features = [feature('00060', '100', recent), feature('00065', '4', old), feature('00060', '80', old), feature('00010', '20', '2026-10-29T13:00:00Z'), feature('00060', '999', recent, { monitoring_location_id: 'USGS-00000000' })];
  const result = normalizeRiver({ features }, siteId);
  expect(result).toMatchObject({ flow: 100, height: 4, flowTimestamp: recent, heightTimestamp: old, timestamp: recent, flowUnit: 'cfs' });
  expect(normalizeRiver({ features: features.reverse() }, siteId)).toEqual(result);
});

it.each([null, '', 'Ice', '-999999', '123oops'])('marks the latest no-data reading %s unavailable instead of presenting an older flow as current', value => {
  const result = normalizeRiver({ features: [feature('00060', '100', old), feature('00060', value, recent)] }, siteId);
  expect(result.flow).toBeNull();
  expect(result.flowTimestamp).toBe(recent);
});

it('rejects unknown flow units, keeps zero, and does not infer a range for another gauge', () => {
  expect(normalizeRiver({ features: [feature('00060', '0', recent)] }, siteId).flow).toBe(0);
  expect(normalizeRiver({ features: [feature('00060', '100', recent, { unit_of_measure: 'm^3/s' })] }, siteId).flow).toBeNull();
  expect(classifyFlow(100, undefined).label).toBe('Comparison range unavailable');
  expect(isStale(old, Date.parse(recent) + 1)).toBe(true);
  expect(isStale(recent, Date.parse(recent) + 60_000)).toBe(false);
  expect(isStale(null)).toBe(true);
});

it('validates gauge IDs and bounds upstream requests', async () => {
  global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ features: [] }) });
  expect((await GET(new Request('http://localhost/api/river?siteId=123&foo=bar'))).status).toBe(400);
  expect(global.fetch).not.toHaveBeenCalled();
  const response = await GET(new Request(`http://localhost/api/river?siteId=${siteId}`));
  expect(response.status).toBe(200);
  expect((await response.json()).flow).toBeNull();
  expect(global.fetch.mock.calls[0][1].signal).toBeInstanceOf(AbortSignal);
  global.fetch.mockRejectedValue(new Error('timeout'));
  expect((await GET(new Request(`http://localhost/api/river?siteId=${siteId}`))).status).toBe(502);
});
