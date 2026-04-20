'use client';

import { useState, useCallback, useMemo } from 'react';
import { Info } from 'lucide-react';
import { format, startOfWeek, getWeek } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  MindmapVisualization,
  PeriodFilter,
  SourceFilter,
  TagDetailPanel,
  EdgeDetailPanel,
} from '@/components/mindmap';
import type { NodeResponse, EdgeResponse, PeriodType, SourceFilterValue } from '@/components/mindmap';

// ── Mock datasets per period ─────────────────────────────────────────────────
// 실제 API 연동 시 periodType + period 파라미터로 대체

interface MockDataset {
  nodes: NodeResponse[];
  edges: EdgeResponse[];
}

/** 월별 데이터 — 태그 분포가 다름 */
const DATASETS: Record<string, MockDataset> = {
  // 이번 달 (2026-04) — 여행/일상 강세
  '2026-04': {
    nodes: [
      { tagId: 1,  tagName: '여행',   primarySource: 'DIARY',        totalCount: 18, diaryCount: 12, feedCount: 4,  likeCount: 1, commentCount: 1, commentLikeCount: 0 },
      { tagId: 2,  tagName: '번아웃', primarySource: 'FEED',         totalCount: 14, diaryCount: 3,  feedCount: 8,  likeCount: 2, commentCount: 1, commentLikeCount: 0 },
      { tagId: 3,  tagName: '카페',   primarySource: 'DIARY',        totalCount: 11, diaryCount: 7,  feedCount: 2,  likeCount: 1, commentCount: 1, commentLikeCount: 0 },
      { tagId: 4,  tagName: '독서',   primarySource: 'DIARY',        totalCount: 9,  diaryCount: 6,  feedCount: 2,  likeCount: 1, commentCount: 0, commentLikeCount: 0 },
      { tagId: 5,  tagName: '운동',   primarySource: 'FEED',         totalCount: 13, diaryCount: 2,  feedCount: 9,  likeCount: 1, commentCount: 1, commentLikeCount: 0 },
      { tagId: 6,  tagName: '감사',   primarySource: 'DIARY',        totalCount: 7,  diaryCount: 5,  feedCount: 1,  likeCount: 1, commentCount: 0, commentLikeCount: 0 },
      { tagId: 7,  tagName: '음악',   primarySource: 'LIKE',         totalCount: 8,  diaryCount: 1,  feedCount: 2,  likeCount: 4, commentCount: 1, commentLikeCount: 0 },
      { tagId: 8,  tagName: '요리',   primarySource: 'COMMENT',      totalCount: 6,  diaryCount: 1,  feedCount: 1,  likeCount: 1, commentCount: 3, commentLikeCount: 0 },
      { tagId: 9,  tagName: '일상',   primarySource: 'FEED',         totalCount: 20, diaryCount: 4,  feedCount: 12, likeCount: 2, commentCount: 2, commentLikeCount: 0 },
      { tagId: 10, tagName: '감정',   primarySource: 'DIARY',        totalCount: 10, diaryCount: 7,  feedCount: 2,  likeCount: 1, commentCount: 0, commentLikeCount: 0 },
      { tagId: 11, tagName: '제주',   primarySource: 'DIARY',        totalCount: 5,  diaryCount: 4,  feedCount: 1,  likeCount: 0, commentCount: 0, commentLikeCount: 0 },
      { tagId: 12, tagName: '산책',   primarySource: 'FEED',         totalCount: 8,  diaryCount: 2,  feedCount: 5,  likeCount: 1, commentCount: 0, commentLikeCount: 0 },
      { tagId: 13, tagName: '커피',   primarySource: 'COMMENT_LIKE', totalCount: 4,  diaryCount: 0,  feedCount: 1,  likeCount: 1, commentCount: 1, commentLikeCount: 1 },
    ],
    edges: [
      { tagIdA: 1,  tagIdB: 11, totalWeight: 4, sourceWeights: [{ sourceType: 'DIARY', weight: 4 }] },
      { tagIdA: 1,  tagIdB: 12, totalWeight: 3, sourceWeights: [{ sourceType: 'DIARY', weight: 2 }, { sourceType: 'FEED', weight: 1 }] },
      { tagIdA: 3,  tagIdB: 4,  totalWeight: 5, sourceWeights: [{ sourceType: 'DIARY', weight: 5 }] },
      { tagIdA: 3,  tagIdB: 7,  totalWeight: 3, sourceWeights: [{ sourceType: 'LIKE', weight: 3 }] },
      { tagIdA: 3,  tagIdB: 13, totalWeight: 2, sourceWeights: [{ sourceType: 'COMMENT_LIKE', weight: 2 }] },
      { tagIdA: 2,  tagIdB: 10, totalWeight: 4, sourceWeights: [{ sourceType: 'FEED', weight: 3 }, { sourceType: 'DIARY', weight: 1 }] },
      { tagIdA: 5,  tagIdB: 9,  totalWeight: 6, sourceWeights: [{ sourceType: 'FEED', weight: 6 }] },
      { tagIdA: 9,  tagIdB: 2,  totalWeight: 3, sourceWeights: [{ sourceType: 'FEED', weight: 3 }] },
      { tagIdA: 6,  tagIdB: 10, totalWeight: 3, sourceWeights: [{ sourceType: 'DIARY', weight: 3 }] },
      { tagIdA: 8,  tagIdB: 9,  totalWeight: 2, sourceWeights: [{ sourceType: 'COMMENT', weight: 2 }] },
      { tagIdA: 4,  tagIdB: 10, totalWeight: 2, sourceWeights: [{ sourceType: 'DIARY', weight: 2 }] },
      { tagIdA: 7,  tagIdB: 9,  totalWeight: 3, sourceWeights: [{ sourceType: 'LIKE', weight: 2 }, { sourceType: 'FEED', weight: 1 }] },
      { tagIdA: 12, tagIdB: 5,  totalWeight: 2, sourceWeights: [{ sourceType: 'FEED', weight: 2 }] },
      { tagIdA: 12, tagIdB: 1,  totalWeight: 2, sourceWeights: [{ sourceType: 'DIARY', weight: 2 }] },
    ],
  },

  // 전달 (2026-03) — 독서/감정 강세, 여행 없음
  '2026-03': {
    nodes: [
      { tagId: 4,  tagName: '독서',   primarySource: 'DIARY',        totalCount: 15, diaryCount: 11, feedCount: 3,  likeCount: 1, commentCount: 0, commentLikeCount: 0 },
      { tagId: 10, tagName: '감정',   primarySource: 'DIARY',        totalCount: 14, diaryCount: 10, feedCount: 2,  likeCount: 2, commentCount: 0, commentLikeCount: 0 },
      { tagId: 3,  tagName: '카페',   primarySource: 'DIARY',        totalCount: 12, diaryCount: 8,  feedCount: 3,  likeCount: 1, commentCount: 0, commentLikeCount: 0 },
      { tagId: 6,  tagName: '감사',   primarySource: 'DIARY',        totalCount: 11, diaryCount: 9,  feedCount: 2,  likeCount: 0, commentCount: 0, commentLikeCount: 0 },
      { tagId: 9,  tagName: '일상',   primarySource: 'FEED',         totalCount: 16, diaryCount: 3,  feedCount: 10, likeCount: 2, commentCount: 1, commentLikeCount: 0 },
      { tagId: 2,  tagName: '번아웃', primarySource: 'FEED',         totalCount: 9,  diaryCount: 2,  feedCount: 5,  likeCount: 1, commentCount: 1, commentLikeCount: 0 },
      { tagId: 8,  tagName: '요리',   primarySource: 'COMMENT',      totalCount: 7,  diaryCount: 1,  feedCount: 2,  likeCount: 1, commentCount: 3, commentLikeCount: 0 },
      { tagId: 14, tagName: '봄',     primarySource: 'DIARY',        totalCount: 8,  diaryCount: 6,  feedCount: 1,  likeCount: 1, commentCount: 0, commentLikeCount: 0 },
      { tagId: 15, tagName: '글쓰기', primarySource: 'DIARY',        totalCount: 6,  diaryCount: 5,  feedCount: 1,  likeCount: 0, commentCount: 0, commentLikeCount: 0 },
    ],
    edges: [
      { tagIdA: 4,  tagIdB: 10, totalWeight: 6, sourceWeights: [{ sourceType: 'DIARY', weight: 6 }] },
      { tagIdA: 4,  tagIdB: 3,  totalWeight: 4, sourceWeights: [{ sourceType: 'DIARY', weight: 4 }] },
      { tagIdA: 6,  tagIdB: 10, totalWeight: 5, sourceWeights: [{ sourceType: 'DIARY', weight: 5 }] },
      { tagIdA: 6,  tagIdB: 14, totalWeight: 3, sourceWeights: [{ sourceType: 'DIARY', weight: 3 }] },
      { tagIdA: 9,  tagIdB: 2,  totalWeight: 4, sourceWeights: [{ sourceType: 'FEED', weight: 4 }] },
      { tagIdA: 8,  tagIdB: 9,  totalWeight: 3, sourceWeights: [{ sourceType: 'COMMENT', weight: 3 }] },
      { tagIdA: 14, tagIdB: 3,  totalWeight: 2, sourceWeights: [{ sourceType: 'DIARY', weight: 2 }] },
      { tagIdA: 15, tagIdB: 4,  totalWeight: 3, sourceWeights: [{ sourceType: 'DIARY', weight: 3 }] },
    ],
  },

  // 2026년 전체 — 노드 많고 카운트 큼
  '2026': {
    nodes: [
      { tagId: 9,  tagName: '일상',   primarySource: 'FEED',         totalCount: 87, diaryCount: 18, feedCount: 52, likeCount: 10, commentCount: 7, commentLikeCount: 0 },
      { tagId: 1,  tagName: '여행',   primarySource: 'DIARY',        totalCount: 65, diaryCount: 42, feedCount: 15, likeCount: 5,  commentCount: 3, commentLikeCount: 0 },
      { tagId: 10, tagName: '감정',   primarySource: 'DIARY',        totalCount: 58, diaryCount: 40, feedCount: 10, likeCount: 5,  commentCount: 3, commentLikeCount: 0 },
      { tagId: 3,  tagName: '카페',   primarySource: 'DIARY',        totalCount: 52, diaryCount: 32, feedCount: 12, likeCount: 5,  commentCount: 3, commentLikeCount: 0 },
      { tagId: 5,  tagName: '운동',   primarySource: 'FEED',         totalCount: 48, diaryCount: 8,  feedCount: 30, likeCount: 6,  commentCount: 4, commentLikeCount: 0 },
      { tagId: 4,  tagName: '독서',   primarySource: 'DIARY',        totalCount: 44, diaryCount: 30, feedCount: 9,  likeCount: 4,  commentCount: 1, commentLikeCount: 0 },
      { tagId: 2,  tagName: '번아웃', primarySource: 'FEED',         totalCount: 39, diaryCount: 10, feedCount: 22, likeCount: 5,  commentCount: 2, commentLikeCount: 0 },
      { tagId: 6,  tagName: '감사',   primarySource: 'DIARY',        totalCount: 33, diaryCount: 24, feedCount: 5,  likeCount: 3,  commentCount: 1, commentLikeCount: 0 },
      { tagId: 7,  tagName: '음악',   primarySource: 'LIKE',         totalCount: 30, diaryCount: 4,  feedCount: 8,  likeCount: 15, commentCount: 3, commentLikeCount: 0 },
      { tagId: 12, tagName: '산책',   primarySource: 'FEED',         totalCount: 28, diaryCount: 7,  feedCount: 17, likeCount: 3,  commentCount: 1, commentLikeCount: 0 },
      { tagId: 8,  tagName: '요리',   primarySource: 'COMMENT',      totalCount: 22, diaryCount: 4,  feedCount: 6,  likeCount: 4,  commentCount: 8, commentLikeCount: 0 },
      { tagId: 11, tagName: '제주',   primarySource: 'DIARY',        totalCount: 18, diaryCount: 13, feedCount: 4,  likeCount: 1,  commentCount: 0, commentLikeCount: 0 },
      { tagId: 14, tagName: '봄',     primarySource: 'DIARY',        totalCount: 15, diaryCount: 11, feedCount: 3,  likeCount: 1,  commentCount: 0, commentLikeCount: 0 },
      { tagId: 13, tagName: '커피',   primarySource: 'COMMENT_LIKE', totalCount: 12, diaryCount: 1,  feedCount: 3,  likeCount: 4,  commentCount: 2, commentLikeCount: 2 },
      { tagId: 15, tagName: '글쓰기', primarySource: 'DIARY',        totalCount: 10, diaryCount: 8,  feedCount: 2,  likeCount: 0,  commentCount: 0, commentLikeCount: 0 },
    ],
    edges: [
      { tagIdA: 1,  tagIdB: 11, totalWeight: 12, sourceWeights: [{ sourceType: 'DIARY', weight: 12 }] },
      { tagIdA: 1,  tagIdB: 12, totalWeight: 9,  sourceWeights: [{ sourceType: 'DIARY', weight: 6 }, { sourceType: 'FEED', weight: 3 }] },
      { tagIdA: 3,  tagIdB: 4,  totalWeight: 14, sourceWeights: [{ sourceType: 'DIARY', weight: 14 }] },
      { tagIdA: 3,  tagIdB: 7,  totalWeight: 8,  sourceWeights: [{ sourceType: 'LIKE', weight: 8 }] },
      { tagIdA: 3,  tagIdB: 13, totalWeight: 5,  sourceWeights: [{ sourceType: 'COMMENT_LIKE', weight: 5 }] },
      { tagIdA: 2,  tagIdB: 10, totalWeight: 11, sourceWeights: [{ sourceType: 'FEED', weight: 8 }, { sourceType: 'DIARY', weight: 3 }] },
      { tagIdA: 5,  tagIdB: 9,  totalWeight: 18, sourceWeights: [{ sourceType: 'FEED', weight: 18 }] },
      { tagIdA: 9,  tagIdB: 2,  totalWeight: 10, sourceWeights: [{ sourceType: 'FEED', weight: 10 }] },
      { tagIdA: 6,  tagIdB: 10, totalWeight: 9,  sourceWeights: [{ sourceType: 'DIARY', weight: 9 }] },
      { tagIdA: 8,  tagIdB: 9,  totalWeight: 6,  sourceWeights: [{ sourceType: 'COMMENT', weight: 6 }] },
      { tagIdA: 4,  tagIdB: 10, totalWeight: 8,  sourceWeights: [{ sourceType: 'DIARY', weight: 8 }] },
      { tagIdA: 7,  tagIdB: 9,  totalWeight: 7,  sourceWeights: [{ sourceType: 'LIKE', weight: 5 }, { sourceType: 'FEED', weight: 2 }] },
      { tagIdA: 12, tagIdB: 5,  totalWeight: 6,  sourceWeights: [{ sourceType: 'FEED', weight: 6 }] },
      { tagIdA: 12, tagIdB: 1,  totalWeight: 7,  sourceWeights: [{ sourceType: 'DIARY', weight: 7 }] },
      { tagIdA: 14, tagIdB: 3,  totalWeight: 5,  sourceWeights: [{ sourceType: 'DIARY', weight: 5 }] },
      { tagIdA: 15, tagIdB: 4,  totalWeight: 6,  sourceWeights: [{ sourceType: 'DIARY', weight: 6 }] },
      { tagIdA: 6,  tagIdB: 14, totalWeight: 4,  sourceWeights: [{ sourceType: 'DIARY', weight: 4 }] },
    ],
  },
};

