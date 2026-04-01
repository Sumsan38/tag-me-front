/**
 * tag.ts
 *
 * Tag 도메인 타입 정의.
 *
 * - TagValue: 태그 입력/표시 분리 (canonical vs display)
 * - TagAutoCompleteResponse / TagSuggestion: 태그 자동완성 응답
 * - TrendingTag: 트렌딩 태그 (ISR 1시간 갱신)
 * - RelatedTag: 마인드맵/태그 상세에서 함께 쓰이는 연관 태그
 * - DailyPrompt: 오늘의 태그 프롬프트 (기록 시작 장벽 제거용 리텐션 기능)
 */

// ---------------------------------------------------------------------------
// 태그 값 (입력/표시 분리)
// ---------------------------------------------------------------------------

/**
 * 태그 입력/표시 분리를 위한 타입.
 *
 * - `canonical`: 검색, 집계, 중복 체크에 사용하는 소문자 정규화 값.
 *                '#' prefix 없이 저장된다. 예: "burn out", "여행"
 * - `display`:   UI에 표시하는 값. '#' prefix가 포함된다. 예: "#burn out", "#여행"
 */
export interface TagValue {
  canonical: string;
  display: string;
}

// ---------------------------------------------------------------------------
// 태그 자동완성
// ---------------------------------------------------------------------------

/**
 * 자동완성 제안 태그.
 * 백엔드 GET /api/v1/tags/autocomplete?q= 응답과 동기화.
 * staleTime은 서버 캐시 TTL(10분)과 동기화한다.
 */
export interface TagSuggestion {
  tagId: number;
  displayName: string;
  canonical: string;
}

// ---------------------------------------------------------------------------
// 트렌딩 태그
// ---------------------------------------------------------------------------

/**
 * 트렌딩 태그.
 * ISR 1시간 단위로 갱신되며, React Query staleTime도 1시간으로 설정한다.
 * rank는 1부터 시작하는 순위이다.
 */
export interface TrendingTag {
  id: string;
  name: string;
  todayCount: number;
  rank: number;
}

// ---------------------------------------------------------------------------
// 연관 태그
// ---------------------------------------------------------------------------

/**
 * 연관 태그.
 * 마인드맵 노드 클릭 시 상세 패널, 태그 검색 결과 화면 등에서 사용한다.
 * coOccurrenceCount는 해당 태그와 함께 등장한 횟수이다.
 */
export interface RelatedTag {
  id: string;
  name: string;
  coOccurrenceCount: number;
}

/**
 * 연관 태그 API 응답.
 * 백엔드 GET /api/v1/tags/{id}/related 응답과 동기화.
 */
export interface RelatedTagResponse {
  tagId: number;
  displayName: string;
  canonical: string;
  coOccurrenceCount: number;
}

// ---------------------------------------------------------------------------
// 오늘의 태그 프롬프트
// ---------------------------------------------------------------------------

/**
 * 오늘의 태그 프롬프트.
 * 매일 태그 1개를 제안하여 기록 시작 장벽을 낮추는 리텐션 기능이다.
 * date는 'yyyy-MM-dd' 형식이다.
 */
export interface DailyPrompt {
  tag: string;
  message: string;
  date: string; // yyyy-MM-dd
}
