import { z } from 'zod';
import { getTimes } from 'suncalc';
import { BASES, PLANNING_STREAMS } from '@/config/pa-planning';

export const TIME_ZONE = 'America/New_York';
const streamIds = Object.keys(PLANNING_STREAMS);
export function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T12:00:00Z`);
  return Number.isFinite(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value;
}
const date = z.string().refine(value => value === '' || validDate(value), 'Choose a valid calendar date.');
const outing = z.object({
  date, baseId: z.enum(Object.keys(BASES)), hours: z.number().int().min(4).max(6),
  departureMinutes: z.number().int().min(300).max(900),
  primaryId: z.enum(streamIds), backupId: z.enum(streamIds),
  driveMinutes: z.number().int().min(0).max(240).nullable(),
  backupDriveMinutes: z.number().int().min(0).max(240).nullable(),
  accessMinutes: z.number().int().min(0).max(120),
}).strict().refine(day => day.primaryId !== day.backupId, 'Choose a different backup stream.');

export const planSchema = z.object({
  version: z.literal(1), startDate: date, endDate: date, outings: z.array(outing).length(2),
}).strict().superRefine((plan, ctx) => {
  const issue = message => ctx.addIssue({ code: 'custom', message });
  if (Boolean(plan.startDate) !== Boolean(plan.endDate)) issue('Choose both trip dates.');
  if (plan.startDate && plan.endDate && plan.endDate <= plan.startDate) issue('The trip needs at least two different days.');
  if (plan.startDate && plan.endDate && (Date.parse(plan.endDate) - Date.parse(plan.startDate)) / 86400000 > 31) issue('Keep the trip window within 31 days.');
  const dates = plan.outings.map(day => day.date).filter(Boolean);
  if (dates.length === 2 && dates[0] === dates[1]) issue('Choose two different outing dates.');
  for (const selected of dates) {
    if (!plan.startDate || !plan.endDate || selected < plan.startDate || selected > plan.endDate) issue('Each outing must fall within the trip dates.');
  }
});

export function createPlan() {
  return { version: 1, startDate: '', endDate: '', outings: [
    { date: '', baseId: 'hershey', hours: 5, departureMinutes: 600, primaryId: 'yellow-breeches', backupId: 'letort-spring-run', driveMinutes: null, backupDriveMinutes: null, accessMinutes: 30 },
    { date: '', baseId: 'hershey', hours: 6, departureMinutes: 540, primaryId: 'letort-spring-run', backupId: 'yellow-breeches', driveMinutes: null, backupDriveMinutes: null, accessMinutes: 30 },
  ] };
}

export function timeLabel(minutes) {
  if (!Number.isFinite(minutes)) return 'Unavailable';
  const rounded = Math.round(minutes);
  const hour = Math.floor(rounded / 60) % 24;
  return `${hour % 12 || 12}:${String(rounded % 60).padStart(2, '0')} ${hour >= 12 ? 'PM' : 'AM'}`;
}
export function durationLabel(minutes) {
  if (!Number.isFinite(minutes)) return 'Unavailable';
  const value = Math.max(0, Math.round(minutes));
  return `${Math.floor(value / 60)}h ${String(value % 60).padStart(2, '0')}m`;
}
function localMinutes(instant) {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: TIME_ZONE, hourCycle: 'h23', hour: '2-digit', minute: '2-digit' }).formatToParts(instant);
  return Number(parts.find(p => p.type === 'hour').value) * 60 + Number(parts.find(p => p.type === 'minute').value);
}
export function daylightFor(date, stream) {
  if (!validDate(date)) return null;
  // UTC afternoon is near local noon in Pennsylvania in both EST and EDT.
  const times = getTimes(new Date(`${date}T17:00:00Z`), stream.latitude, stream.longitude);
  if (!times.sunrise || !times.sunset) return null;
  return { sunrise: localMinutes(times.sunrise), sunset: localMinutes(times.sunset) };
}
export function budgetOuting(day, backup = false) {
  const stream = PLANNING_STREAMS[backup ? day.backupId : day.primaryId];
  const requestedDrive = (backup ? day.backupDriveMinutes : day.driveMinutes) ?? stream.driveMinutes[day.baseId];
  // Invalid draft input is blocked from saving; keep the preview bounded while editing.
  const drive = Number.isFinite(requestedDrive) ? Math.max(0, Math.min(240, requestedDrive)) : stream.driveMinutes[day.baseId];
  const total = day.hours * 60;
  const travel = drive * 2;
  const access = day.accessMinutes;
  const remaining = total - travel - access;
  const daylight = daylightFor(day.date, stream);
  const arrival = day.departureMinutes + drive;
  const start = Math.max(arrival + access / 2, daylight?.sunrise ?? 0);
  const end = Math.min(day.departureMinutes + total - drive - access / 2, daylight ? daylight.sunset - 30 : 1440);
  const fishing = Math.max(0, end - start);
  return { stream, drive, total, travel, access, remaining, fishing, start, end, daylight,
    daylightLost: Math.max(0, remaining - fishing),
    returnBy: day.departureMinutes + total,
    fits: remaining > 0 && fishing > 0,
    short: fishing > 0 && fishing < 120,
  };
}
export function directionsUrl(baseId, streamId) {
  return `https://www.google.com/maps/dir/?${new URLSearchParams({ api: '1', origin: `${BASES[baseId].name}, PA`, destination: PLANNING_STREAMS[streamId].destination, travelmode: 'driving' })}`;
}
export function forecastNote(date, now = new Date()) {
  if (!validDate(date)) return 'Choose a date to calculate daylight. The corridor dashboards show current conditions.';
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
  const days = (Date.parse(date) - Date.parse(today)) / 86400000;
  if (days < 0) return 'This outing date has passed. Current conditions are not a record of that day.';
  if (days >= 5) return 'Seasonal planning: the outing is beyond the app’s five-day forecast window. Check conditions closer to departure.';
  return 'Check the available forecast dates on the corridor dashboard; current readings do not predict the outing’s flow.';
}
