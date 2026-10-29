'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Car, Fish, MapPin, Sun } from 'lucide-react';
import AccountPanel from '@/app/components/AccountPanel';
import { useAuth } from '@/context/AuthContext';
import { BASES, CHECKED_ON, PA_RULES, PLANNING_STREAMS } from '@/config/pa-planning';
import { budgetOuting, createPlan, directionsUrl, durationLabel, forecastNote, planSchema, timeLabel } from '@/lib/outing-plan';
import { loadPlan, savePlan } from '@/lib/plan-storage';
import styles from './planner.module.css';

const entries = Object.entries(PLANNING_STREAMS);
const streamOptions = excluded => entries.filter(([id]) => id !== excluded).map(([id, stream]) => <option key={id} value={id}>{stream.name}</option>);
const clockValue = minutes => `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;

export default function TripPlanner() {
  const { user, loading } = useAuth();
  return <main className={styles.page}>
    <nav className={styles.nav} aria-label="Planner navigation">
      <Link href="/states/pennsylvania"><ArrowLeft size={16} /> Pennsylvania rivers</Link>
      <details className={styles.account}><summary>{user ? 'Your account' : 'Sign in to sync plans'}</summary><AccountPanel /></details>
    </nav>
    <header className={styles.hero}>
      <h1>Two days on the water</h1>
      <p>Give each outing 4–6 hours from door to door. See what’s left to fish after the drive, then keep a second stream in reserve.</p>
    </header>
    {loading ? <p role="status">Checking your account…</p> : <SavedPlanner key={user?.uid || 'guest'} uid={user?.uid || null} />}
    <section className={styles.shortlist} aria-labelledby="shortlist-title">
      <div className={styles.sectionHeading}><h2 id="shortlist-title">Your Pennsylvania shortlist</h2><span>Sources checked {CHECKED_ON}</span></div>
      <p>Access notes describe specific areas, not permission along an entire stream. Check posted boundaries and current rules before each outing.</p>
      {entries.map(([id, stream]) => <article className={styles.stream} key={id}>
        <div><h3>{stream.name}</h3><p className={styles.muted}>{stream.area}</p><p>{stream.character}</p>
          <Link href={`/states/pennsylvania/corridors/${id}`} target="_blank" rel="noopener noreferrer">Current conditions & map</Link>
        </div>
        <div><h4><MapPin size={15} /> {stream.accessName}</h4><p>{stream.access}</p><a href={stream.accessSource} target="_blank" rel="noopener noreferrer">Access source</a>
          <h4>Rules for this reach</h4><p>{stream.regulations}</p><a href={stream.regulationSource} target="_blank" rel="noopener noreferrer">Read the regulation source</a>
          <p className={styles.gauge}>{stream.gaugeNote} <a href={`https://waterdata.usgs.gov/monitoring-location/USGS-${stream.gauge}`} target="_blank" rel="noopener noreferrer">USGS station {stream.gauge}</a></p>
        </div>
      </article>)}
      <p className={styles.method}>Travel allowances use an OSRM/OpenStreetMap routing snapshot between town centers and fishing areas, rounded up to five minutes. They exclude traffic, road closures, and winter delays. Check directions from your actual lodging and edit the allowance. Access time is your planning buffer, not a measured walk. <Link href="/planning-sources">Sources and method</Link></p>
    </section>
  </main>;
}

function SavedPlanner({ uid }) {
  const [loaded, setLoaded] = useState(null);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    // Keep storage access inside the promise so unavailable storage is handled.
    Promise.resolve().then(() => loadPlan(uid, uid ? null : window.localStorage)).then(result => {
      if (active) setLoaded(result);
    }).catch(() => {
      if (active) setLoaded({ error: uid ? 'Your account plan could not be loaded. Retry before making changes.' : 'The saved device plan could not be read. Retry, or start a new draft. The existing copy will only be replaced if you save.' });
    });
    return () => { active = false; };
  }, [uid, attempt]);
  if (!loaded) return <p role="status">Loading your plan…</p>;
  if (loaded.error) return <div className={styles.notice}>
    <p role="alert">{loaded.error}</p>
    <button onClick={() => { setLoaded(null); setAttempt(value => value + 1); }}>Retry loading</button>
    {!uid && <button onClick={() => setLoaded({ plan: createPlan(), source: 'new' })}>Start a new draft</button>}
  </div>;
  return <PlannerEditor uid={uid} initialPlan={loaded.plan} />;
}

