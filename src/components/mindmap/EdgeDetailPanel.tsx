'use client';

import { X, Link2, Loader2 } from 'lucide-react';
import type { EdgeResponse, NodeResponse } from './MindmapVisualization';
import ContentItemCard from './ContentItemCard';
import { useEdgeContents } from '@/hooks/useMindmap';

interface Props {
  edge: EdgeResponse | null;
  nodeMap: Map<number, NodeResponse>;
  onClose: () => void;
  periodType?: string;
  period?: string;
}

export default function EdgeDetailPanel({ edge, nodeMap, onClose, periodType, period }: Props) {
  const contentsParams = edge
    ? { tagIdA: edge.tagIdA, tagIdB: edge.tagIdB, periodType, period, size: 20 }
    : null;

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useEdgeContents(contentsParams);

  const rawItems = data?.pages.flatMap((p) => p.items) ?? [];
  const items = Array.from(
    new Map(rawItems.map((item) => [`${item.type}-${item.id}`, item])).values(),
  );

  if (!edge) return null;

  const nodeA = nodeMap.get(edge.tagIdA);
  const nodeB = nodeMap.get(edge.tagIdB);
  const nameA = nodeA?.tagName ?? `#${edge.tagIdA}`;
  const nameB = nodeB?.tagName ?? `#${edge.tagIdB}`;

  const diaryCount = items.filter((i) => i.type === 'DIARY').length;
  const feedCount = items.filter((i) => i.type === 'FEED').length;

  return (
    <div className="flex flex-col h-full bg-surface">
      {/* Header */}
      <div className="flex-shrink-0 px-5 py-4 border-b border-border">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-base font-bold text-primary">#{nameA}</span>
              <Link2 size={14} className="text-muted flex-shrink-0" />
              <span className="text-base font-bold text-primary">#{nameB}</span>
            </div>
            <p className="text-xs text-sub mt-1">함께 등장한 콘텐츠</p>

            <div className="flex items-center gap-3 mt-2">
              <span className="text-xs text-muted">
                연결 강도 <span className="font-semibold text-text">{edge.totalWeight}</span>
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {edge.sourceWeights.map((sw) => {
                  const colors: Record<string, string> = {
                    DIARY: '#2563EB', FEED: '#16A34A', LIKE: '#BE185D',
                    COMMENT: '#B45309', COMMENT_LIKE: '#7C3AED',
                  };
                  const labels: Record<string, string> = {
                    DIARY: '일기', FEED: '피드', LIKE: '좋아요',
                    COMMENT: '댓글', COMMENT_LIKE: '댓글좋아요',
                  };
                  return (
                    <span
                      key={sw.sourceType}
                      className="text-2xs font-medium px-1.5 py-0.5 rounded"
                      style={{ color: colors[sw.sourceType], backgroundColor: colors[sw.sourceType] + '18' }}
                    >
                      {labels[sw.sourceType]} {sw.weight}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="mt-0.5 w-7 h-7 flex items-center justify-center rounded-md text-muted hover:bg-border hover:text-text transition-colors flex-shrink-0"
            aria-label="닫기"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Summary */}
      {!isLoading && !isError && items.length > 0 && (
        <div className="flex-shrink-0 px-5 py-3 border-b border-border flex items-center gap-4">
          <span className="text-xs text-sub">
            총 <span className="font-semibold text-text">{items.length}</span>개
          </span>
          {diaryCount > 0 && (
            <span className="text-xs" style={{ color: '#2563EB' }}>일기 {diaryCount}</span>
          )}
          {feedCount > 0 && (
            <span className="text-xs" style={{ color: '#16A34A' }}>피드 {feedCount}</span>
          )}
        </div>
      )}

      {/* Content list */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 size={20} className="animate-spin text-muted" />
          </div>
        ) : isError ? (
          <p className="text-sm text-muted text-center py-10">불러오는 중 오류가 발생했습니다.</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted text-center py-10">콘텐츠가 없습니다.</p>
        ) : (
          <>
            <ul>
              {items.map((item) => (
                <li key={`${item.type}-${item.id}`}>
                  <ContentItemCard
                    item={item}
                    showTypeBadge
                    edgeTagIdA={edge.tagIdA}
                    edgeTagIdB={edge.tagIdB}
                    periodType={periodType}
                    period={period}
                  />
                </li>
              ))}
            </ul>
            {hasNextPage && (
              <div className="flex justify-center py-3">
                <button
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="text-xs text-sub hover:text-text transition-colors px-4 py-2 rounded-md hover:bg-border disabled:opacity-50"
                >
                  {isFetchingNextPage ? '불러오는 중...' : '더 보기'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
