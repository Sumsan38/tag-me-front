/**
 * feed.ts
 *
 * Feed 도메인 타입 정의.
 *
 * 백엔드 API 스펙 기준:
 *   - POST   /api/v1/feeds                            → CreateFeedRequest / CreateFeedResponse
 *   - GET    /api/v1/feeds                             → FeedListResponse (cursor 기반)
 *   - GET    /api/v1/feeds/following                   → FeedListResponse (cursor 기반)
 *   - GET    /api/v1/feeds/{id}                        → FeedResponse
 *   - PUT    /api/v1/feeds/{id}                        → UpdateFeedRequest (전체 교체)
 *   - DELETE /api/v1/feeds/{id}                        → soft delete
 *   - POST   /api/v1/feeds/{id}/likes                  → 좋아요
 *   - DELETE /api/v1/feeds/{id}/likes                  → 좋아요 취소
 *   - GET    /api/v1/feeds/{id}/comments               → CommentListResponse (cursor 기반)
 *   - POST   /api/v1/feeds/{id}/comments               → CreateCommentResponse
 *   - DELETE /api/v1/feeds/{feedId}/comments/{commentId} → 댓글 삭제
 */

// ---------------------------------------------------------------------------
// 태그 정보 (FeedResponse 내부)
// ---------------------------------------------------------------------------

export interface FeedTag {
  id: number;
  name: string;
}

// ---------------------------------------------------------------------------
// 게시글 응답
// ---------------------------------------------------------------------------

export interface FeedResponse {
  id: number;
  userId: number;
  /** 작성자 닉네임. 탈퇴한 사용자인 경우 빈 문자열("")로 반환됩니다. */
  authorNickname: string;
  content: string;
  isPublic: boolean;
  tags: FeedTag[];
  imageUrls: string[];
  likeCount: number;
  likedByMe: boolean;
  commentCount: number;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

export interface FeedListResponse {
  items: FeedResponse[];
  nextCursor: number | null;
  hasNext: boolean;
}

export interface CreateFeedResponse {
  feedId: number;
}

// ---------------------------------------------------------------------------
// 게시글 요청
// ---------------------------------------------------------------------------

export interface CreateFeedRequest {
  content: string; // 1~10,000자
  isPublic: boolean;
  tagNames?: string[]; // 최대 10개
  imageUrls?: string[]; // 최대 10장
}

/** PUT 전체 교체 방식 — 모든 필드 필수. */
export interface UpdateFeedRequest {
  content: string; // 1~10,000자
  isPublic: boolean;
  tagNames?: string[]; // 최대 10개
  imageUrls?: string[]; // 최대 10장
}

// ---------------------------------------------------------------------------
// 댓글 응답
// ---------------------------------------------------------------------------

export interface CommentResponse {
  id: number;
  userId: number;
  /** 작성자 닉네임. 탈퇴한 사용자인 경우 빈 문자열("")로 반환됩니다. */
  authorNickname: string;
  content: string;
  createdAt: string; // ISO 8601
}

export interface CommentListResponse {
  items: CommentResponse[];
  nextCursor: number | null;
  hasNext: boolean;
}

export interface CreateCommentResponse {
  commentId: number;
}

// ---------------------------------------------------------------------------
// 댓글 요청
// ---------------------------------------------------------------------------

export interface CreateCommentRequest {
  content: string; // 1~1,000자
}
