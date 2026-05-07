/**
 * search.ts
 *
 * Search 도메인 API 클라이언트. 백엔드 95da831(2026-05-05) 1차 완성 스펙에 맞춤.
 *
 * 엔드포인트:
 *   - GET /api/v1/search                — 통합 검색 (cursor 페이지네이션, 비로그인 허용)
 *   - GET /api/v1/search/autocomplete   — 검색바 자동완성 (비로그인 허용)
 *
 * 정책:
 *   - apiClient 응답 인터셉터가 envelope을 언래핑하므로 함수 반환값은 곧 비즈니스 페이로드이다.
 *   - 비로그인 호출도 200을 보장한다. 단 응답 items에서 type === 'DIARY'는 백엔드가 사전 제거한다.
 *   - cursor는 직전 응답의 nextCursor를 그대로 전달한다 (변조 금지, 4096자 초과 → 400).
 *   - tags 배열은 axios 기본 직렬화로 `tags=a&tags=b` 형태로 전송된다 (백엔드 허용 형식).
 */

import apiClient from '@/api/client';
import type {
  AutocompleteSearchItem,
  SearchFilter,
  SearchResponse,
} from '@/types/search';

// ---------------------------------------------------------------------------
// 통합 검색
// ---------------------------------------------------------------------------

/**
 * 통합 검색 호출.
 *
 * 빈 필드는 직렬화에서 제외해 백엔드 400 케이스(blank q, 빈 cursor 등)를 사전 차단한다.
 * tags 빈 배열도 송신하지 않는다 — axios가 빈 배열을 그대로 보내면 일부 백엔드는 400을 반환할 수 있다.
 */
export async function search(filter: SearchFilter): Promise<SearchResponse> {
  const params: Record<string, unknown> = { q: filter.q };
  if (filter.type) params.type = filter.type;
  if (filter.from) params.from = filter.from;
  if (filter.to) params.to = filter.to;
  if (filter.tags && filter.tags.length > 0) params.tags = filter.tags;
  if (filter.authorId !== undefined) params.authorId = filter.authorId;
  if (filter.cursor) params.cursor = filter.cursor;
  if (filter.size !== undefined) params.size = filter.size;

  const response = await apiClient.get<SearchResponse>('/api/v1/search', {
    params,
  });
  return response.data;
}

// ---------------------------------------------------------------------------
// 검색바 자동완성
// ---------------------------------------------------------------------------

/**
 * 검색바 자동완성 조회.
 *
 * - q: 필수. 빈 문자열/공백은 백엔드에서 400을 반환하므로 호출 측에서 사전 차단을 권장한다.
 * - limit: 선택. 기본 10, 최대 50.
 *
 * 응답은 `[{ name }]` 단순 형식으로 TagSuggestion(태그 메타)과 다르다.
 */
export async function searchAutocomplete(
  q: string,
  limit?: number,
): Promise<AutocompleteSearchItem[]> {
  const params: Record<string, unknown> = { q };
  if (limit !== undefined) params.limit = limit;

  const response = await apiClient.get<AutocompleteSearchItem[]>(
    '/api/v1/search/autocomplete',
    { params },
  );
  return response.data;
}
