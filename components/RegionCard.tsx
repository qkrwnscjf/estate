import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface RegionCardProps {
  code: string;
  name: string;
  price: string;
  change: number;
  radiusPattern: number;
}

export default function RegionCard({ code, name, price, change, radiusPattern }: RegionCardProps) {
  // 6 different asymmetric border-radius patterns per ui_design.md
  const radii = [
    "rounded-[2rem] rounded-tl-[4rem]",
    "rounded-[2rem] rounded-tr-[5rem]",
    "rounded-[2rem] rounded-bl-[4rem]",
    "rounded-[2rem] rounded-br-[5rem] rounded-tl-[3rem]",
    "rounded-[3rem] rounded-tr-[2rem] rounded-bl-[2rem]",
    "rounded-[2.5rem] rounded-bl-[4rem]",
  ];

  const currentRadius = radii[radiusPattern % radii.length];
  const isPositive = change > 0;

  return (
    <Link href={`/regions/${code}`} className="block group h-full">
      <div
        className={`bg-[#FEFEFA] border border-border/50 ${currentRadius} p-6 sm:p-8 relative overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:shadow-float shadow-soft h-full flex flex-col justify-between min-h-[18rem]`}
      >
        {/* Card Noise Texture */}
        <div className="absolute inset-0 opacity-[0.03] mix-blend-multiply pointer-events-none" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")" }} />
        
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-8">
            <h4 className="font-heading text-2xl sm:text-3xl text-foreground font-medium group-hover:text-primary transition-colors duration-300">
              {name}
            </h4>
            <span
              className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold tracking-wide ${
                isPositive ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
              }`}
            >
              {isPositive ? "+" : ""}{change}%
            </span>
          </div>

          <div>
            <p className="text-muted-foreground text-sm mb-2 font-medium tracking-wide">평균 전세환산가</p>
            <p className="font-sans text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
              {price}
              <span className="text-lg text-muted-foreground font-normal ml-1">만</span>
            </p>
          </div>
        </div>

        <div className="mt-8 flex justify-end relative z-10">
          <div className="h-12 w-12 rounded-[1rem] bg-muted/60 flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-110 transition-all duration-500">
            <ArrowRight size={20} strokeWidth={2.5} />
          </div>
        </div>
      </div>
    </Link>
  );
}
