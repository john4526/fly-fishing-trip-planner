import { readingAge, measurementTime } from '@/lib/river';
import { STATES } from '@/config/rivers';
import { GAUGE_NAMES } from '@/config/gauges';

const now = Date.parse('2026-10-29T22:00:00Z');
it('distinguishes one-hour delay from 24-hour old data, unknown and invalid times', () => {
  const atAge = age => readingAge(new Date(now - age).toISOString(), now);
  expect(atAge(0)).toEqual({ state: 'recent', label: 'Less than a minute ago' });
  expect(atAge(3600000).state).toBe('recent');
  expect(atAge(3600001).state).toBe('delayed');
  expect(atAge(86400000).state).toBe('old');
  expect(readingAge(null, now).state).toBe('unknown');
  expect(readingAge('not a date', now).state).toBe('unknown');
  expect(atAge(-300001).state).toBe('invalid');
  expect(atAge(-60000).label).toBe('Less than a minute ago');
  expect(measurementTime('1993-10-01T03:00:00Z')).toContain('1993');
  expect(measurementTime(null)).toBe('Unavailable');
});

it('uses verified same-river stations without inheriting ranges, and preserves current height at Clear Fork', () => {
  const corridors = Object.values(STATES).flatMap(s => s.corridors);
  const find = id => corridors.find(c => c.id === id);
  expect(find('clark-fork-river')).toMatchObject({ gaugeId: '12340500', flowRange: null });
  expect(find('blackfoot-river')).toMatchObject({ gaugeId: '12340000', flowRange: null });
  expect(find('south-holston')).toMatchObject({ gaugeId: null, flowRange: null });
  expect(corridors.find(c => c.gaugeId === '04135500').gaugeHistorical).toBe(true);
  expect(corridors.find(c => c.gaugeId === '03131982').gaugeHistorical).not.toBe(true);
  for (const corridor of corridors) {
    for (const id of [corridor.gaugeId, ...(corridor.additionalGauges || []).map(g => g.id)].filter(Boolean)) {
      expect(GAUGE_NAMES[id]).toBeTruthy();
      expect(['03497300', '06054500', '06052500']).not.toContain(id);
    }
  }
});
