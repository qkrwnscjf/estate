"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import CompareSelector from "@/components/CompareSelector";
import CompareChart from "@/components/CompareChart";
import CompareTable from "@/components/CompareTable";
import type { CompareResult } from "@/lib/types";

export default function ComparePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const codesParam = searchParams.get("codes") || "";
  const buildingType = searchParams.get("buildingType") || "오피스텔";
  
  const [data, setData] = useState<CompareResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!codesParam) {
      setData([]);
      return;
    }

    const codes = codesParam.split(",").filter(Boolean);
    if (codes.length > 4) {
      setError("비교는 최대 4개 지역까지만 가능합니다.");
      return;
    }

    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/compare?codes=${codesParam}&buildingType=${buildingType}`);
        if (!res.ok) throw new Error("데이터를 불러오는데 실패했습니다.");
        const json = await res.json();
        setData(json.results || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [codesParam, buildingType]);

  const handleCodesChange = (newCodes: string[]) => {
    if (newCodes.length > 4) {
      alert("최대 4개까지만 선택할 수 있습니다.");
      return;
    }
    const newParams = new URLSearchParams(searchParams.toString());
    if (newCodes.length > 0) {
      newParams.set("codes", newCodes.join(","));
    } else {
      newParams.delete("codes");
    }
    router.push(`/compare?${newParams.toString()}`);
  };

  const currentCodes = codesParam ? codesParam.split(",").filter(Boolean) : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-primary/5 rounded-[40%_60%_70%_30%/40%_70%_30%_60%] blur-3xl -z-10 translate-x-1/4 -translate-y-1/4 pointer-events-none" />

      <header className="mb-14">
        <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">지역 시세 비교</h1>
        <p className="text-lg text-muted-foreground font-medium">관심 있는 지역들의 시세 흐름을 한눈에 비교해보세요. (최대 4개)</p>
      </header>

      <div className="space-y-12">
        <CompareSelector selectedCodes={currentCodes} onChange={handleCodesChange} />
        
        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100">
            {error}
          </div>
        )}

        {loading && (
          <div className="py-20 text-center text-muted-foreground animate-pulse">
            데이터를 불러오는 중입니다...
          </div>
        )}

        {!loading && !error && data.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-[#FEFEFA] border border-border/50 rounded-[2.5rem] p-6 sm:p-10 shadow-soft">
              <h3 className="font-heading text-2xl font-semibold mb-6">트렌드 비교</h3>
              <CompareChart data={data} />
            </div>
            <div className="bg-[#FEFEFA] border border-border/50 rounded-[2.5rem] p-6 sm:p-10 shadow-soft">
              <h3 className="font-heading text-2xl font-semibold mb-6">상세 지표</h3>
              <CompareTable data={data} />
            </div>
          </div>
        )}

        {!loading && !error && data.length === 0 && (
          <div className="py-20 text-center text-muted-foreground bg-[#FEFEFA]/50 border border-border/50 rounded-[2.5rem]">
            비교할 지역을 선택해주세요.
          </div>
        )}
      </div>
    </div>
  );
}