/** 이번 주 (주간) — 태그 적고 count 낮음 */
const WEEK_DATASET: MockDataset = {
  nodes: [
    { tagId: 9,  tagName: '일상',   primarySource: 'FEED',  totalCount: 5, diaryCount: 1, feedCount: 3, likeCount: 1, commentCount: 0, commentLikeCount: 0 },
    { tagId: 3,  tagName: '카페',   primarySource: 'DIARY', totalCount: 4, diaryCount: 3, feedCount: 1, likeCount: 0, commentCount: 0, commentLikeCount: 0 },
    { tagId: 5,  tagName: '운동',   primarySource: 'FEED',  totalCount: 3, diaryCount: 0, feedCount: 2, likeCount: 1, commentCount: 0, commentLikeCount: 0 },
    { tagId: 10, tagName: '감정',   primarySource: 'DIARY', totalCount: 3, diaryCount: 2, feedCount: 1, likeCount: 0, commentCount: 0, commentLikeCount: 0 },
    { tagId: 4,  tagName: '독서',   primarySource: 'DIARY', totalCount: 2, diaryCount: 2, feedCount: 0, likeCount: 0, commentCount: 0, commentLikeCount: 0 },
  ],
  edges: [
    { tagIdA: 3,  tagIdB: 4, totalWeight: 2, sourceWeights: [{ sourceType: 'DIARY', weight: 2 }] },
    { tagIdA: 9,  tagIdB: 5, totalWeight: 2, sourceWeights: [{ sourceType: 'FEED', weight: 2 }] },
    { tagIdA: 10, tagIdB: 3, totalWeight: 1, sourceWeights: [{ sourceType: 'DIARY', weight: 1 }] },
  ],
};

