// ── ContentResponse discriminated union (Swagger 스펙 기반) ──────────────────

export interface DiaryContentResponse {
  type: 'DIARY';
  id: number;
  contentSnippet: string;
  tags: string[];
  createdAt: string;       // ISO-8601
  diaryDateTime: string;   // ISO-8601, diary_date 기반
}

export interface FeedContentResponse {
  type: 'FEED';
  id: number;
  contentSnippet: string;
  imageUrls: string[];
  tags: string[];
  createdAt: string;       // ISO-8601
  likeCount: number;
}

export type ContentResponse = DiaryContentResponse | FeedContentResponse;

// ── TagContentsResponse ──────────────────────────────────────────────────────

export interface TagContentsResponse {
  items: ContentResponse[];
  nextCursor: string | null;
}

// ── EdgeContentsResponse ─────────────────────────────────────────────────────

export interface EdgeContentsResponse {
  items: ContentResponse[];
  nextCursor: string | null;
}
