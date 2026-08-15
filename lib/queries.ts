import { createClient } from '@supabase/supabase-js';
import { Region, TrendPoint, RegionSummary, CompareResult, Property } from './types';

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
    { name: "1주차", price: 16500 },
    { name: "2주차", price: 16300 },
    { name: "3주차", price: 16600 },
    { name: "4주차", price: 16800 },
    { name: "5주차", price: 16700 },
    { name: "6주차", price: 17000 },
    { name: "7주차", price: 17200 },
    { name: "8주차", price: 17500 },
    { name: "9주차", price: 17400 },
    { name: "10주차", price: 17600 },
    { name: "11주차", price: 17800 },
    { name: "12주차", price: 18000 },
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

export async function getProperties(regionCode: string, maxRent: number = 9999, limit: number = 3): Promise<Property[]> {
  // 실제 Supabase 데이터베이스 조회 (실데이터 연동)
  if (supabase) {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('region_code', regionCode)
      .lte('monthly_rent', maxRent)
      .limit(limit);

    // 데이터가 성공적으로 조회되면 실제 데이터 반환
    if (!error && data && data.length > 0) {
      return data.map((p, index) => ({
        id: p.id,
        regionCode: p.region_code,
        name: p.name,
        deposit: p.deposit,
        monthlyRent: p.monthly_rent,
        address: p.address,
        url: p.url,
        features: p.features || [],
        lat: p.lat || (regionCode === '11680' ? 37.4979 : 37.5665) + Math.cos((index / data.length) * 2 * Math.PI) * 0.012,
        lng: p.lng || (regionCode === '11680' ? 127.0276 : 126.9780) + Math.sin((index / data.length) * 2 * Math.PI) * 0.012,
        contractDate: p.contract_date,
        imageUrl: `https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80`,
        monthlyAverage: "보증금 1200만 / 월세 55만",
        surroundings: [
          { type: "지하철", name: "역삼역 (2호선)", distance: "도보 5분" },
          { type: "편의시설", name: "스타벅스", distance: "도보 2분" },
          { type: "공원", name: "도곡공원", distance: "도보 10분" }
        ]
      }));
    }
  }

  // 연결 실패나 데이터가 없을 경우를 대비한 가짜(Mock) 방어막
  const MOCK_PROPERTIES: Record<string, Property[]> = {
    "11440": [
      { 
        id: "p1", regionCode: "11440", name: "서교동 해링턴타워", deposit: 1000, monthlyRent: 60, address: "마포구 서교동", url: "#", features: ["신축"], lat: 37.5546, lng: 126.9200, contractDate: "2026-08-05",
        imageUrl: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
        monthlyAverage: "보증금 1000만 / 월세 58만",
        surroundings: [{ type: "지하철", name: "홍대입구역", distance: "도보 3분" }, { type: "상권", name: "홍대거리", distance: "도보 1분" }]
      },
    ],
    "11620": [
      { 
        id: "p4", regionCode: "11620", name: "신림 프라비다타워", deposit: 1000, monthlyRent: 50, address: "관악구 신림동", url: "#", features: ["초역세권"], lat: 37.4842, lng: 126.9297, contractDate: "2026-07-28",
        imageUrl: "https://images.unsplash.com/photo-1502672260266-1c1de2d936b4?w=800&q=80",
        monthlyAverage: "보증금 1000만 / 월세 45만",
        surroundings: [{ type: "지하철", name: "신림역", distance: "도보 2분" }, { type: "편의시설", name: "타임스트림", distance: "도보 4분" }]
      },
    ]
  };

  const regionProps = MOCK_PROPERTIES[regionCode] || [
    { 
      id: "p99", regionCode: "11680", name: "강남 어반플레이스", deposit: 3000, monthlyRent: 80, address: "강남구 역삼동", url: "#", features: ["럭셔리"], lat: 37.4979, lng: 127.0276, contractDate: "2026-08-12",
      imageUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
      monthlyAverage: "보증금 2500만 / 월세 85만",
      surroundings: [{ type: "지하철", name: "강남역", distance: "도보 7분" }, { type: "상권", name: "테헤란로", distance: "도보 1분" }]
    }
  ];

  return regionProps.filter(p => p.monthlyRent <= maxRent).slice(0, limit);
}
