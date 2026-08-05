import { TrendingUp, Activity, Home } from "lucide-react";

export default function SummaryStats() {
  return (
    <div className="bg-[#FEFEFA] border border-border/50 rounded-[2.5rem] rounded-bl-[4rem] p-8 sm:p-10 shadow-float relative overflow-hidden h-full flex flex-col justify-center min-h-[24rem]">
      <div className="absolute inset-0 opacity-[0.03] mix-blend-multiply pointer-events-none" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")" }} />
      
      <h3 className="font-heading text-2xl sm:text-3xl font-semibold mb-10 relative z-10 text-foreground">요약 지표</h3>
      
      <div className="space-y-8 relative z-10">
        <div className="flex items-center group">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-105 transition-all duration-500 mr-5 shadow-sm">
            <Home size={24} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">최신 평균 전세환산가</p>
            <p className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">1억 8,500만</p>
          </div>
        </div>

        <div className="flex items-center group">
          <div className="h-14 w-14 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-secondary-foreground group-hover:scale-105 transition-all duration-500 mr-5 shadow-sm">
            <TrendingUp size={24} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">전월 대비 (MoM)</p>
            <p className="text-2xl sm:text-3xl font-bold text-primary tracking-tight">+1.2%</p>
          </div>
        </div>

        <div className="flex items-center group">
          <div className="h-14 w-14 rounded-2xl bg-muted/80 flex items-center justify-center text-muted-foreground group-hover:bg-foreground group-hover:text-background group-hover:scale-105 transition-all duration-500 mr-5 shadow-sm">
            <Activity size={24} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">거래 건수</p>
            <p className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">412<span className="text-lg font-normal text-muted-foreground ml-1">건</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
