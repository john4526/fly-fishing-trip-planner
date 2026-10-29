import { NextResponse } from 'next/server';
import { normalizeRiver } from '@/lib/river';

export async function GET(request) {
  const siteId = new URL(request.url).searchParams.get('siteId');
  if (!/^\d{8,15}$/.test(siteId || '')) {
    return NextResponse.json({ error: 'A valid USGS siteId is required' }, { status: 400 });
  }
  try {
    const query = new URLSearchParams({ monitoring_location_id: `USGS-${siteId}`, f: 'json', limit: '1000' });
    const response = await fetch(`https://api.waterdata.usgs.gov/ogcapi/v0/collections/latest-continuous/items?${query}`, {
      next: { revalidate: 300 }, signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) throw new Error('USGS unavailable');
    return NextResponse.json(normalizeRiver(await response.json(), siteId));
  } catch {
    return NextResponse.json({ error: 'Streamflow service temporarily unavailable' }, { status: 502 });
  }
}
