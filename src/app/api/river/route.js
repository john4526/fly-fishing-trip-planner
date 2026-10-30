import { NextResponse } from 'next/server';
import { normalizeRiver } from '@/lib/river';

export async function GET(request) {
  const siteId = new URL(request.url).searchParams.get('siteId');
  if (!/^\d{8,15}$/.test(siteId || '')) {
    return NextResponse.json({ error: 'A valid USGS siteId is required' }, { status: 400 });
  }
  try {
    const query = new URLSearchParams({ monitoring_location_id: `USGS-${siteId}`, parameter_code: '00060,00065', f: 'json', limit: '1000' });
    const response = await fetch(`https://api.waterdata.usgs.gov/ogcapi/v1/collections/latest-continuous/items?${query}`, {
      // An expired Next.js revalidation entry can return the old reading first.
      // River requests must await USGS; the browser polls every five minutes.
      cache: 'no-store', signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) throw new Error('USGS unavailable');
    const data = normalizeRiver(await response.json(), siteId);
    return NextResponse.json({ ...data, checkedAt: new Date().toISOString() }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'Streamflow service temporarily unavailable' }, { status: 502 });
  }
}
