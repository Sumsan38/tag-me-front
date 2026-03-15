/**
 * common.ts
 *
 * 프로젝트 전반에서 공유되는 공통 타입 정의.
 *
 * - ApiResponse: 백엔드 Envelope 응답 구조
 * - CursorPage: 피드, 검색, 댓글 등 무한 스크롤에 사용하는 Cursor 기반 페이지네이션
 * - OffsetPage: 관리 목적의 Offset 기반 페이지네이션
 * - SearchHighlight: 검색 결과 키워드 하이라이팅 데이터 (search.ts에서도 재사용)
 * - RecommendSortReason: 피드 추천 결과 정렬 근거
 * - SharePeriod: 공유 리포트 식별에 사용되는 기간 식별자
 */

// ---------------------------------------------------------------------------
// API Envelope
// ---------------------------------------------------------------------------

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: ErrorResponse;
  timestamp: string;
}

export interface ErrorResponse {
  code: string;
  message: string;
}

// ---------------------------------------------------------------------------
// 페이지네이션
// ---------------------------------------------------------------------------

/**
 * Cursor 기반 페이지네이션.
 * 피드, 검색 결과, 댓글 목록 등 순서가 중요한 리소스에 사용한다.
 * nextCursor가 null이면 마지막 페이지이다.
 */
export interface CursorPage<T> {
  content: T[];
  nextCursor: string | null;
  hasNext: boolean;
}

/**
 * Offset 기반 페이지네이션.
 * 어드민, 관리용 목록 등 특정 페이지로 직접 이동이 필요한 경우에 사용한다.
 */
export interface OffsetPage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  page: number;
}

// ---------------------------------------------------------------------------
// 검색 하이라이팅
// ---------------------------------------------------------------------------

/**
 * 검색 결과에서 일치 키워드를 강조 표시하기 위한 조각(fragment) 목록.
 * 각 배열 요소는 하이라이팅 마크업이 포함된 HTML 조각이거나 원본 텍스트 조각이다.
 * 렌더링 시 XSS 방지를 위해 sanitize 처리 후 사용한다.
 *
 * 검색 도메인 타입(search.ts)에서도 이 타입을 참조한다.
 */
export interface SearchHighlight {
  title?: string[];   // 하이라이팅된 제목 조각
  content?: string[]; // 하이라이팅된 본문 조각
  tags?: string[];    // 일치한 태그
}

// ---------------------------------------------------------------------------
// 추천 결과 정렬 근거
// ---------------------------------------------------------------------------

/**
 * 피드 추천 결과가 해당 순위에 노출된 이유.
 * 일기 완성 후 "이런 이야기도 있어요" 섹션의 추천 근거 배지 표시에 사용한다.
 *
 *   - 'tag_overlap'      : 작성한 태그와 겹치는 게시글
 *   - 'trending'         : 현재 트렌딩 태그 포함
 *   - 'similar_user'     : 유사 사용자가 작성한 게시글
 *   - 'collaborative'    : 협업 필터링 기반 추천
 */
export type RecommendSortReason =
  | 'tag_overlap'
  | 'trending'
  | 'similar_user'
  | 'collaborative';

// ---------------------------------------------------------------------------
// 공유 리포트 식별자
// ---------------------------------------------------------------------------

/**
 * 월간 리포트 공유에 사용되는 기간 식별자.
 * 형식: 'yyyy-MM' (예: '2026-03')
 * report.ts의 ReportShareInfo와 함께 사용한다.
 */
export type SharePeriod = string;