export function PlannerEditor({ uid, initialPlan }) {
  const [plan, setPlan] = useState(initialPlan);
  const [dirty, setDirty] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState('');
  const [failure, setFailure] = useState('');
  const saving = useRef(false);
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const validation = planSchema.safeParse(plan);
  const issues = validation.success ? [] : [...new Set(validation.error.issues.map(issue => issue.message))];
  const change = next => { setPlan(next); setDirty(true); setMessage(''); setFailure(''); };
  const updateDay = (index, patch) => change({ ...plan, outings: plan.outings.map((day, i) => i === index ? { ...day, ...patch } : day) });

  async function save() {
    if (!validation.success || saving.current) return;
    saving.current = true; setPending(true); setFailure('');
    try {
      const result = await savePlan(plan, uid, uid ? null : window.localStorage);
      if (mounted.current) { setMessage(result); setDirty(false); }
    } catch {
      if (mounted.current) setFailure('Could not save your plan. Your edits are still here; try again.');
    } finally { saving.current = false; if (mounted.current) setPending(false); }
  }

  return <section aria-label="Two outing plan">
    <fieldset className={styles.trip} disabled={pending}>
      <legend>Trip window</legend>
      <label>First travel day<input type="date" value={plan.startDate} onChange={e => change({ ...plan, startDate: e.target.value })} /></label>
      <label>Last travel day<input type="date" value={plan.endDate} min={plan.startDate || undefined} onChange={e => change({ ...plan, endDate: e.target.value })} /></label>
      <p>Pick two different fishing days when your other plans settle. All times are Pennsylvania local time.</p>
    </fieldset>
    <div className={styles.outings}>
      {plan.outings.map((day, index) => <Outing key={index} day={day} number={index + 1} startDate={plan.startDate} endDate={plan.endDate} disabled={pending} onChange={patch => updateDay(index, patch)} />)}
    </div>
    {issues.length > 0 && <ul className={styles.errors} role="alert">{issues.map(issue => <li key={issue}>{issue}</li>)}</ul>}
    <div className={styles.saveBar}>
      <div><strong>{uid ? 'Save across your devices' : 'Keep this plan on this device'}</strong>
        <p>{uid ? 'Your account stores one two-outing plan. Saving replaces that plan.' : 'Sign in before planning if you want to sync. Device drafts stay separate from account plans.'}</p>
        {dirty && <p className={styles.unsaved}>Unsaved changes</p>}
        {message && <p role="status">{message}</p>}{failure && <p role="alert" className={styles.errors}>{failure}</p>}
      </div>
      <button className={styles.save} disabled={pending || !validation.success} onClick={save}>{pending ? 'Saving…' : 'Save plan'}</button>
    </div>
    <p className={styles.method}>Daylight is calculated for each stream and date, with fishing ending at least 30 minutes before sunset. It does not account for terrain, weather, or access restrictions. <a href={PA_RULES} target="_blank" rel="noopener noreferrer">Check license validity and current rules</a>, especially for trips crossing into a new year.</p>
  </section>;
}

