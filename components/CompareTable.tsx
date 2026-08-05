"use client";
import type { CompareResult } from "@/lib/types";

interface CompareTableProps {
  data: CompareResult[];
}

export default function CompareTable({ data }: CompareTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/50">
      <table className="w-full text-sm text-left">
        <thead className="bg-secondary/20 text-foreground">
          <tr>
            <th className="px-4 py-3 font-semibold">지역명</th>
            <th className="px-4 py-3 font-semibold">최근 시세 (평균)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/30 bg-[#FEFEFA]">
          {data.map((item) => (
            <tr key={item.regionCode}>
              <td className="px-4 py-4 font-medium text-foreground">{item.regionName}</td>
              <td className="px-4 py-4 text-muted-foreground">
                {item.trend.length > 0 ? `${item.trend[item.trend.length - 1].price.toLocaleString()}만` : '데이터 없음'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
