export interface Region {
  code: string;
  name: string;
  tier: string;
}

export interface TrendPoint {
  name: string; // "1월", "2월" 등
  price: number;
}

export interface RegionSummary {
  currentPrice: string; // "1억 8,500만" 형식
  momChange: string;    // "+1.2%" 형식
  txn: string;          // "412건" 형식
}

export interface CompareResult {
  regionCode: string;
  regionName: string;
  trend: TrendPoint[];
}

export interface Property {
  id: string;
  regionCode: string;
  name: string;
  deposit: number;
  monthlyRent: number;
  address: string;
  url: string;
  features: string[];
  lat?: number;
  lng?: number;
  contractDate?: string;
  imageUrl?: string;
  monthlyAverage?: string;
  surroundings?: { type: string; name: string; distance: string }[];
  trend?: { name: string; price: number }[];
}
