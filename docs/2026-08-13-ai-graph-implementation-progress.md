# AI Graph UI & LLM 파이프라인 구현 진행 보고서 (2026-08-13)

## 개요
단순 시세 조회 대시보드를 넘어, LLM(Groq API 기반)과 노드-간선(Node-Edge) 그래프 UI를 결합한 **'대화형 부동산 탐색 비서'** 기능의 구현 내역입니다.

## 진행 현황

### ✅ Phase 1: 기반 UI 및 그래프 시각화 엔진 구축 (완료)
- **`react-force-graph-2d` 패키지 설치** 및 CSR 호환(동적 임포트) 설정 완료.
- **`GraphViewerClient.tsx` 구현**: HTML5 Canvas를 직접 튜닝하여, Wabi-Sabi 테마에 맞는 둥근 직사각형(Pill) 형태의 유기적 노드를 렌더링하도록 커스텀 완료.
- **`app/ai-search/page.tsx` 구현**: 좌측 채팅 패널, 중앙 그래프 캔버스, 우측 AI 리포트 패널로 구성된 3단 레이아웃 구축 완료 (소프트 섀도우 및 블러 백그라운드 적용).

### ✅ Phase 2: LLM 의도 추출 및 통신 API 구축 (완료)
- **`groq-sdk` 패키지 설치**: 초고속 오픈소스 호스팅 API(Groq) 연동 환경 구성 완료.
- **`lib/graph-mapper.ts` 구현**: Supabase에서 가져온 정형 데이터(가격, 변동률, 거래량 등)를 시각화 라이브러리가 읽을 수 있는 노드/간선 형태(`nodes`, `links`)로 파싱하는 유틸리티 작성 완료.
- **`app/api/chat-to-graph/route.ts` 구현**: 통합 AI 두뇌 역할의 엔드포인트 구축.
  1. 사용자 입력을 받아 LLM(Llama-3)에게 JSON 형태의 의도 파싱 지시 (지역명, 건물유형 추출).
  2. 추출된 지역명으로 기존 `lib/queries.ts`를 활용하여 Supabase 데이터베이스 조회.
  3. `graph-mapper`를 호출하여 그래프 시각화 데이터 조립.
  4. LLM에게 조회된 데이터 텍스트를 다시 넘겨, '부동산 전문가' 페르소나를 지닌 다정한 어조의 해설(Commentary) 생성 지시 및 최종 반환.

### ✅ Phase 3: E2E 풀스택 연동 (완료)
- **프론트엔드 API 연동**: `app/ai-search/page.tsx`에서 사용자가 채팅을 전송하면 `POST /api/chat-to-graph` 엔드포인트를 `fetch`로 호출하도록 연동.
- **상태 관리 및 UX 개선**: 
  - `isLoading` 상태를 추가하여 캔버스와 채팅창에 자연스러운 로딩 스피너 및 말풍선 애니메이션 구현.
  - 응답 성공 시 반환된 `graphData`와 `aiMessage`를 React State에 동기화하여 화면 재렌더링 처리 완료.
