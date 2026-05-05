/**
 * useSearch.ts
 *
 * Search 도메인 React Query 훅.
 *
 * 훅 목록:
 *   - useSearch(filter)              — 통합 검색 infinite query (cursor 기반)
 *   - useSearchAutocomplete(q, limit) — 검색바 자동완성 query
 *
 * 정책:
 *   - cursor는 백엔드가 발급한 문자열을 그대로 다음 호출에 전달한다(변조 금지).
 *   - 자동완성 디바운스(300ms)는 호출 컴포넌트 책임 — useTagAutocomplete와 동일한 컨벤션을 따른다.
 *   - 빈 q는 백엔드 400을 유발하므로 enabled 가드로 사전 차단한다.
 */

import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import * as searchApi from '@/api/search';
import type { SearchFilter } from '@/types/search';

// ---------------------------------------------------------------------------
// Query Keys
// ---------------------------------------------------------------------------

/**
 * 검색 query key.
 *
 * `results`는 cursor를 key에서 제외해야 동일 필터 조합의 무한 페이지가 한 캐시 엔트리에
 * 누적된다. 자동완성은 q와 limit 조합을 별도 캐시 단위로 둔다.
 */
export const searchKeys = {
  all: ['search'] as const,
  results: (filter: Omit<SearchFilter, 'cursor'>) =>
    [...searchKeys.all, 'results', filter] as const,
  autocomplete: (q: string, limit?: number) =>
    [...searchKeys.all, 'autocomplete', q, limit ?? null] as const,
};

// ---------------------------------------------------------------------------
// useSearch
// ---------------------------------------------------------------------------

/**
 * 통합 검색 infinite query.
 *
 * - q가 비어있으면(공백 포함) 비활성화. 백엔드 400 사전 차단 + 검색 입력 전 무의미한 호출 방지.
 * - getNextPageParam: 마지막 페이지(`hasNext === false`)면 undefined로 종료.
 * - cursor는 응답의 nextCursor 문자열을 그대로 다음 요청에 패스스루한다.
 * - staleTime 30초: 검색은 입력 갱신 빈도가 높지만, 동일 키워드 재진입 시 즉시 표시되도록 짧게.
 */
export function useSearch(filter: SearchFilter) {
  const { cursor: _cursor, ...filterKey } = filter;

  return useInfiniteQuery({
    queryKey: searchKeys.results(filterKey),
    queryFn: ({ pageParam }) =>
      searchApi.search({ ...filter, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? (lastPage.nextCursor ?? undefined) : undefined,
    enabled: filter.q.trim().length > 0,
    staleTime: 30 * 1000,
  });
}

// ---------------------------------------------------------------------------
// useSearchAutocomplete
// ---------------------------------------------------------------------------

/**
 * 검색바 자동완성 query.
 *
 * - q가 비어있으면(공백 포함) 비활성화 — 서버가 400을 반환하므로.
 * - placeholderData: 이전 데이터를 유지해 타이핑 중 드롭다운 깜빡임을 줄인다.
 * - staleTime 60초: 자동완성은 잦은 재호출이 일어나므로 짧은 캐시로 부담을 분산.
 * - debounce(300ms)는 호출 컴포넌트가 적용한다 (useTagAutocomplete와 동일 패턴).
 */
export function useSearchAutocomplete(q: string, limit?: number) {
  return useQuery({
    queryKey: searchKeys.autocomplete(q, limit),
    queryFn: () => searchApi.searchAutocomplete(q, limit),
    enabled: q.trim().length > 0,
    staleTime: 60 * 1000,
    placeholderData: (prev) => prev,
  });
}
