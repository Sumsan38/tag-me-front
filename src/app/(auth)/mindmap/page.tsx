'use client';

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Info, Loader2 } from 'lucide-react';
import { format, startOfWeek, parse } from 'date-fns';
import {
  MindmapVisualization,
  PeriodFilter,
  SourceFilter,
  TagDetailPanel,
  EdgeDetailPanel,
} from '@/components/mindmap';
import type {
  NodeResponse, EdgeResponse,
  PeriodType, SourceFilterValue, CustomRange,
} from '@/components/mindmap';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMindmap } from '@/hooks/useMindmap';
import type { GetMindmapParams } from '@/api/mindmap';
import { ROUTES } from '@/constants/routes';

// ── period 파싱 (URL → state) ─────────────────────────────────────────────────

function parsePeriodFromUrl(
  periodTypeStr: string | null,
  periodStr: string | null,
): { periodType: PeriodType; baseDate: Date } | null {
  if (!periodTypeStr) return null;
  const periodType = periodTypeStr as PeriodType;
  if (periodType === 'custom') {
    return { periodType: 'custom', baseDate: new Date() };
  }
  if (!periodStr) return null;
  try {
    let baseDate: Date;
    if (periodType === 'year') {
      baseDate = new Date(Number(periodStr), 0, 1);
    } else if (periodType === 'month') {
      const [y, m] = periodStr.split('-').map(Number);
      baseDate = new Date(y, m - 1, 1);
    } else {
      // day, week → yyyy-MM-dd
      baseDate = parse(periodStr, 'yyyy-MM-dd', new Date());
    }
    return { periodType, baseDate };
  } catch {
    return null;
  }
}

// ── period 변환 ───────────────────────────────────────────────────────────────

function buildPeriodParams(
  periodType: PeriodType,
  baseDate: Date,
  customRange?: CustomRange,
): GetMindmapParams | null {
  if (periodType === 'day') {
    return { periodType: 'day', period: format(baseDate, 'yyyy-MM-dd') };
  }
  if (periodType === 'week') {
    const monday = startOfWeek(baseDate, { weekStartsOn: 1 });
    return { periodType: 'week', period: format(monday, 'yyyy-MM-dd') };
  }
  if (periodType === 'month') {
    return { periodType: 'month', period: format(baseDate, 'yyyy-MM') };
  }
  if (periodType === 'year') {
    return { periodType: 'year', period: format(baseDate, 'yyyy') };
  }
  // custom: from/to 미선택 시 API 호출 비활성
  if (!customRange?.from || !customRange?.to) return null;
  return {
    periodType: 'custom',
    fromDate: format(customRange.from, 'yyyy-MM-dd'),
    toDate: format(customRange.to, 'yyyy-MM-dd'),
  };
}

// ── Legend ───────────────────────────────────────────────────────────────────

const LEGEND = [
  { color: '#2563EB', label: '일기 작성',  dash: false },
  { color: '#16A34A', label: '피드 작성',  dash: false },
  { color: '#BE185D', label: '좋아요',     dash: true },
  { color: '#B45309', label: '댓글',       dash: true },
  { color: '#7C3AED', label: '댓글좋아요', dash: true },
] as const;

// ── Panel state ───────────────────────────────────────────────────────────────

type PanelState =
  | { kind: 'none' }
  | { kind: 'node'; node: NodeResponse }
  | { kind: 'edge'; edge: EdgeResponse };

// ── Page ──────────────────────────────────────────────────────────────────────

