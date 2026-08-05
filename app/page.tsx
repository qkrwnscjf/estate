import SearchBar from "@/components/SearchBar";
import RegionGrid from "@/components/RegionGrid";
import { getRegions } from "@/lib/api-client";

export default async function Home() {
  const regions = await getRegions();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-24 relative overflow-hidden">
      {/* Background Blobs for Organic feel */}
      <div className="absolute top-0 left-0 w-[40rem] h-[40rem] bg-primary/10 rounded-[60%_40%_30%_70%/60%_30%_70%_40%] blur-3xl -z-10 -translate-x-1/4 -translate-y-1/4 pointer-events-none" />
      <div className="absolute top-40 right-0 w-[30rem] h-[30rem] bg-secondary/10 rounded-[40%_60%_70%_30%/40%_70%_30%_60%] blur-3xl -z-10 translate-x-1/4 pointer-events-none" />

      <section className="text-center max-w-4xl mx-auto mb-24 space-y-8">
        <h2 className="font-heading text-5xl md:text-7xl font-semibold text-foreground leading-tight">
          Find your grounded <br className="hidden md:block" /> space to live.
        </h2>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          서울 및 경기 주요 대학가·업무지구의 원룸, 오피스텔 전월세 시세를 자연스럽게 한눈에 확인하세요.
        </p>
        
        <div className="mt-12 max-w-2xl mx-auto">
          <SearchBar />
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-12">
          <h3 className="font-heading text-3xl font-medium text-foreground">Popular Regions</h3>
        </div>
        <RegionGrid regions={regions} />
      </section>
    </div>
  );
}
