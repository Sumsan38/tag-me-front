'use client';

import { X, Link2 } from 'lucide-react';
import type { EdgeResponse, NodeResponse } from './MindmapVisualization';
import type { ContentResponse, DiaryContentResponse, FeedContentResponse } from './types';
import ContentItemCard from './ContentItemCard';

// ── Mock data: GET /api/v1/mindmap/edges/contents?tagIdA=…&tagIdB=… ──────────
//
// 두 태그가 함께 등장한 콘텐츠 목록 (DIARY/FEED 혼합).
// 실제 API는 tagIdA, tagIdB 조합으로 한 번만 호출.

const MOCK_EDGE_CONTENTS: Record<string, ContentResponse[]> = {
  // key: `${Math.min(a,b)}_${Math.max(a,b)}`
  '1_11': [  // 여행-제주
    {
      type: 'DIARY', id: 101,
      contentSnippet: '제주 올레길을 혼자 걸었다. 바람이 차갑고 고요했는데 이상하게 마음이 정리됐다.',
      tags: ['여행', '제주', '산책'],
      createdAt: '2026-04-15T19:00:00',
      diaryDateTime: '2026-04-15T00:00:00',
    } as DiaryContentResponse,
    {
      type: 'FEED', id: 201,
      contentSnippet: '제주 한 달 살기를 시작했다. 매일 아침 바다 냄새를 맡으며 커피를 마신다.',
      imageUrls: ['https://example.com/jeju1.jpg'],
      tags: ['여행', '제주', '한달살기'],
      createdAt: '2026-04-12T09:00:00',
      likeCount: 63,
    } as FeedContentResponse,
    {
      type: 'DIARY', id: 98,
      contentSnippet: '제주 마지막 날, 성산일출봉에 올랐다. 구름이 많아서 일출은 못 봤지만 그것도 좋았다.',
      tags: ['여행', '제주', '성산'],
      createdAt: '2026-04-08T21:00:00',
      diaryDateTime: '2026-04-08T00:00:00',
    } as DiaryContentResponse,
  ],
  '1_12': [  // 여행-산책
    {
      type: 'DIARY', id: 95,
      contentSnippet: '여행 중 목적 없이 걷는 게 제일 좋다. 지도도 끄고 그냥 발길 닿는 대로.',
      tags: ['여행', '산책', '일상'],
      createdAt: '2026-04-06T20:00:00',
      diaryDateTime: '2026-04-06T00:00:00',
    } as DiaryContentResponse,
    {
      type: 'FEED', id: 189,
      contentSnippet: '경주 고도(古都)를 걸었다. 천 년 전 사람들도 이 길을 걸었겠지 싶었다.',
      imageUrls: ['https://example.com/gyeongju1.jpg', 'https://example.com/gyeongju2.jpg'],
      tags: ['여행', '경주', '산책', '역사'],
      createdAt: '2026-04-05T18:30:00',
      likeCount: 41,
    } as FeedContentResponse,
  ],
  '3_4': [  // 카페-독서
    {
      type: 'DIARY', id: 88,
      contentSnippet: '오늘 카페에서 세 시간. 읽은 것보다 멍한 시간이 더 좋았다. 책은 두 페이지밖에 못 읽었는데 기분은 나쁘지 않다.',
      tags: ['카페', '독서', '여유'],
      createdAt: '2026-04-10T16:00:00',
      diaryDateTime: '2026-04-10T00:00:00',
    } as DiaryContentResponse,
    {
      type: 'DIARY', id: 82,
      contentSnippet: '단골 카페에 새 책 가져갔다. 아메리카노 한 잔에 두 챕터. 이게 내 이상적인 오후다.',
      tags: ['카페', '독서', '아메리카노'],
      createdAt: '2026-04-03T15:30:00',
      diaryDateTime: '2026-04-03T00:00:00',
    } as DiaryContentResponse,
    {
      type: 'FEED', id: 310,
      contentSnippet: '독서하기 좋은 카페 TOP 5를 추려봤어요. 조용하고 오래 앉아도 눈치 안 주는 곳 위주로.',
      imageUrls: ['https://example.com/cafe1.jpg'],
      tags: ['카페', '독서', '추천', '서울'],
      createdAt: '2026-04-01T11:00:00',
      likeCount: 98,
    } as FeedContentResponse,
  ],
  '2_10': [  // 번아웃-감정
    {
      type: 'FEED', id: 155,
      contentSnippet: '번아웃이 왔나봐. 아무것도 하기 싫은데 이 앱 켜는 건 왜 하게 되지.',
      imageUrls: [],
      tags: ['번아웃', '감정', '일상'],
      createdAt: '2026-04-14T23:00:00',
      likeCount: 112,
    } as FeedContentResponse,
    {
      type: 'DIARY', id: 77,
      contentSnippet: '번아웃인지 우울인지 모르겠다. 그냥 아무것도 하고 싶지 않다. 이런 감정도 기록해야겠다는 생각에 여기 썼다.',
      tags: ['번아웃', '감정', '우울', '기록'],
      createdAt: '2026-04-14T22:00:00',
      diaryDateTime: '2026-04-14T00:00:00',
    } as DiaryContentResponse,
  ],
  '5_9': [  // 운동-일상
    {
      type: 'FEED', id: 288,
      contentSnippet: '매일 아침 30분 달리기를 시작한 지 2주가 됐다. 몸은 힘든데 이상하게 하루가 가벼워진다.',
      imageUrls: [],
      tags: ['운동', '일상', '달리기', '루틴'],
      createdAt: '2026-04-16T08:00:00',
      likeCount: 74,
    } as FeedContentResponse,
    {
      type: 'FEED', id: 271,
      contentSnippet: '헬스장 등록하고 처음 간 날. 30분 만에 나왔는데 그게 자랑스러웠다.',
      imageUrls: [],
      tags: ['운동', '일상', '헬스', '시작'],
      createdAt: '2026-04-09T19:00:00',
      likeCount: 45,
    } as FeedContentResponse,
  ],
};

