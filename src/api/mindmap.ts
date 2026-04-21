/**
 * mindmap.ts
 *
 * 마인드맵 도메인 API 클라이언트.
 *
 * 엔드포인트:
 *   - GET /api/v1/mindmap                         — 마인드맵 조회
 *   - GET /api/v1/mindmap/tags/{tagId}/contents   — 태그 드릴다운 콘텐츠
 *   - GET /api/v1/mindmap/edges/contents          — 엣지 드릴다운 콘텐츠
 *
 * period 포맷 (periodType별):
 *   - day   → "yyyy-MM-dd"
 *   - week  → "yyyy-MM-dd" (월요일 기준)
 *   - month → "yyyy-MM"
 *   - year  → "yyyy"
 */

import apiClient from '@/api/client';
import type { NodeResponse, EdgeResponse } from '@/components/mindmap/MindmapVisualization';
import type { TagContentsResponse, EdgeContentsResponse } from '@/components/mindmap/types';

// ---------------------------------------------------------------------------
// 응답 타입
// ---------------------------------------------------------------------------

export interface MindmapResponse {
  nodes: NodeResponse[];
  edges: EdgeResponse[];
}

// ---------------------------------------------------------------------------
// 파라미터 타입
// ---------------------------------------------------------------------------

export interface GetMindmapParams {
  periodType: string;
  period: string;
  source?: string;
}

export interface GetTagContentsParams {
  tagId: number;
  sourceType?: string;
  periodType?: string;
  period?: string;
  cursor?: string;
  size?: number;
}

export interface GetEdgeContentsParams {
  tagIdA: number;
  tagIdB: number;
  sourceType?: string;
  periodType?: string;
  period?: string;
  cursor?: string;
  size?: number;
}

// ---------------------------------------------------------------------------
// API 함수
// ---------------------------------------------------------------------------

/** 마인드맵 노드/엣지 조회. */
export async function getMindmap(params: GetMindmapParams): Promise<MindmapResponse> {
  const response = await apiClient.get<MindmapResponse>('/api/v1/mindmap', {
    params: { source: 'all', ...params },
  });
  return response.data;
}

/** 태그 드릴다운 콘텐츠 조회. Cursor 기반 페이지네이션. */
export async function getTagContents(
  params: GetTagContentsParams,
): Promise<TagContentsResponse> {
  const { tagId, ...rest } = params;
  const response = await apiClient.get<TagContentsResponse>(
    `/api/v1/mindmap/tags/${tagId}/contents`,
    { params: rest },
  );
  return response.data;
}

/** 엣지 드릴다운 콘텐츠 조회. Cursor 기반 페이지네이션. */
export async function getEdgeContents(
  params: GetEdgeContentsParams,
): Promise<EdgeContentsResponse> {
  const response = await apiClient.get<EdgeContentsResponse>(
    '/api/v1/mindmap/edges/contents',
    { params },
  );
  return response.data;
}
