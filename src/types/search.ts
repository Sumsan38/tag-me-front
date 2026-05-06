/**
 * search.ts
 *
 * Search 도메인 타입 정의. 백엔드 95da831(2026-05-05)의 Search 도메인 1차 완성에 동기화.
 *
 * - SearchType: 검색 대상 구분 (DIARY | FEED | ALL) — 백엔드 enum (대문자)
 * - SearchResultType: 결과 단건의 type 필드 (DIARY | FEED) — ALL은 결과에 등장하지 않음
 * - SearchResult: 통합 검색 결과 단건 (응답 items[] 스키마)
 * - SearchResponse: /api/v1/search 응답 페이지 페이로드
 * - SearchFilter: 검색 요청 파라미터 묶음 (UI 필터 + cursor/size)
 * - AutocompleteSearchItem: /api/v1/search/autocomplete 응답 단건 ({ name })
 *
 * 정책:
 *   - 일기(DIARY)는 본인만 검색 가능. 비로그인 호출 시 백엔드는 200을 반환하되 items에서 DIARY를 제외한다.
 *   - 정렬은 관련도순(제목 ×3, 태그 ×2, 본문 ×1) — 클라이언트는 응답 순서를 그대로 보존한다.
 *   - highlights 배열 요소는 `<em>...</em>` 마크업이 포함된 HTML 조각이므로 렌더 시 sanitize 처리 필수(XSS 방지).
 *
 * /api/v1/tags/autocomplete(TagSuggestion)와 /api/v1/search/autocomplete(AutocompleteSearchItem)는
 * 응답 스키마가 다르므로 타입을 분리해 컴포넌트/훅에서 혼용되지 않도록 한다.
 */

// ---------------------------------------------------------------------------
// 검색 대상
// ---------------------------------------------------------------------------

/**
 * 요청 파라미터 `type`의 허용 값. 백엔드 enum과 동일한 대문자 표기를 사용한다.
 *   - 'ALL'  : 일기 + 피드 (기본값)
 *   - 'DIARY': 본인 일기만 (비로그인 호출 시 결과 비어있음)
 *   - 'FEED' : 공개 피드만
 *
 * 잘못된 값은 백엔드에서 400을 반환한다. 탭 UI 라벨(소문자/한글)은 별도로 매핑한다.
 */
export type SearchType = 'ALL' | 'DIARY' | 'FEED';

/**
 * 결과 단건의 type 필드.
 * 응답 items[]에는 ALL이 등장하지 않으므로 DIARY | FEED만 가진다.
 */
export type SearchResultType = 'DIARY' | 'FEED';

// ---------------------------------------------------------------------------
// 결과 단건
// ---------------------------------------------------------------------------

/**
 * 통합 검색 결과 단건. 백엔드 SearchResponse.items[] 스키마와 1:1 매칭.
 *
 * - title: FEED는 항상 null (Feed 엔터티에 title이 없음). DIARY는 string.
 * - contentSnippet: 본문 발췌. 하이라이팅 없는 평문이며 카드 미리보기에 사용한다.
 * - highlights: `<em>` 태그 포함 HTML 조각 배열. 렌더 시 sanitize 필요.
 * - createdAt: ISO-8601 Instant 문자열.
 */
export interface SearchResult {
  type: SearchResultType;
  id: number;
  title: string | null;
  contentSnippet: string;
  tags: string[];
  highlights: string[];
  createdAt: string;
  /** DIARY 전용 일기 날짜 (yyyy-MM-dd). FEED는 null. */
  diaryDate: string | null;
}

// ---------------------------------------------------------------------------
// 응답 페이지
// ---------------------------------------------------------------------------

/**
 * /api/v1/search 응답 페이로드 (envelope 언래핑 후의 data 필드).
 *
 * common.ts의 CursorPage<T>는 content/nextCursor/hasNext 형태이지만,
 * 백엔드 검색 API는 content가 아닌 items 키를 사용하므로 별도 타입으로 정의한다.
 *
 * - nextCursor: 마지막 페이지면 null. 다음 호출에 그대로 패스스루한다(변조 금지, 4096자 제한).
 * - hasNext: 다음 페이지 존재 여부. infinite query의 getNextPageParam 분기에 사용.
 */
export interface SearchResponse {
  items: SearchResult[];
  nextCursor: string | null;
  hasNext: boolean;
}

// ---------------------------------------------------------------------------
// 요청 파라미터
// ---------------------------------------------------------------------------

/**
 * /api/v1/search 요청 파라미터.
 *
 * - q: 필수. 공백/빈 문자열 → 400.
 * - type: 기본 'ALL'. 'DIARY' | 'FEED' | 'ALL' 외 값 → 400.
 * - from / to: ISO-8601 Instant (예: '2026-01-01T00:00:00Z'). 형식 오류 → 400.
 * - tags: 복수 태그. 빈/공백 element는 서버가 제거하므로 클라이언트 정리 불필요.
 * - cursor: 직전 응답의 nextCursor 그대로 전달. 4096자 초과 → 400.
 * - size: 1~100. 기본 20. 범위 외 → 400.
 */
export interface SearchFilter {
  q: string;
  type?: SearchType;
  from?: string;
  to?: string;
  tags?: string[];
  cursor?: string;
  size?: number;
}

// ---------------------------------------------------------------------------
// 검색바 자동완성
// ---------------------------------------------------------------------------

/**
 * /api/v1/search/autocomplete 응답 단건.
 *
 * /api/v1/tags/autocomplete의 TagSuggestion({ tagId, displayName, canonical })과 다르며
 * 검색 화면의 검색바 전용 단순 형식이다. 컴포넌트/훅에서 혼용하지 않는다.
 */
export interface AutocompleteSearchItem {
  name: string;
}
