import { notFound } from "next/navigation";
import BuildingTypeTabs from "@/components/BuildingTypeTabs";
import SummaryStats from "@/components/SummaryStats";
import TrendChart from "@/components/TrendChart";
import { getRegionTrend } from "@/lib/api-client";

export const revalidate = 2592000; // 30 days

export function generateStaticParams() {
  const regions = [
    { code: "11620" }, { code: "11290" }, { code: "11410" }, { code: "11215" }, { code: "11230" },
    { code: "11440" }, { code: "11680" }, { code: "11650" }, { code: "11560" }, { code: "11710" },
    { code: "41110" }, { code: "41460" }, { code: "41130" }, { code: "41170" }
  ];
  return regions;
}

export default async function RegionDetailPage(props: { params: Promise<{ code: string }> }) {
  const params = await props.params;
  const { code } = params;
  
  // Dummy Region Name mapping for mockup UI
  const regionNames: Record<string, string> = {
    "11680": "강남구", "11440": "마포구", "11620": "관악구",
    "41110": "수원시", "11215": "광진구", "11710": "송파구",
  };
  const regionName = regionNames[code] || "선택된 지역";

  // API Client(Supabase)를 통해 실제 데이터를 가져옵니다. 
  // 환경변수가 없으면 Mock 데이터가 반환되어 오류를 막아줍니다.
  const trendData = await getRegionTrend(code, '오피스텔');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-secondary/10 rounded-[40%_60%_70%_30%/40%_70%_30%_60%] blur-3xl -z-10 translate-x-1/4 -translate-y-1/4 pointer-events-none" />

      <header className="mb-14">
        <h1 className="font-heading text-4xl md:text-6xl font-bold text-foreground mb-4">{regionName} 시세 분석</h1>
        <p className="text-lg md:text-xl text-muted-foreground font-medium">유기적인 시세 변화를 자연의 흐름처럼 한눈에</p>
      </header>

      <BuildingTypeTabs />

      <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
        <div className="lg:col-span-2 bg-[#FEFEFA] border border-border/50 rounded-[2.5rem] rounded-tr-[5rem] p-6 sm:p-10 shadow-soft relative overflow-hidden">
           <div className="absolute inset-0 opacity-[0.03] mix-blend-multiply pointer-events-none" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")" }} />
           
           <h3 className="font-heading text-2xl sm:text-3xl font-semibold mb-8 text-foreground relative z-10">시세 트렌드</h3>
           <div className="relative z-10">
             <TrendChart data={trendData} />
           </div>
        </div>

        <div className="space-y-8">
          <SummaryStats />
        </div>
      </div>
    </div>
  );
}
