/**
 * useMindmap.ts
 *
 * 마인드맵 도메인 React Query 훅.
 *
 * 훅 목록:
 *   - useMindmap()          — 마인드맵 노드/엣지 query
 *   - useTagContents()      — 태그 드릴다운 콘텐츠 infinite query
 *   - useEdgeContents()     — 엣지 드릴다운 콘텐츠 infinite query
 */

import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import * as mindmapApi from '@/api/mindmap';
import type {
  GetMindmapParams,
  GetTagContentsParams,
  GetEdgeContentsParams,
} from '@/api/mindmap';

// ---------------------------------------------------------------------------
// Query Keys
// ---------------------------------------------------------------------------

export const mindmapKeys = {
  all: ['mindmap'] as const,
  graph: (params: GetMindmapParams) =>
    [...mindmapKeys.all, 'graph', params] as const,
  tagContents: (params: Omit<GetTagContentsParams, 'cursor'>) =>
    [...mindmapKeys.all, 'tagContents', params] as const,
  edgeContents: (params: Omit<GetEdgeContentsParams, 'cursor'>) =>
    [...mindmapKeys.all, 'edgeContents', params] as const,
};

// ---------------------------------------------------------------------------
// useMindmap
// ---------------------------------------------------------------------------

/** 마인드맵 노드/엣지 query. params가 null이면 비활성. */
export function useMindmap(params: GetMindmapParams | null) {
  return useQuery({
    queryKey: params ? mindmapKeys.graph(params) : [...mindmapKeys.all, 'disabled'],
    queryFn: () => mindmapApi.getMindmap(params!),
    enabled: !!params,
    staleTime: 5 * 60 * 1000,
  });
}

// ---------------------------------------------------------------------------
// useTagContents
// ---------------------------------------------------------------------------

/** 태그 드릴다운 콘텐츠. Cursor 기반 무한 스크롤. */
export function useTagContents(
  params: Omit<GetTagContentsParams, 'cursor'> | null,
) {
  return useInfiniteQuery({
    queryKey: params
      ? mindmapKeys.tagContents(params)
      : [...mindmapKeys.all, 'tagContents', 'disabled'],
    queryFn: ({ pageParam }) =>
      mindmapApi.getTagContents({ ...params!, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: !!params,
    staleTime: 3 * 60 * 1000,
  });
}

// ---------------------------------------------------------------------------
// useEdgeContents
// ---------------------------------------------------------------------------

/** 엣지 드릴다운 콘텐츠. Cursor 기반 무한 스크롤. */
export function useEdgeContents(
  params: Omit<GetEdgeContentsParams, 'cursor'> | null,
) {
  return useInfiniteQuery({
    queryKey: params
      ? mindmapKeys.edgeContents(params)
      : [...mindmapKeys.all, 'edgeContents', 'disabled'],
    queryFn: ({ pageParam }) =>
      mindmapApi.getEdgeContents({ ...params!, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: !!params,
    staleTime: 3 * 60 * 1000,
  });
}