function Outing({ day, number, startDate, endDate, disabled, onChange }) {
  const budget = budgetOuting(day);
  const backup = budgetOuting(day, true);
  return <fieldset className={styles.outing} disabled={disabled}>
    <legend>Outing {number}</legend>
    <div className={styles.inputs}>
      <label>Fishing date<input type="date" value={day.date} min={startDate || undefined} max={endDate || undefined} onChange={e => onChange({ date: e.target.value })} /></label>
      <label>Starting from<select value={day.baseId} onChange={e => onChange({ baseId: e.target.value, driveMinutes: null, backupDriveMinutes: null })}>{Object.entries(BASES).map(([id, base]) => <option key={id} value={id}>{base.name}</option>)}</select></label>
      <label>Total time away<select value={day.hours} onChange={e => onChange({ hours: Number(e.target.value) })}>{[4, 5, 6].map(hours => <option key={hours} value={hours}>{hours} hours</option>)}</select></label>
      <label>Leave at<input type="time" min="05:00" max="15:00" step="900" value={clockValue(day.departureMinutes)} onChange={e => { if (e.target.value) { const [h, m] = e.target.value.split(':').map(Number); onChange({ departureMinutes: h * 60 + m }); } }} /></label>
    </div>
    <label className={styles.wide}>Primary stream<select value={day.primaryId} onChange={e => onChange({ primaryId: e.target.value, driveMinutes: null, ...(e.target.value === day.backupId ? { backupId: day.primaryId, backupDriveMinutes: null } : {}) })}>{streamOptions()}</select></label>
    <div className={styles.inputs}>
      <label>One-way drive (minutes)<input type="number" min="0" max="240" step="1" value={day.driveMinutes ?? ''} placeholder={String(budget.stream.driveMinutes[day.baseId])} onChange={e => onChange({ driveMinutes: e.target.value === '' ? null : Number(e.target.value) })} /><small>Blank uses {budget.stream.driveMinutes[day.baseId]} min area estimate</small></label>
      <label>Gear & walking, total<select value={day.accessMinutes} onChange={e => onChange({ accessMinutes: Number(e.target.value) })}>{[0, 15, 30, 45, 60, 90, 120].map(minutes => <option key={minutes} value={minutes}>{minutes} minutes</option>)}</select><small>Includes getting in and getting back</small></label>
    </div>
    <div className={styles.result}>
      <div className={styles.resultTitle}><Fish size={21} /><strong>{durationLabel(budget.fishing)}</strong><span>left to fish{day.date ? ' in daylight' : ' before daylight limits'}</span></div>
      {budget.remaining >= 0 && <div className={styles.timeBar} role="img" aria-label={`${durationLabel(budget.travel)} driving, ${durationLabel(budget.access)} access, ${durationLabel(budget.fishing)} fishing, ${durationLabel(budget.daylightLost)} outside daylight`}>
        <span className={styles.travel} style={{ width: `${100 * budget.travel / budget.total}%` }} /><span className={styles.accessTime} style={{ width: `${100 * budget.access / budget.total}%` }} /><span className={styles.fishing} style={{ width: `${100 * budget.fishing / budget.total}%` }} /><span className={styles.unused} style={{ width: `${100 * budget.daylightLost / budget.total}%` }} />
      </div>}
      <p className={styles.breakdown}><Car size={15} /> {durationLabel(budget.travel)} round trip <span>+ {durationLabel(budget.access)} gear & walking</span></p>
      {!budget.fits ? <p className={styles.warning}>This outing leaves no fishing time. Choose a closer stream, an earlier start, or a longer window.</p> : <>
        <p>Fish {timeLabel(budget.start)}–{timeLabel(budget.end)} · Back by {timeLabel(budget.returnBy)}</p>
        {budget.short && <p className={styles.warning}>Less than two hours to fish. A closer stream gives more time on the water.</p>}
      </>}
      {budget.daylight && <p className={styles.daylight}><Sun size={15} /> Sunrise {timeLabel(budget.daylight.sunrise)} · Sunset {timeLabel(budget.daylight.sunset)}{budget.daylightLost > 0 ? ` · ${durationLabel(budget.daylightLost)} lost to daylight limits` : ''}</p>}
      <a href={directionsUrl(day.baseId, day.primaryId)} target="_blank" rel="noopener noreferrer">Check the drive from your lodging</a>
    </div>
    <div className={styles.backup}>
      <label>Backup stream<select value={day.backupId} onChange={e => onChange({ backupId: e.target.value, backupDriveMinutes: null })}>{streamOptions(day.primaryId)}</select></label>
      <label>Backup one-way drive (minutes)<input type="number" min="0" max="240" step="1" value={day.backupDriveMinutes ?? ''} placeholder={String(backup.stream.driveMinutes[day.baseId])} onChange={e => onChange({ backupDriveMinutes: e.target.value === '' ? null : Number(e.target.value) })} /></label>
      <p>{durationLabel(backup.fishing)} to fish · {durationLabel(backup.travel)} driving{!backup.fits ? ' · Does not fit this window' : ''}</p>
      <small>The backup replaces the primary, starting from the same base. It is not a second stop.</small>
      <a href={directionsUrl(day.baseId, day.backupId)} target="_blank" rel="noopener noreferrer">Check backup directions</a>
    </div>
    <p className={styles.forecast}>{forecastNote(day.date)}</p>
  </fieldset>;
}