/** period 키 계산 */
function getPeriodKey(periodType: PeriodType, baseDate: Date): string {
  if (periodType === 'year') return format(baseDate, 'yyyy');
  if (periodType === 'month') return format(baseDate, 'yyyy-MM');
  // week — 해당 주의 월요일 기준 키
  const monday = startOfWeek(baseDate, { weekStartsOn: 1 });
  return `week-${format(monday, 'yyyy-MM-dd')}`;
}

function getDataset(periodType: PeriodType, baseDate: Date): MockDataset {
  if (periodType === 'week') return WEEK_DATASET;
  const key = getPeriodKey(periodType, baseDate);
  return DATASETS[key] ?? DATASETS['2026-04'];
}

// ── Legend ──────────────────────────────────────────────────────────────────

const LEGEND = [
  { color: '#2563EB', label: '일기 작성',   dash: false },
  { color: '#16A34A', label: '게시글 작성', dash: false },
  { color: '#BE185D', label: '좋아요',      dash: true },
  { color: '#B45309', label: '댓글',        dash: true },
  { color: '#7C3AED', label: '댓글좋아요',  dash: true },
] as const;

// ── Panel state ──────────────────────────────────────────────────────────────

type PanelState =
  | { kind: 'none' }
  | { kind: 'node'; node: NodeResponse }
  | { kind: 'edge'; edge: EdgeResponse };

