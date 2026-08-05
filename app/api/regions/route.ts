import { NextResponse } from 'next/server';
import { getAllRegions } from '@/lib/queries';

export async function GET() {
  try {
    const regions = await getAllRegions();
    return NextResponse.json({ regions }, {
      headers: {
        'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400'
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch regions', code: 'FETCH_ERROR' }, { status: 500 });
  }
}
