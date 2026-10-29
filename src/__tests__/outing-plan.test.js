import { budgetOuting, createPlan, daylightFor, directionsUrl, forecastNote, planSchema, validDate } from '@/lib/outing-plan';
import { PLANNING_STREAMS } from '@/config/pa-planning';
import { STATES } from '@/config/rivers';

const day = patch => ({ ...createPlan().outings[0], ...patch });
const datedPlan = () => ({ ...createPlan(), startDate: '2030-12-28', endDate: '2031-01-03' });

it('subtracts two drives and the total access buffer from each 4–6 hour window', () => {
  for (const hours of [4, 5, 6]) {
    const budget = budgetOuting(day({ hours }));
    expect(budget.fishing).toBe(hours * 60 - 100 - 30);
    expect(budget.returnBy).toBe(600 + hours * 60);
  }
  expect(budgetOuting(day({ driveMinutes: 0 })).travel).toBe(0);
  expect(budgetOuting(day({ driveMinutes: 70 })).travel).toBe(140);
});

it('keeps the State College drive in the budget and calculates a backup independently', () => {
  const outing = day({ baseId: 'lancaster', hours: 6, primaryId: 'spring-creek', backupId: 'yellow-breeches' });
  expect(budgetOuting(outing)).toMatchObject({ travel: 340, fishing: 0, fits: false });
  expect(budgetOuting(outing, true)).toMatchObject({ travel: 160, fishing: 170, fits: true });
  expect(budgetOuting({ ...outing, baseId: 'hershey' })).toMatchObject({ fishing: 40, short: true });
});

it('handles cross-year dates, rejects impossible dates, duplicate days, and days outside the trip', () => {
  const plan = datedPlan();
  plan.outings[0].date = '2030-12-29'; plan.outings[1].date = '2031-01-02';
  expect(planSchema.safeParse(plan).success).toBe(true);
  expect(validDate('2031-02-29')).toBe(false);
  expect(validDate('2032-02-29')).toBe(true);
  for (const date of ['2030-12-29', '2031-01-04', '2031-02-30']) {
    expect(planSchema.safeParse({ ...plan, outings: [plan.outings[0], { ...plan.outings[1], date }] }).success).toBe(false);
  }
  expect(planSchema.safeParse(createPlan()).success).toBe(true);
  expect(planSchema.safeParse({ ...plan, endDate: '' }).success).toBe(false);
  expect(planSchema.safeParse({ ...plan, endDate: '2031-03-01' }).success).toBe(false);
});

it('rejects malformed and unbounded saved data and bounds the preview of an invalid draft', () => {
  for (const patch of [{ hours: 7 }, { driveMinutes: -1 }, { driveMinutes: 1.5 }, { accessMinutes: 121 }, { primaryId: 'unknown' }, { backupId: 'yellow-breeches' }]) {
    expect(planSchema.safeParse({ ...createPlan(), outings: [day(patch), createPlan().outings[1]] }).success).toBe(false);
  }
  expect(planSchema.safeParse({ ...createPlan(), admin: true }).success).toBe(false);
  expect(budgetOuting(day({ driveMinutes: -5 })).travel).toBe(0);
});

it('uses Pennsylvania daylight across DST regardless of the machine timezone', () => {
  const stream = PLANNING_STREAMS['yellow-breeches'];
  const before = daylightFor('2030-11-02', stream);
  const after = daylightFor('2030-11-03', stream);
  expect(before.sunrise - after.sunrise).toBeGreaterThan(50);
  expect(before.sunrise - after.sunrise).toBeLessThan(70);
  const winter = daylightFor('2030-12-29', stream);
  expect(winter.sunrise).toBeGreaterThan(7 * 60);
  expect(winter.sunrise).toBeLessThan(8 * 60);
  expect(winter.sunset).toBeGreaterThan(16 * 60);
  expect(winter.sunset).toBeLessThan(18 * 60);
  const early = budgetOuting(day({ date: '2030-12-29', departureMinutes: 300 }));
  expect(early.start).toBe(winter.sunrise);
  expect(early.daylightLost).toBeGreaterThan(0);
  const late = budgetOuting(day({ date: '2030-12-29', departureMinutes: 840 }));
  expect(late.end).toBe(winter.sunset - 30);
  expect(late.fishing + late.daylightLost + late.access + late.travel).toBe(late.total);
});

it('distinguishes seasonal plans, recent outlooks, past dates, and unchosen dates', () => {
  const now = new Date('2030-10-10T16:00:00Z');
  expect(forecastNote('2030-12-29', now)).toContain('Seasonal planning');
  expect(forecastNote('2030-10-12', now)).toContain('available forecast dates');
  expect(forecastNote('2030-10-09', now)).toContain('has passed');
  expect(forecastNote('', now)).toContain('Choose a date');
  const url = new URL(directionsUrl('lancaster', 'yellow-breeches'));
  expect(url.searchParams.get('origin')).toBe('Lancaster, PA');
  expect(url.searchParams.get('destination')).toContain('1559');
});

it('maps corrected gauges to the right Pennsylvania rivers and marks the discontinued station', () => {
  const byId = Object.fromEntries(STATES.pennsylvania.corridors.map(c => [c.id, c]));
  expect(byId['penns-creek'].gaugeId).toBe('01555000');
  expect(byId['little-juniata'].gaugeId).toBe('01558000');
  expect(byId['penns-creek'].flowRange).toBeNull();
  expect(byId['letort-spring-run'].gaugeHistorical).toBe(true);
  expect(byId['yellow-breeches'].accessPoints[0].regulations).toContain('August 2026');
});