function getEdgeKey(tagIdA: number, tagIdB: number): string {
  return `${Math.min(tagIdA, tagIdB)}_${Math.max(tagIdA, tagIdB)}`;
}

function getDefaultItems(): ContentResponse[] {
  // 키 미등록 엣지용 기본 목데이터
  return [
    {
      type: 'FEED', id: 999,
      contentSnippet: '두 태그가 함께 등장한 콘텐츠입니다. 실제 API 연동 시 여기에 결과가 표시됩니다.',
      imageUrls: [],
      tags: ['샘플'],
      createdAt: '2026-04-20T00:00:00',
      likeCount: 0,
    } as FeedContentResponse,
  ];
}

// ── Props ────────────────────────────────────────────────────────────────────

interface Props {
  edge: EdgeResponse | null;
  nodeMap: Map<number, NodeResponse>;
  onClose: () => void;
}

export default function EdgeDetailPanel({ edge, nodeMap, onClose }: Props) {
  if (!edge) return null;

  const nodeA = nodeMap.get(edge.tagIdA);
  const nodeB = nodeMap.get(edge.tagIdB);
  const nameA = nodeA?.tagName ?? `#${edge.tagIdA}`;
  const nameB = nodeB?.tagName ?? `#${edge.tagIdB}`;

  const key = getEdgeKey(edge.tagIdA, edge.tagIdB);
  const items = MOCK_EDGE_CONTENTS[key] ?? getDefaultItems();

  const diaryCount = items.filter((i) => i.type === 'DIARY').length;
  const feedCount = items.filter((i) => i.type === 'FEED').length;

  return (
    <div className="flex flex-col h-full bg-surface">
      {/* Header */}
      <div className="flex-shrink-0 px-5 py-4 border-b border-border">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            {/* Tag pair */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-base font-bold text-primary">#{nameA}</span>
              <Link2 size={14} className="text-muted flex-shrink-0" />
              <span className="text-base font-bold text-primary">#{nameB}</span>
            </div>
            <p className="text-xs text-sub mt-1">함께 등장한 콘텐츠</p>

            {/* Co-occurrence weight */}
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
      <div className="flex-shrink-0 px-5 py-3 border-b border-border flex items-center gap-4">
        <span className="text-xs text-sub">
          총 <span className="font-semibold text-text">{items.length}</span>개
        </span>
        {diaryCount > 0 && (
          <span className="text-xs" style={{ color: '#2563EB' }}>
            일기 {diaryCount}
          </span>
        )}
        {feedCount > 0 && (
          <span className="text-xs" style={{ color: '#16A34A' }}>
            피드 {feedCount}
          </span>
        )}
      </div>

      {/* Content list — GET /api/v1/mindmap/edges/contents?tagIdA=…&tagIdB=… */}
      <div className="flex-1 overflow-y-auto">
        {items.length === 0 ? (
          <p className="text-sm text-muted text-center py-10">콘텐츠가 없습니다.</p>
        ) : (
          <ul>
            {items.map((item) => (
              <li key={`${item.type}-${item.id}`}>
                {/* showTypeBadge=true: DIARY/FEED 혼합 목록이므로 타입 배지 표시 */}
                <ContentItemCard item={item} showTypeBadge />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