// ── Page ─────────────────────────────────────────────────────────────────────

export default function MindmapPage() {
  const [periodType, setPeriodType] = useState<PeriodType>('month');
  const [baseDate, setBaseDate] = useState(new Date());
  const [sourceFilter, setSourceFilter] = useState<SourceFilterValue>('all');
  const [panel, setPanel] = useState<PanelState>({ kind: 'none' });
  const [showLegend, setShowLegend] = useState(false);

  // 기간이 바뀔 때만 dataset 교체
  const dataset = useMemo(
    () => getDataset(periodType, baseDate),
    [periodType, baseDate],
  );

  // sourceFilter가 바뀔 때만 필터링 — 패널 상태 변경은 D3 재시작 안 함
  const filteredNodes = useMemo(
    () =>
      sourceFilter === 'all'
        ? dataset.nodes
        : dataset.nodes.filter((n) => n.primarySource === sourceFilter),
    [dataset, sourceFilter],
  );

  const filteredEdges = useMemo(() => {
    const ids = new Set(filteredNodes.map((n) => n.tagId));
    return dataset.edges.filter((e) => ids.has(e.tagIdA) && ids.has(e.tagIdB));
  }, [dataset, filteredNodes]);

  const nodeMap = useMemo(
    () => new Map(dataset.nodes.map((n) => [n.tagId, n])),
    [dataset],
  );

  const handleNodeClick = useCallback((node: NodeResponse) => {
    setPanel((prev) =>
      prev.kind === 'node' && prev.node.tagId === node.tagId
        ? { kind: 'none' }
        : { kind: 'node', node },
    );
  }, []);

  const handleEdgeClick = useCallback((edge: EdgeResponse) => {
    setPanel((prev) =>
      prev.kind === 'edge' &&
      prev.edge.tagIdA === edge.tagIdA &&
      prev.edge.tagIdB === edge.tagIdB
        ? { kind: 'none' }
        : { kind: 'edge', edge },
    );
  }, []);

  const handleClose = useCallback(() => setPanel({ kind: 'none' }), []);

  const panelOpen = panel.kind !== 'none';
  const selectedNodeId = panel.kind === 'node' ? panel.node.tagId : null;

  return (
    <div className="flex flex-col" style={{ height: 'calc(100dvh - 56px)' }}>
      {/* Toolbar */}
      <div className="flex-shrink-0 bg-surface border-b border-border px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-4 flex-wrap">
          <PeriodFilter
            periodType={periodType}
            baseDate={baseDate}
            onPeriodTypeChange={(t) => { setPeriodType(t); setPanel({ kind: 'none' }); }}
            onBaseDateChange={(d) => { setBaseDate(d); setPanel({ kind: 'none' }); }}
          />
          <SourceFilter value={sourceFilter} onChange={setSourceFilter} />
        </div>

        {/* Legend toggle */}
        <div className="relative">
          <button
            onClick={() => setShowLegend((v) => !v)}
            className="w-7 h-7 flex items-center justify-center rounded-md text-muted hover:bg-border hover:text-text transition-colors"
            aria-label="범례"
          >
            <Info size={15} />
          </button>
          {showLegend && (
            <div className="absolute right-0 top-9 z-20 bg-surface border border-border rounded-xl shadow-modal p-4 w-52">
              <p className="text-2xs font-semibold uppercase tracking-widest text-muted mb-3">범례</p>
              <div className="space-y-2.5">
                {LEGEND.map((l) => (
                  <div key={l.label} className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-1.5 rounded-full flex-shrink-0"
                      style={{
                        background: l.dash
                          ? `repeating-linear-gradient(90deg,${l.color} 0,${l.color} 5px,transparent 5px,transparent 9px)`
                          : l.color,
                      }}
                    />
                    <span className="text-xs text-sub">{l.label}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-border space-y-1">
                <p className="text-2xs text-muted">노드 크기 = 인터랙션 횟수</p>
                <p className="text-2xs text-muted">노드 색 = 주요 출처</p>
                <p className="text-2xs text-muted">엣지 클릭 = 함께 등장한 콘텐츠</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main: visualization + side panel */}
      <div className="flex-1 flex overflow-hidden">
        {/* Canvas */}
        <div
          className="flex-1 min-w-0"
          style={{ background: 'radial-gradient(ellipse 80% 70% at 50% 50%, #F4F2EE 0%, #EFEDE8 100%)' }}
          onClick={() => setPanel({ kind: 'none' })}
        >
          {filteredNodes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
              <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center shadow-card">
                <span className="text-3xl">🌱</span>
              </div>
              <p className="text-sm font-semibold text-text">태그가 없어요</p>
              <p className="text-xs text-sub max-w-[200px]">
                일기를 쓰거나 피드에서 좋아요를 눌러보세요!
              </p>
            </div>
          ) : (
            <MindmapVisualization
              nodes={filteredNodes}
              edges={filteredEdges}
              onNodeClick={handleNodeClick}
              onEdgeClick={handleEdgeClick}
              selectedNodeId={selectedNodeId}
            />
          )}
        </div>

        {/* Side panel */}
        <div
          className={[
            'flex-shrink-0 transition-all duration-300 overflow-hidden',
            panelOpen ? 'w-72' : 'w-0',
          ].join(' ')}
        >
          <div className="w-72 h-full">
            {panel.kind === 'node' && (
              <TagDetailPanel node={panel.node} onClose={handleClose} />
            )}
            {panel.kind === 'edge' && (
              <EdgeDetailPanel edge={panel.edge} nodeMap={nodeMap} onClose={handleClose} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
