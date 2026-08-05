"use client";
import type { CompareResult } from "@/lib/types";

interface CompareChartProps {
  data: CompareResult[];
}

export default function CompareChart({ data }: CompareChartProps) {
  return (
    <div className="h-64 flex items-center justify-center border border-dashed border-border/50 rounded-2xl bg-secondary/5 text-muted-foreground">
      {data.length}개 지역의 차트 렌더링 영역 (Recharts 연동 예정)
    </div>
  );
}
