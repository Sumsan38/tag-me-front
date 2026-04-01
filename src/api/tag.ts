/**
 * tag.ts
 *
 * Tag 도메인 API 클라이언트.
 *
 * 엔드포인트:
 *   - GET /api/v1/tags/autocomplete?q=  — 태그 자동완성
 *   - GET /api/v1/tags/{id}/related      — 연관 태그 조회
 */

import apiClient from '@/api/client';
import type { TagSuggestion, RelatedTagResponse } from '@/types/tag';

// ---------------------------------------------------------------------------
// 태그 자동완성
// ---------------------------------------------------------------------------

/**
 * 태그 자동완성 조회.
 * 빈 문자열이나 공백만 전달하면 백엔드에서 400을 반환한다.
 */
export async function autocomplete(query: string): Promise<TagSuggestion[]> {
  const response = await apiClient.get<TagSuggestion[]>(
    '/api/v1/tags/autocomplete',
    { params: { q: query } },
  );
  return response.data;
}

// ---------------------------------------------------------------------------
// 연관 태그
// ---------------------------------------------------------------------------

/**
 * 연관 태그 조회.
 * 존재하지 않는 태그 ID → 404 (TAG_001).
 */
export async function getRelatedTags(
  tagId: number,
): Promise<RelatedTagResponse[]> {
  const response = await apiClient.get<RelatedTagResponse[]>(
    `/api/v1/tags/${tagId}/related`,
  );
  return response.data;
}
