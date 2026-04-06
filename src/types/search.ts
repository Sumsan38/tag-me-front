/**
 * search.ts
 *
 * Search 도메인 타입 정의.
 *
 * - SearchResultType: 검색 대상 구분 (일기 / 피드)
 * - SearchResult: 통합 검색 결과 단건 (관련도순 정렬, 하이라이팅 포함)
 * - SearchHighlight: common.ts에서 re-export (검색 도메인에서 명시적으로 사용)
 * - SearchFilter: 검색 필터 조합 (기간, 태그, 작성자)
 * - SearchAutoCompleteResponse: 검색어 자동완성 응답
 *
 * 검색 결과 관련도 가중치: 제목 ×3, 태그 ×2, 본문 ×1
 * 일기(Private)는 본인만, 피드(Public)는 누구나 검색 가능하다.
 */

import type { SearchHighlight } from './common';

// SearchHighlight를 검색 도메인 타입으로도 명시적으로 노출한다.
export type { SearchHighlight };

// ---------------------------------------------------------------------------
// 검색 결과
// ---------------------------------------------------------------------------

/**
 * 검색 대상 구분.
 *   - 'diary' : 개인 일기 (본인만 검색 가능)
 *   - 'feed'  : 공개 피드 게시글
 */
export type SearchResultType = 'diary' | 'feed';

/**
 * 통합 검색 결과 단건.
 * score는 관련도 점수이며 정렬 근거이다 (제목 ×3, 태그 ×2, 본문 ×1 가중치).
 * authorNickname은 피드(feed) 결과에만 포함된다. 일기(diary)는 본인 소유이므로 미포함.
 * highlights는 검색 키워드 하이라이팅 데이터이며, 렌더링 시 XSS 방지 처리가 필요하다.
 */
export interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  content: string;
  tags: string[];
  authorNickname?: string; // 피드(feed)만 포함
  createdAt: string;       // ISO 8601
  score: number;
  highlights: SearchHighlight;
}

// ---------------------------------------------------------------------------
// 검색 필터
// ---------------------------------------------------------------------------

/**
 * 통합 검색 필터.
 * q는 필수이며 최소 1자 이상이어야 한다.
 * fromDate / toDate는 'yyyy-MM-dd' 형식으로 전달한다.
 * tags는 복수 태그 AND 필터이다.
 * author는 작성자 닉네임 필터이며 피드(feed) 결과에만 적용된다.
 */
export interface SearchFilter {
  q: string;
  type?: SearchResultType;
  fromDate?: string; // yyyy-MM-dd
  toDate?: string;   // yyyy-MM-dd
  tags?: string[];
  author?: string;
}

// ---------------------------------------------------------------------------
// 자동완성
// ---------------------------------------------------------------------------

/**
 * 검색어 자동완성 응답.
 * suggestions는 입력어와 매칭된 검색어 후보 목록이다.
 * staleTime은 태그 자동완성과 동일하게 10분으로 설정한다.
 */
export interface SearchAutoCompleteResponse {
  suggestions: string[];
}
