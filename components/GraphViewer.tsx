"use client";

import dynamic from 'next/dynamic';

// Next.js SSR 환경에서 canvas 관련 에러를 방지하기 위해 CSR로 동적 임포트
const GraphViewerClient = dynamic(() => import('./GraphViewerClient'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[500px] flex items-center justify-center bg-[#FEFEFA]/50 rounded-[2rem] border border-[#DED8CF]/50">
      <p className="text-[#78786C] animate-pulse font-heading text-lg">지식 그래프 캔버스를 불러오는 중입니다...</p>
    </div>
  )
});

export default GraphViewerClient;
