import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getAllRegions } from '@/lib/queries';

export async function POST(request: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;
  const authHeader = request.headers.get('x-revalidate-secret');

  if (!secret || authHeader !== secret) {
    return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
  }

  try {
    // 공통 경로 무효화
    revalidatePath('/', 'page');
    revalidatePath('/regions', 'page');
    
    // 14개 지정된 개별 지역 경로 무효화
    const regions = await getAllRegions();
    for (const r of regions) {
      revalidatePath(`/regions/${r.code}`, 'page');
    }
    
    return NextResponse.json({ 
      revalidated: true, 
      now: Date.now(),
      revalidatedPathsCount: regions.length + 2 
    });
  } catch (err) {
    return NextResponse.json({ error: 'Error revalidating', code: 'REVALIDATE_ERROR' }, { status: 500 });
  }
}
