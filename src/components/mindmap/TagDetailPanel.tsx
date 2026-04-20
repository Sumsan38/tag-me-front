'use client';

import { useState } from 'react';
import { X, BookOpen, FileText, Heart, MessageCircle, HeartHandshake, Loader2 } from 'lucide-react';
import type { NodeResponse, PrimarySource } from './MindmapVisualization';
import { SOURCE_STYLES } from './MindmapVisualization';
import ContentItemCard from './ContentItemCard';
import { useTagContents } from '@/hooks/useMindmap';

// ── Tab 정의 ─────────────────────────────────────────────────────────────────

interface TabMeta {
  value: PrimarySource;
  label: string;
  icon: React.ReactNode;
  countKey: keyof NodeResponse;
  sourceTypeParam: string;
}

const TABS: TabMeta[] = [
  { value: 'DIARY',        label: '일기',       icon: <BookOpen size={13} />,       countKey: 'diaryCount',       sourceTypeParam: 'DIARY' },
  { value: 'FEED',         label: '피드',       icon: <FileText size={13} />,       countKey: 'feedCount',        sourceTypeParam: 'FEED' },
  { value: 'LIKE',         label: '좋아요',     icon: <Heart size={13} />,          countKey: 'likeCount',        sourceTypeParam: 'LIKE' },
  { value: 'COMMENT',      label: '댓글',       icon: <MessageCircle size={13} />,  countKey: 'commentCount',     sourceTypeParam: 'COMMENT' },
  { value: 'COMMENT_LIKE', label: '댓글좋아요', icon: <HeartHandshake size={13} />, countKey: 'commentLikeCount', sourceTypeParam: 'COMMENT_LIKE' },
];

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  node: NodeResponse | null;
  onClose: () => void;
  periodType?: string;
  period?: string;
}

export default function TagDetailPanel({ node, onClose, periodType, period }: Props) {
  const [activeTab, setActiveTab] = useState<PrimarySource>('DIARY');

  const visibleTabs = node
    ? TABS.filter((t) => (node[t.countKey] as number) > 0)
    : [];

  const resolvedTab =
    visibleTabs.find((t) => t.value === activeTab)?.value ?? visibleTabs[0]?.value ?? 'DIARY';

  const activeTabMeta = TABS.find((t) => t.value === resolvedTab);

  const contentsParams = node
    ? {
        tagId: node.tagId,
        sourceType: activeTabMeta?.sourceTypeParam,
        periodType,
        period,
        size: 20,
      }
    : null;

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useTagContents(contentsParams);

  const items = data?.pages.flatMap((p) => p.items) ?? [];

  if (!node) return null;

  const style = SOURCE_STYLES[node.primarySource];

  const bars: { source: PrimarySource; count: number; label: string }[] = (
    [
      { source: 'DIARY'        as PrimarySource, count: node.diaryCount,       label: '일기' },
      { source: 'FEED'         as PrimarySource, count: node.feedCount,        label: '피드' },
      { source: 'LIKE'         as PrimarySource, count: node.likeCount,        label: '좋아요' },
      { source: 'COMMENT'      as PrimarySource, count: node.commentCount,     label: '댓글' },
      { source: 'COMMENT_LIKE' as PrimarySource, count: node.commentLikeCount, label: '댓글좋아요' },
    ] as const
  ).filter((b) => b.count > 0);

  return (
    <div className="flex flex-col h-full bg-surface">
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3 flex items-start justify-between gap-2 border-b border-border">
        <div>
          <span className="text-xl font-bold tracking-tight" style={{ color: style.stroke }}>
            #{node.tagName}
          </span>
          <p className="text-xs text-sub mt-0.5">
            총 <span className="font-semibold text-text">{node.totalCount}</span>회 인터랙션
          </p>
        </div>
        <button
          onClick={onClose}
          className="mt-0.5 w-7 h-7 flex items-center justify-center rounded-md text-muted hover:bg-border hover:text-text transition-colors flex-shrink-0"
          aria-label="닫기"
        >
          <X size={16} />
        </button>
      </div>

      {/* Source breakdown */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-border">
        <p className="text-2xs font-semibold uppercase tracking-widest text-muted mb-2">출처 분포</p>
        <div className="space-y-1.5">
          {bars.map((b) => {
            const pct = Math.round((b.count / node.totalCount) * 100);
            const s = SOURCE_STYLES[b.source];
            return (
              <div key={b.source} className="flex items-center gap-2">
                <span className="text-xs text-sub w-14 flex-shrink-0">{b.label}</span>
                <div className="flex-1 h-1.5 rounded-full bg-border overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${pct}%`, backgroundColor: s.stroke }}
                  />
                </div>
                <span className="text-xs font-semibold tabular-nums w-5 text-right" style={{ color: s.stroke }}>
                  {b.count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabs */}
      {visibleTabs.length > 0 && (
        <>
          <div className="flex-shrink-0 flex border-b border-border overflow-x-auto">
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
                    {node[t.countKey] as number}
                  </span>
                </button>
              );
            })}
          </div>

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
                      <ContentItemCard item={item} showTypeBadge={false} />
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
