/**
 * mindmap.ts
 *
 * Mindmap 도메인 타입 정의.
 *
 * - TagSource: 태그 수집 출처 (직접 작성 vs 인터랙션)
 * - MindmapNode: D3.js 노드. 노드 색상은 primarySource로 결정한다.
 * - MindmapEdge: D3.js 엣지. 엣지 스타일은 sourceType으로 결정한다.
 * - MindmapData: 마인드맵 전체 데이터 (nodes + edges + 기간 정보)
 *
 * 직접 작성 태그(diary/post)는 진한 색, 인터랙션 태그(like/comment)는 연한 색 + 아이콘으로 구분한다.
 * 일기를 쓰지 않아도 좋아요/댓글만으로 마인드맵이 형성되어야 한다 (진입 부담 최소화).
 */

// ---------------------------------------------------------------------------
// 태그 수집 출처
// ---------------------------------------------------------------------------

/**
 * 태그가 수집된 출처.
 *   - 'diary'   : 직접 작성한 일기의 태그 (진한 색)
 *   - 'post'    : 직접 작성한 피드 게시글의 태그 (진한 색)
 *   - 'like'    : 좋아요한 게시글에서 수집된 태그 (연한 색 + 좋아요 아이콘)
 *   - 'comment' : 댓글 단 게시글에서 수집된 태그 (연한 색 + 댓글 아이콘)
 */
export type TagSource = 'diary' | 'post' | 'like' | 'comment';

// ---------------------------------------------------------------------------
// 노드
// ---------------------------------------------------------------------------

/**
 * 마인드맵 노드.
 * D3.js force simulation의 노드 데이터로 사용한다.
 * primarySource는 가장 많이 수집된 출처이며 노드 색상 결정에 사용한다.
 * sourceCounts는 출처별 집계로, 툴팁이나 노드 상세 패널에 표시한다.
 */
export interface MindmapNode {
  tagId: string;
  tagName: string;
  totalCount: number;
  primarySource: TagSource;
  sourceCounts: Record<TagSource, number>;
}

// ---------------------------------------------------------------------------
// 엣지
// ---------------------------------------------------------------------------

/**
 * 마인드맵 엣지 (태그 간 연결).
 * D3.js force simulation의 링크 데이터로 사용한다.
 * weight는 두 태그의 동시 출현 횟수 기반 강도이며 엣지 두께에 반영한다.
 * sourceType은 연결의 주요 출처이며 엣지 색상/스타일 결정에 사용한다.
 */
export interface MindmapEdge {
  sourceTagId: string;
  targetTagId: string;
  weight: number;
  sourceType: TagSource;
}

// ---------------------------------------------------------------------------
// 마인드맵 전체 데이터
// ---------------------------------------------------------------------------

/**
 * 마인드맵 전체 데이터.
 * period는 조회 기간 식별자이며 periodType에 따라 형식이 달라진다.
 *   - 'week'  : 'yyyy-Www' 형식 (예: '2026-W11')
 *   - 'month' : 'yyyy-MM' 형식 (예: '2026-03')
 *   - 'year'  : 'yyyy' 형식 (예: '2026')
 */
export interface MindmapData {
  nodes: MindmapNode[];
  edges: MindmapEdge[];
  period: string;
  periodType: 'week' | 'month' | 'year';
}
