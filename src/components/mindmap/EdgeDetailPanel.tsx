'use client';

import { useState } from 'react';
import { X, Link2, BookOpen, FileText, Heart, MessageCircle, HeartHandshake, Loader2 } from 'lucide-react';
import type { EdgeResponse, NodeResponse, PrimarySource } from './MindmapVisualization';
import { SOURCE_STYLES } from './MindmapVisualization';
import ContentItemCard from './ContentItemCard';
import { useEdgeContents } from '@/hooks/useMindmap';
import { useDragScroll } from '@/hooks/useDragScroll';

// ── Tab 정의 ──────────────────────────────────────────────────────────────────

interface TabMeta {
  value: PrimarySource;
  label: string;
  icon: React.ReactNode;
  sourceTypeParam: string;
}

const TAB_DEFS: TabMeta[] = [
  { value: 'DIARY',        label: '일기',       icon: <BookOpen size={13} />,        sourceTypeParam: 'DIARY' },
  { value: 'FEED',         label: '피드',       icon: <FileText size={13} />,        sourceTypeParam: 'FEED' },
  { value: 'LIKE',         label: '좋아요',     icon: <Heart size={13} />,           sourceTypeParam: 'LIKE' },
  { value: 'COMMENT',      label: '댓글',       icon: <MessageCircle size={13} />,   sourceTypeParam: 'COMMENT' },
  { value: 'COMMENT_LIKE', label: '댓글좋아요', icon: <HeartHandshake size={13} />,  sourceTypeParam: 'COMMENT_LIKE' },
];

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  edge: EdgeResponse | null;
  nodeMap: Map<number, NodeResponse>;
  onClose: () => void;
  periodType?: string;
  period?: string;
}

export default function EdgeDetailPanel({ edge, nodeMap, onClose, periodType, period }: Props) {
  const [activeTab, setActiveTab] = useState<PrimarySource | null>(null);
  const dragScroll = useDragScroll();
  const dragScrollV = useDragScroll('vertical');

  // weight > 0인 탭만 노출, 가중치 내림차순 정렬
  const visibleTabs: (TabMeta & { weight: number })[] = edge
    ? TAB_DEFS.flatMap((def) => {
        const sw = edge.sourceWeights.find((s) => s.sourceType === def.value);
        return sw && sw.weight > 0 ? [{ ...def, weight: sw.weight }] : [];
      }).sort((a, b) => b.weight - a.weight)
    : [];

  // 기본 선택: weight가 가장 높은 소스 타입
  const defaultTab = visibleTabs[0]?.value ?? null;
  const resolvedTab = visibleTabs.find((t) => t.value === activeTab)?.value ?? defaultTab;
  const activeTabMeta = TAB_DEFS.find((t) => t.value === resolvedTab);

  const contentsParams = edge
    ? {
        tagIdA: edge.tagIdA,
        tagIdB: edge.tagIdB,
        sourceType: activeTabMeta?.sourceTypeParam,
        periodType,
        period,
        size: 20,
      }
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
            <span className="text-xs text-muted mt-1 block">
              연결 강도 <span className="font-semibold text-text">{edge.totalWeight}</span>
            </span>
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

      {/* Source breakdown */}
      {visibleTabs.length > 0 && (
        <div className="flex-shrink-0 px-5 py-3 border-b border-border">
          <p className="text-2xs font-semibold uppercase tracking-widest text-muted mb-2">출처 분포</p>
          <div className="space-y-1.5">
            {visibleTabs.map((t) => {
              const pct = Math.round((t.weight / edge.totalWeight) * 100);
              const s = SOURCE_STYLES[t.value];
              return (
                <div key={t.value} className="flex items-center gap-2">
                  <span className="text-xs text-sub w-14 flex-shrink-0">{t.label}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-border overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, backgroundColor: s.stroke }}
                    />
                  </div>
                  <span className="text-xs font-semibold tabular-nums w-5 text-right" style={{ color: s.stroke }}>
                    {t.weight}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tabs */}
      {visibleTabs.length > 0 && (
        <>
          <div
            ref={dragScroll.ref}
            onMouseDown={dragScroll.onMouseDown}
            onMouseMove={dragScroll.onMouseMove}
            onMouseUp={dragScroll.onMouseUp}
            onMouseLeave={dragScroll.onMouseLeave}
            className="flex-shrink-0 flex border-b border-border overflow-x-auto select-none"
          >
            {visibleTabs.map((t) => {
              const isActive = resolvedTab === t.value;
              const s = SOURCE_STYLES[t.value];
              return (
                <button
                  key={t.value}
                  onClick={() => setActiveTab(t.value)}
                  className={[
                    'flex items-center gap-1.5 px-4 py-2 text-xs font-medium whitespace-nowrap border-b-2 transition-colors',
                    isActive ? 'border-current' : 'border-transparent text-sub hover:text-text',
                  ].join(' ')}
                  style={isActive ? { color: s.stroke } : {}}
                >
                  {t.icon}
                  {t.label}
                  <span
                    className="text-2xs tabular-nums"
                    style={isActive ? { color: s.stroke } : { color: '#A8A8A4' }}
                  >
                    {t.weight}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Content list */}
          <div
            ref={dragScrollV.ref}
            onMouseDown={dragScrollV.onMouseDown}
            onMouseMove={dragScrollV.onMouseMove}
            onMouseUp={dragScrollV.onMouseUp}
            onMouseLeave={dragScrollV.onMouseLeave}
            className="flex-1 overflow-y-auto select-none"
          >
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
        </>
      )}
    </div>
  );
}
