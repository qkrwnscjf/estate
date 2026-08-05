import { createClient } from '@supabase/supabase-js';

// Vercel 환경변수에서 주입받습니다. 없으면 null (가짜 데이터 모드)
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false } })
  : null;

// 가짜(Mock) 데이터 풀
const MOCK_REGIONS = [
  { code: "11680", name: "강남구", price: "2억 5,000", change: 1.2, radiusPattern: 0 },
  { code: "11440", name: "마포구", price: "1억 8,000", change: -0.5, radiusPattern: 1 },
  { code: "11620", name: "관악구", price: "1억 2,000", change: 0.8, radiusPattern: 2 },
  { code: "41110", name: "수원시", price: "1억 4,000", change: 2.1, radiusPattern: 3 },
  { code: "11215", name: "광진구", price: "1억 6,500", change: -0.2, radiusPattern: 4 },
  { code: "11710", name: "송파구", price: "2억 1,000", change: 1.5, radiusPattern: 5 },
];

const MOCK_TREND = [
  { name: "1월", price: 16500 }, { name: "2월", price: 16700 }, { name: "3월", price: 17100 },
  { name: "4월", price: 17000 }, { name: "5월", price: 17400 }, { name: "6월", price: 18000 }, { name: "7월", price: 18500 }
];

// 전체 지역 조회 (홈 화면용)
export async function getRegions() {
  if (!supabase) {
    console.log("[Mock] Supabase URL이 없어 가짜 데이터를 반환합니다.");
    return MOCK_REGIONS;
  }
  
  try {
    const { data, error } = await supabase.from('region_reference').select('*');
    if (error) throw error;
    
    // Supabase 데이터가 성공적으로 오면 UI에 맞게 매핑
    return data.map((r: any, i: number) => ({
      code: r.region_code,
      name: r.region_name,
      price: "1억 5,000", // 실제로는 region_trend 테이블을 조인해서 최신값을 가져와야 함
      change: 0.0,
      radiusPattern: i % 6
    }));
  } catch (err) {
    console.error("Supabase 연동 실패, 가짜 데이터 반환:", err);
    return MOCK_REGIONS; // 실패 시 안전하게 가짜 데이터 반환 (화면 깨짐 방지)
  }
}

// 특정 지역의 시계열 조회
export async function getRegionTrend(code: string, buildingType: string = '오피스텔') {
  if (!supabase) return MOCK_TREND;

  try {
    const { data, error } = await supabase
      .from('region_trend')
      .select('month, avg_price')
      .eq('region_code', code)
      .eq('building_type', buildingType)
      .order('month', { ascending: true })
      .limit(12);

    if (error) throw error;
    if (data.length === 0) return MOCK_TREND;

    return data.map((d: any) => ({
      name: new Date(d.month).getMonth() + 1 + "월",
      price: Number(d.avg_price)
    }));
  } catch (err) {
    console.error("Trend 조회 실패:", err);
    return MOCK_TREND;
  }
}
