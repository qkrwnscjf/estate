import { NextRequest, NextResponse } from 'next/server';
import { getCompareData } from '@/lib/queries';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const codesParam = searchParams.get('codes');
  const buildingType = searchParams.get('buildingType');

  if (!codesParam || !buildingType) {
    return NextResponse.json({ error: 'Missing codes or buildingType parameter', code: 'BAD_REQUEST' }, { status: 400 });
  }

  const codes = codesParam.split(',').filter(Boolean);
  if (codes.length > 4) {
    return NextResponse.json({ error: 'Maximum 4 regions allowed for comparison', code: 'BAD_REQUEST' }, { status: 400 });
  }

  try {
    const results = await getCompareData(codes, buildingType);
    return NextResponse.json({ results }, {
      headers: {
        'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400'
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch compare data', code: 'FETCH_ERROR' }, { status: 500 });
  }
}