export default function MindmapPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 뒤로가기 복원: URL 파라미터를 마운트 시 한 번만 읽어 초기 상태를 결정한다
  const restoredPeriod = parsePeriodFromUrl(
    searchParams.get('periodType'),
    searchParams.get('period'),
  );

  const [periodType, setPeriodType] = useState<PeriodType>(
    restoredPeriod?.periodType ?? 'month',
  );
  const [baseDate, setBaseDate] = useState(restoredPeriod?.baseDate ?? new Date());
  const [customRange, setCustomRange] = useState<CustomRange | undefined>(() => {
    if (searchParams.get('periodType') !== 'custom') return undefined;
    const fromStr = searchParams.get('fromDate');
    const toStr = searchParams.get('toDate');
    if (!fromStr || !toStr) return undefined;
    try {
      return {
        from: parse(fromStr, 'yyyy-MM-dd', new Date()),
        to: parse(toStr, 'yyyy-MM-dd', new Date()),
      };
    } catch {
      return undefined;
    }
  });
  const [sourceFilter, setSourceFilter] = useState<SourceFilterValue>('all');
  const [panel, setPanel] = useState<PanelState>({ kind: 'none' });
  const [showLegend, setShowLegend] = useState(false);

  const restoreNodeId = useRef(Number(searchParams.get('nodeId')) || null);
  const restoreEdgeA  = useRef(Number(searchParams.get('edgeTagIdA')) || null);
  const restoreEdgeB  = useRef(Number(searchParams.get('edgeTagIdB')) || null);
  const restored      = useRef(false);

  const periodParams = useMemo(
    () => buildPeriodParams(periodType, baseDate, customRange),
    [periodType, baseDate, customRange],
  );

  const apiParams = useMemo(
    () =>
      periodParams
        ? { ...periodParams, source: sourceFilter.toLowerCase() }
        : null,
    [periodParams, sourceFilter],
  );

  const { data, isLoading, isError } = useMindmap(apiParams);

  // 데이터가 도착하면 뒤로가기 패널 상태를 한 번만 복원하고 URL을 정리한다
  useEffect(() => {
    if (restored.current || !data) return;
    if (!restoreNodeId.current && !restoreEdgeA.current) return;

    if (restoreNodeId.current) {
      const node = data.nodes.find((n) => n.tagId === restoreNodeId.current);
      if (node) {
        setPanel({ kind: 'node', node });
        restored.current = true;
        router.replace(ROUTES.MINDMAP, { scroll: false });
      }
    } else if (restoreEdgeA.current && restoreEdgeB.current) {
      const a = restoreEdgeA.current;
      const b = restoreEdgeB.current;
      const edge = data.edges.find(
        (e) =>
          (e.tagIdA === a && e.tagIdB === b) ||
          (e.tagIdA === b && e.tagIdB === a),
      );
      if (edge) {
        setPanel({ kind: 'edge', edge });
        restored.current = true;
        router.replace(ROUTES.MINDMAP, { scroll: false });
      }
    }
  }, [data, router]);

  const nodes = data?.nodes ?? [];
  const edges = data?.edges ?? [];

  const nodeMap = useMemo(
    () => new Map(nodes.map((n) => [n.tagId, n])),
    [nodes],
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

  const resetPanel = useCallback(() => setPanel({ kind: 'none' }), []);

  const panelOpen = panel.kind !== 'none';
  const selectedNodeId = panel.kind === 'node' ? panel.node.tagId : null;

  return (
    <div className="flex flex-col" style={{ height: 'calc(100dvh - 56px)' }}>
      {/* Toolbar */}
      <div className="flex-shrink-0 bg-surface border-b border-border px-4 pt-2.5 pb-2 flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2 min-w-0">
          <div className="min-w-0 overflow-hidden">
            <PeriodFilter
              periodType={periodType}
              baseDate={baseDate}
              onPeriodTypeChange={(t) => { setPeriodType(t); resetPanel(); }}
              onBaseDateChange={(d) => { setBaseDate(d); resetPanel(); }}
              customRange={customRange}
              onCustomRangeChange={(r) => { setCustomRange(r); resetPanel(); }}
            />
          </div>
          <div className="relative flex-shrink-0">
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
        <SourceFilter value={sourceFilter} onChange={setSourceFilter} />
      </div>

      {/* Main: visualization + panel */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
        {/* Canvas */}
        <div
          className="flex-1 min-w-0 min-h-0"
          style={{ background: 'radial-gradient(ellipse 80% 70% at 50% 50%, #F4F2EE 0%, #EFEDE8 100%)' }}
          onClick={() => setPanel({ kind: 'none' })}
        >
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <Loader2 size={28} className="animate-spin text-muted" />
              <p className="text-sm text-sub">마인드맵 불러오는 중…</p>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
              <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center shadow-card">
                <span className="text-3xl">⚠️</span>
              </div>
              <p className="text-sm font-semibold text-text">데이터를 불러올 수 없어요</p>
              <p className="text-xs text-sub max-w-[200px]">잠시 후 다시 시도해 주세요.</p>
            </div>
          ) : nodes.length === 0 ? (
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
              key={`${periodType}-${baseDate.getTime()}-${customRange?.from?.getTime() ?? ''}-${customRange?.to?.getTime() ?? ''}-${sourceFilter}`}
              nodes={nodes}
              edges={edges}
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
            'border-t border-border md:border-t-0 md:border-l',
            panelOpen
              ? 'h-[380px] md:h-auto md:w-72'
              : 'h-0 md:h-auto md:w-0',
          ].join(' ')}
        >
          <div className="w-full md:w-72 h-full">
            {panel.kind === 'node' && (
              <TagDetailPanel
                node={panel.node}
                onClose={handleClose}
                periodType={periodParams?.periodType}
                period={periodParams?.period}
                fromDate={periodParams?.fromDate}
                toDate={periodParams?.toDate}
              />
            )}
            {panel.kind === 'edge' && (
              <EdgeDetailPanel
                edge={panel.edge}
                nodeMap={nodeMap}
                onClose={handleClose}
                periodType={periodParams?.periodType}
                period={periodParams?.period}
                fromDate={periodParams?.fromDate}
                toDate={periodParams?.toDate}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
