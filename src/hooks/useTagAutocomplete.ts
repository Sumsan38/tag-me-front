/**
 * useTagAutocomplete.ts
 *
 * Tag 자동완성 React Query 훅.
 *
 * 훅 목록:
 *   - useTagAutocomplete(query) — 태그 자동완성 query (debounce는 컴포넌트 레벨에서 처리)
 *   - useRelatedTags(tagId)     — 연관 태그 query
 */

import { useQuery } from '@tanstack/react-query';
import * as tagApi from '@/api/tag';

// ---------------------------------------------------------------------------
// Query Keys
// ---------------------------------------------------------------------------

export const tagKeys = {
  all: ['tag'] as const,
  autocomplete: (query: string) =>
    [...tagKeys.all, 'autocomplete', query] as const,
  related: (tagId: number) =>
    [...tagKeys.all, 'related', tagId] as const,
};

// ---------------------------------------------------------------------------
// useTagAutocomplete
// ---------------------------------------------------------------------------

/**
 * 태그 자동완성 query.
 *
 * - query가 빈 문자열이면 비활성화 (백엔드가 400을 반환하므로).
 * - staleTime 10분: 서버 캐시 TTL과 동기화.
 * - placeholderData: 이전 데이터 유지 (타이핑 중 UX 부드럽게).
 * - debounce(300ms)는 호출하는 컴포넌트에서 처리한다.
 */
export function useTagAutocomplete(query: string) {
  return useQuery({
    queryKey: tagKeys.autocomplete(query),
    queryFn: () => tagApi.autocomplete(query),
    enabled: query.trim().length > 0,
    staleTime: 10 * 60 * 1000,
    placeholderData: (prev) => prev,
  });
}

// ---------------------------------------------------------------------------
// useRelatedTags
// ---------------------------------------------------------------------------

/**
 * 연관 태그 query.
 * tagId가 truthy일 때만 활성화된다.
 */
export function useRelatedTags(tagId: number | null | undefined) {
  return useQuery({
    queryKey: tagKeys.related(tagId!),
    queryFn: () => tagApi.getRelatedTags(tagId!),
    enabled: !!tagId,
    staleTime: 10 * 60 * 1000,
  });
}
