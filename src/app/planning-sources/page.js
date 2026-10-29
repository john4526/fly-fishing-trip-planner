import Link from 'next/link';
import { CHECKED_ON, PLANNING_STREAMS } from '@/config/pa-planning';
import styles from '../plan/planner.module.css';

export const metadata = { title: 'Planning sources | StreamPlanner' };

export default function PlanningSources() {
  return <main className={`${styles.page} ${styles.sources}`}>
    <Link href="/plan">← Back to your plan</Link>
    <header className={styles.hero}><h1>What goes into your plan</h1><p>Source review: {CHECKED_ON}. Estimates help compare outings; check the actual drive and access before leaving.</p></header>
    <h2>Driving allowances</h2>
    <p>A one-time <a href="https://project-osrm.org/docs/v5.24.0/api/#table-service">OSRM routing table</a>, using <a href="https://www.openstreetmap.org/copyright">OpenStreetMap data</a>, connects Hershey and Lancaster town centers to the three fishing areas. We take the longer direction and round up to the next five minutes for a one-way allowance. These are area estimates, not live traffic or routes from your lodging.</p>
    <table><caption>One-way planning minutes</caption><thead><tr><th scope="col">Stream</th><th scope="col">Hershey</th><th scope="col">Lancaster</th></tr></thead><tbody>{Object.entries(PLANNING_STREAMS).map(([id, stream]) => <tr key={id}><th scope="row">{stream.name}</th><td>{stream.driveMinutes.hershey}</td><td>{stream.driveMinutes.lancaster}</td></tr>)}</tbody></table>
    <h2>Time on the water</h2>
    <p>Each 4–6 hour window includes two drives and your gear/walking buffer, split equally before and after fishing. Change the buffer to suit your access. A backup is a replacement outing from the same base, not another stop.</p>
    <p><a href="https://github.com/mourner/suncalc">SunCalc</a> calculates sunrise and sunset for the stream coordinates and selected date. Times use America/New_York, including daylight saving changes. Fishing starts no earlier than sunrise and ends at least 30 minutes before sunset. Terrain and weather can reduce useful light further. With no date selected, the estimate has no daylight limit.</p>
    <h2>Access, rules, and gauges</h2>
    {Object.entries(PLANNING_STREAMS).map(([id, stream]) => <section key={id}><h3>{stream.name}</h3><p>{stream.access} <a href={stream.accessSource}>Access source</a>.</p><p>{stream.regulations} <a href={stream.regulationSource}>Regulation source</a>.</p><p>{stream.gaugeNote} <a href={`https://waterdata.usgs.gov/monitoring-location/USGS-${stream.gauge}`}>USGS station</a>.</p></section>)}
    <p>The shortlist is a limited source review. Other corridor access descriptions and reference ranges have not all been independently verified. Current readings and a five-day outlook cannot predict conditions for a trip months away. Recheck rules, license validity, weather, flow, road conditions, and lawful access near departure.</p>
  </main>;
}
