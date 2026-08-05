import { createClient } from '@supabase/supabase-js';
import { Region, TrendPoint, RegionSummary, CompareResult } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// 서버 컴포넌트 및 API 라우트 공통 사용 (단일 인스턴스)
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false } })
  : null;

// Mock Fallbacks
const MOCK_REGIONS: Region[] = [
  { code: "11680", name: "강남구", tier: "서울 Tier 2" },
  { code: "11440", name: "마포구", tier: "서울 Tier 2" },
  { code: "11620", name: "관악구", tier: "서울 Tier 1" },
  { code: "41110", name: "수원시", tier: "경기" },
];

export async function getAllRegions(): Promise<Region[]> {
  if (!supabase) return MOCK_REGIONS;
  
  const { data, error } = await supabase.from('region_reference').select('*');
  if (error || !data) return MOCK_REGIONS;
  
  return data.map(r => ({
    code: r.region_code,
    name: r.region_name,
    tier: r.tier
  }));
}

export async function getRegionTrend(code: string, buildingType: string = '오피스텔', months: number = 12): Promise<TrendPoint[]> {
  const MOCK_TREND = [
    { name: "1월", price: 16500 }, { name: "2월", price: 16700 }, { name: "3월", price: 17100 },
    { name: "4월", price: 17000 }, { name: "5월", price: 17400 }, { name: "6월", price: 18000 }, { name: "7월", price: 18500 }
  ];
  if (!supabase) return MOCK_TREND;

  const { data, error } = await supabase
    .from('region_trend')
    .select('month, avg_price')
    .eq('region_code', code)
    .eq('building_type', buildingType)
    .order('month', { ascending: false })
    .limit(months);

  if (error || !data || data.length === 0) return MOCK_TREND;

  return data.reverse().map(d => ({
    name: new Date(d.month).getMonth() + 1 + "월",
    price: Number(d.avg_price)
  }));
}

export async function getRegionSummary(code: string, buildingType: string = '오피스텔'): Promise<RegionSummary> {
  const mockSummary = { currentPrice: "1억 8,500만", momChange: "+1.2%", txn: "412건" };
  if (!supabase) return mockSummary;

  const { data, error } = await supabase
    .from('region_trend')
    .select('avg_price, txn_count')
    .eq('region_code', code)
    .eq('building_type', buildingType)
    .order('month', { ascending: false })
    .limit(2);

  if (error || !data || data.length < 1) return mockSummary;

  const latest = data[0];
  const previous = data.length > 1 ? data[1] : null;

  const currentPriceFormatted = `${Math.floor(latest.avg_price / 10000)}억 ${(latest.avg_price % 10000).toLocaleString()}만`.replace(" 0만", "");
  const txnFormatted = `${latest.txn_count}건`;
  
  let momChangeStr = "0.0%";
  if (previous && previous.avg_price > 0) {
    const diff = latest.avg_price - previous.avg_price;
    const pct = (diff / previous.avg_price) * 100;
    momChangeStr = pct > 0 ? `+${pct.toFixed(1)}%` : `${pct.toFixed(1)}%`;
  }

  return {
    currentPrice: currentPriceFormatted,
    momChange: momChangeStr,
    txn: txnFormatted
  };
}

export async function getCompareData(codes: string[], buildingType: string = '오피스텔'): Promise<CompareResult[]> {
  const regions = await getAllRegions();
  const results: CompareResult[] = [];
  
  for (const code of codes) {
    const regionInfo = regions.find(r => r.code === code);
    const trend = await getRegionTrend(code, buildingType);
    results.push({
      regionCode: code,
      regionName: regionInfo ? regionInfo.name : "알수없음",
      trend
    });
  }
  return results;
}

export async function getLastUpdatedMonth(): Promise<string> {
  if (!supabase) return "2026년 8월";
  
  const { data, error } = await supabase
    .from('region_trend')
    .select('month')
    .order('month', { ascending: false })
    .limit(1);

  if (error || !data || data.length === 0) return "2026년 8월";
  
  const d = new Date(data[0].month);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월`;
}
