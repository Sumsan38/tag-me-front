'use client';

import { useState } from 'react';
import { X, BookOpen, FileText, Heart, MessageCircle, HeartHandshake } from 'lucide-react';
import type { NodeResponse, PrimarySource } from './MindmapVisualization';
import { SOURCE_STYLES } from './MindmapVisualization';
import type { ContentResponse, DiaryContentResponse, FeedContentResponse } from './types';
import ContentItemCard from './ContentItemCard';

// ── Mock data: GET /api/v1/mindmap/tags/{tagId}/contents?sourceType=… ────────
//
// sourceType=diary   → DiaryContentResponse[]
// sourceType=feed    → FeedContentResponse[]
// sourceType=like    → FeedContentResponse[] (좋아요한 피드, 해당 태그 포함)
// sourceType=comment → FeedContentResponse[] (댓글 단 피드, 해당 태그 포함)
// sourceType=comment_like → FeedContentResponse[]

const MOCK_DIARY_ITEMS: DiaryContentResponse[] = [
  {
    type: 'DIARY', id: 101,
    contentSnippet: '제주 올레길을 혼자 걸었다. 바람이 차갑고 고요했는데 이상하게 마음이 정리됐다. 다음엔 더 오래 걷고 싶다.',
    tags: ['여행', '제주', '산책', '혼자'],
    createdAt: '2026-04-15T19:00:00',
    diaryDateTime: '2026-04-15T00:00:00',
  },
  {
    type: 'DIARY', id: 98,
    contentSnippet: '공항에서 집까지 오는 길이 이상하게 길게 느껴졌다. 여행이 끝났다는 게 실감났다.',
    tags: ['여행', '일상', '귀국'],
    createdAt: '2026-04-08T21:00:00',
    diaryDateTime: '2026-04-08T00:00:00',
  },
  {
    type: 'DIARY', id: 91,
    contentSnippet: '다음 달 휴가를 어디로 갈지 고민 중. 교토가 끌리는데 혼자 가는 게 맞는지 모르겠다.',
    tags: ['여행', '계획', '교토'],
    createdAt: '2026-03-22T22:00:00',
    diaryDateTime: '2026-03-22T00:00:00',
  },
];

const MOCK_FEED_ITEMS: FeedContentResponse[] = [
  {
    type: 'FEED', id: 201,
    contentSnippet: '교토 골목 산책 중에 찍은 사진들. 1200년 된 골목을 걸으면 시간이 다르게 흐르는 것 같다.',
    imageUrls: ['https://example.com/kyoto1.jpg', 'https://example.com/kyoto2.jpg'],
    tags: ['여행', '교토', '산책', '사진'],
    createdAt: '2026-04-12T20:00:00',
    likeCount: 47,
  },
  {
    type: 'FEED', id: 189,
    contentSnippet: '혼자 여행하는 게 처음엔 외로울 것 같았는데, 오히려 자유롭다. 아무도 나를 기다리지 않는다.',
    imageUrls: [],
    tags: ['여행', '혼자', '자유'],
    createdAt: '2026-04-05T18:30:00',
    likeCount: 31,
  },
];

const MOCK_LIKE_ITEMS: FeedContentResponse[] = [
  {
    type: 'FEED', id: 312,
    contentSnippet: '남해 바다를 품에 안고 싶었던 날. 파란 하늘과 초록 바다가 선물처럼 펼쳐졌다.',
    imageUrls: ['https://example.com/namhae1.jpg'],
    tags: ['여행', '남해', '바다'],
    createdAt: '2026-04-18T17:00:00',
    likeCount: 83,
  },
];

const MOCK_COMMENT_ITEMS: FeedContentResponse[] = [
  {
    type: 'FEED', id: 278,
    contentSnippet: '강릉 커피거리를 처음 가봤는데 진짜 좋았다. 파도 소리 들으면서 커피 마시는 게 이렇게 좋을 줄이야.',
    imageUrls: ['https://example.com/gangneung1.jpg', 'https://example.com/gangneung2.jpg'],
    tags: ['여행', '강릉', '카페', '커피'],
    createdAt: '2026-04-10T15:00:00',
    likeCount: 56,
  },
];

const MOCK_COMMENT_LIKE_ITEMS: FeedContentResponse[] = [
  {
    type: 'FEED', id: 245,
    contentSnippet: '해외여행 혼자 처음 가는 분들을 위한 준비 체크리스트 공유해요. 여권부터 환전까지 정리했습니다.',
    imageUrls: [],
    tags: ['여행', '팁', '준비', '해외'],
    createdAt: '2026-04-03T12:00:00',
    likeCount: 124,
  },
];

const MOCK_BY_SOURCE: Record<string, ContentResponse[]> = {
  DIARY:        MOCK_DIARY_ITEMS,
  FEED:         MOCK_FEED_ITEMS,
  LIKE:         MOCK_LIKE_ITEMS,
  COMMENT:      MOCK_COMMENT_ITEMS,
  COMMENT_LIKE: MOCK_COMMENT_LIKE_ITEMS,
};

// ── Tab 정의 ─────────────────────────────────────────────────────────────────

interface TabMeta {
  value: PrimarySource;
  label: string;
  icon: React.ReactNode;
  countKey: keyof NodeResponse;
  sourceTypeParam: string;  // API 파라미터값
}

const TABS: TabMeta[] = [
  { value: 'DIARY',        label: '일기',       icon: <BookOpen size={13} />,       countKey: 'diaryCount',       sourceTypeParam: 'diary' },
  { value: 'FEED',         label: '피드',       icon: <FileText size={13} />,       countKey: 'feedCount',        sourceTypeParam: 'feed' },
  { value: 'LIKE',         label: '좋아요',     icon: <Heart size={13} />,          countKey: 'likeCount',        sourceTypeParam: 'like' },
  { value: 'COMMENT',      label: '댓글',       icon: <MessageCircle size={13} />,  countKey: 'commentCount',     sourceTypeParam: 'comment' },
  { value: 'COMMENT_LIKE', label: '댓글좋아요', icon: <HeartHandshake size={13} />, countKey: 'commentLikeCount', sourceTypeParam: 'comment_like' },
];

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  node: NodeResponse | null;
  onClose: () => void;
}

export default function TagDetailPanel({ node, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<PrimarySource>('DIARY');

  if (!node) return null;

  const style = SOURCE_STYLES[node.primarySource];

  const visibleTabs = TABS.filter((t) => (node[t.countKey] as number) > 0);
  const resolvedTab =
    visibleTabs.find((t) => t.value === activeTab)?.value ?? visibleTabs[0]?.value ?? 'DIARY';

  const items = MOCK_BY_SOURCE[resolvedTab] ?? [];

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

          {/* Content list — GET /api/v1/mindmap/tags/{tagId}/contents?sourceType={resolvedTab} */}
          <div className="flex-1 overflow-y-auto">
            {items.length === 0 ? (
              <p className="text-sm text-muted text-center py-10">콘텐츠가 없습니다.</p>
            ) : (
              <ul>
                {items.map((item) => (
                  <li key={`${item.type}-${item.id}`}>
                    <ContentItemCard item={item} showTypeBadge={false} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
