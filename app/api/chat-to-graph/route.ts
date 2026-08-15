import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { getRegionSummary, getRegionTrend, getAllRegions, getProperties } from '@/lib/queries';
import { mapToGraphData } from '@/lib/graph-mapper';

// Next.js 빌드 타임에 환경변수가 없어 에러나는 것을 방지하기 위해 fallback(dummy) 값 추가
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || 'dummy_key_for_build'
});

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "검색어를 입력해주세요." }, { status: 400 });
    }

    // 1. 의도 추출 (Intent Extraction via LLM - JSON 모드)
    const extractCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an AI that extracts real estate search intents. You must output ONLY a valid JSON object. The JSON must contain: 'regionName' (string, extracting the closest Seoul district name like '마포구'. Default: '강남구'), 'buildingType' (string, default '오피스텔'), 'maxMonthlyRent' (number, the maximum monthly rent budget in ten-thousands of won. For example, '60만' -> 60. If no budget is specified, default to 9999), and 'limit' (number, the requested number of properties to find. If the user asks for '모두' or '전부', use 9999. If not specified, default to 3)."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama-3.1-8b-instant", // 최신 Llama 3.1 8B 모델 사용
      response_format: { type: "json_object" },
      temperature: 0.1, // 창의성보다는 정확도 우선
    });

    let intent;
    try {
      const intentStr = extractCompletion.choices[0]?.message?.content || '{}';
      intent = JSON.parse(intentStr);
    } catch {
      intent = { regionName: '강남구', buildingType: '오피스텔', maxMonthlyRent: 9999, limit: 3 }; // 파싱 실패 시 안전한 폴백 처리
    }
    
    const targetRegion = intent.regionName || '강남구'; 
    const targetType = intent.buildingType || '오피스텔';
    const targetMaxRent = intent.maxMonthlyRent || 9999;
    const limit = intent.limit || 3;

    // 2. DB 조회 (기존 로직 100% 재활용)
    const allRegions = await getAllRegions();
    // 사용자가 입력한 지역 이름과 코드가 매칭되는 데이터 찾기
    const regionObj = allRegions.find(r => r.name.includes(targetRegion) || targetRegion.includes(r.name)) || allRegions[0];
    const regionCode = regionObj.code;
    const regionRealName = regionObj.name;

    // Supabase에서 데이터 긁어오기
    const summary = await getRegionSummary(regionCode, targetType);
    const trend = await getRegionTrend(regionCode, targetType, 6);
    const properties = await getProperties(regionCode, targetMaxRent, limit);

    // 3. 그래프 데이터로 변환 (Mapping)
    const graphData = mapToGraphData(prompt, regionRealName, summary, trend, properties);

    // 4. 인간적인 AI 해설 생성 (Commentary Generation)
    const propertiesText = properties.map(p => `- ${p.name} (보증금 ${p.deposit}만 / 월세 ${p.monthlyRent}만)`).join('\n');
    const commentaryCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "당신은 따뜻하고 친절한 톤을 가진 부동산 전문가입니다. 제공된 데이터를 바탕으로 사용자에게 자연스러운 한국어로 브리핑을 작성하세요. 너무 딱딱하지 않게, 편안하고 다정한 말투로 3~4문장 이내로 콤팩트하게 답변하세요."
        },
        {
          role: "user",
          content: `사용자의 최초 질문: "${prompt}"\n---\n[시스템이 찾은 데이터]\n매칭된 지역: ${regionRealName}\n평균 가격: ${summary.currentPrice}\n\n[추천 매물 리스트]\n${propertiesText || '조건에 맞는 매물이 없습니다.'}\n---\n이 데이터를 바탕으로 매물을 구체적으로 언급하며 사용자를 안심시키는 조언을 써주세요.`
        }
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.6,
    });

    const aiMessage = commentaryCompletion.choices[0]?.message?.content || "해당 지역에 대한 분석을 완료했습니다. 그래프의 노드를 클릭해보세요.";

    const propertiesWithTrend = properties.map(p => ({
      ...p,
      trend: trend
    }));

    // 5. 프론트엔드로 최종 통합 전달
    return NextResponse.json({
      graphData,
      aiMessage,
      intent,
      properties: propertiesWithTrend
    });
  } catch (error: unknown) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "분석 중 서버 오류가 발생했습니다." }, { status: 500 });
  }
}
