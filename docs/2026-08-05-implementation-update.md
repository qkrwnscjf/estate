# Wabi Estate 통합 아키텍처 구현 업데이트 보고서

**작성일**: 2026년 8월 5일

본 문서는 새로운 아키텍처 명세(`frontend_backend_combined_prompt.md`)를 바탕으로 진행된 전체 구현 변경 사항을 기록합니다.

## 🌟 전체 아키텍처 변화 요약 (Before vs After)

이번 업데이트를 통해 시스템은 **"임시 모형(Mock) 기반의 파편화된 구조"에서 "안전하고 자동화된 풀스택(Full-Stack) 서비스 구조"로 완벽하게 탈바꿈**했습니다.

1. **데이터 수집의 자동 최적화 (백엔드)**
   - **Before**: 파이프라인(Airflow)이 무조건 과거 3개월 데이터를 수집하여 트래픽 낭비와 데이터 누락(이빨 빠짐)의 위험이 컸습니다.
   - **After**: 수집기(`collect.ts`)가 Supabase의 마지막 성공 로그를 분석해 **동적으로 수집 기간(Lookback)을 계산**합니다. 아무리 오래 컴퓨터를 꺼두어도 완벽하게 이빨을 맞춰 데이터를 복구하는 자가 치유(Self-Healing) 능력을 갖추었습니다.
2. **데이터 처리의 중앙 집중화 (프론트엔드)**
   - **Before**: 컴포넌트마다 임시 데이터와 API 호출 로직이 섞여 있어 유지보수가 매우 어려웠습니다.
   - **After**: `lib/queries.ts`라는 **단일 데이터 진입점(Single Source of Truth)**을 구축했습니다. 서버 렌더링(빌드 시)이든 브라우저 API 호출이든 모두 이 하나의 파일을 거쳐 정제된 데이터(`lib/types.ts`)만 받아가도록 결합도를 대폭 낮췄습니다.
3. **사용자 경험(UX) 극대화 (CSR 비교 뷰)**
   - **Before**: 여러 지역의 시세를 동시에 비교하거나 필터링할 수 있는 상호작용 화면이 없었습니다.
   - **After**: `/compare` 경로와 `/api/compare` API를 신설하여, 클라이언트에서 URL 파라미터만 바꾸면 즉각적으로 데이터를 가져와(CSR) 차트와 표를 다시 그리는 부드러운 SPA(Single Page Application) 경험을 추가했습니다.

---

## 🛠 상세 구현 업데이트 내역

### 1. 프론트엔드 데이터 타입 캡슐화 (`lib/types.ts`)
- 백엔드(Supabase) 스키마의 변경으로부터 UI 컴포넌트를 보호하기 위해 공통 인터페이스(`Region`, `TrendPoint`, `RegionSummary`, `CompareResult`)를 신규 작성하여 타입 안정성을 확보했습니다.

### 2. 데이터 단일 진입점 구축 (`lib/queries.ts`)
- 서버 컴포넌트와 브라우저(Client API Route 호출)가 동일하게 재사용할 수 있는 핵심 함수 5개를 구현했습니다:
  1. `getAllRegions()`: 전체 지역 및 티어 조회
  2. `getRegionTrend()`: 선택된 건물 유형의 특정 기간 시계열 조회
  3. `getRegionSummary()`: 최신월/이전월 비교, MoM 변동률 자체 계산
  4. `getCompareData()`: 다중 지역 코드를 받아 반복 조회
  5. `getLastUpdatedMonth()`: DB 기준 최신 업데이트 월 반환
- 네트워크 에러 시 UI가 깨지지 않는 강력한 Fallback 메커니즘을 적용했습니다.

### 3. 환경 변수 표준화 (`.env.example`)
- `NEXT_PUBLIC_` 접두어를 추가하여 `NEXT_PUBLIC_SUPABASE_URL` 및 `NEXT_PUBLIC_SUPABASE_ANON_KEY`를 클라이언트 측에서도 유연하게 활용할 수 있도록 정비했습니다.
- 보안을 위해 `SUPABASE_SERVICE_ROLE_KEY`는 `pipeline/.env.example`로 격리했습니다.

### 4. 프론트엔드 API 라우트(BFF) 신설
- `/api/regions`: 검색창 자동완성 전용 엔드포인트 (Vercel Edge 캐싱 설정)
- `/api/regions/[code]/trend`: 탭 전환 시 동적 시계열 데이터를 제공
- `/api/compare`: 비교 페이지 다중 지역 데이터 응답 (최대 4개 제한 로직 적용)
- `/api/revalidate`: Airflow 연동용 웹훅 고도화 (호출 시 14개 지정 지역 페이지 캐시 정밀 무효화)

### 5. 비교(Compare) 뷰 및 CSR 연동 완성
- `/app/compare/page.tsx`를 구축하여 `?codes=11110,11140` 형태의 URL 쿼리 파라미터를 실시간으로 파싱하고 `/api/compare`를 호출(Fetch)하도록 구현했습니다.
- 데이터 로딩 상태(loading)와 에러(error)에 따른 예외 처리 UI를 완벽히 구축했습니다.

## ✅ 완료 요약
이로써 `frontend_backend_combined_prompt.md`에서 요구한 모든 아키텍처(동적 데이터 파이프라인, SSR/CSR 렌더링 전략, 풀스택 연동) 작업이 **100% 통합 완료**되었습니다.
