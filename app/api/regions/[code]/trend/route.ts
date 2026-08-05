import { NextRequest, NextResponse } from 'next/server';
import { getRegionTrend } from '@/lib/queries';

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ code: string }> }
) {
  const params = await props.params;
  const { code } = params;
  
  const searchParams = request.nextUrl.searchParams;
  const buildingType = searchParams.get('buildingType');
  
  if (!buildingType) {
    return NextResponse.json({ error: 'Missing buildingType query parameter', code: 'BAD_REQUEST' }, { status: 400 });
  }

  try {
    const trend = await getRegionTrend(code, buildingType);
    
    return NextResponse.json({ regionCode: code, buildingType, trend }, {
      headers: {
        'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400'
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch trend', code: 'FETCH_ERROR' }, { status: 500 });
  }
}
