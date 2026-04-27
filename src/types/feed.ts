/**
 * feed.ts
 *
 * Feed 도메인 타입 정의.
 *
 * 백엔드 API 스펙 기준:
 *   - POST   /api/v1/feeds                                            → CreateFeedRequest / CreateFeedResponse
 *   - GET    /api/v1/feeds                                             → FeedListResponse (cursor 기반)
 *   - GET    /api/v1/feeds/following                                   → FeedListResponse (cursor 기반)
 *   - GET    /api/v1/feeds/{id}                                        → FeedResponse
 *   - PUT    /api/v1/feeds/{id}                                        → UpdateFeedRequest (전체 교체)
 *   - DELETE /api/v1/feeds/{id}                                        → soft delete
 *   - POST   /api/v1/feeds/{id}/likes                                  → 좋아요
 *   - DELETE /api/v1/feeds/{id}/likes                                  → 좋아요 취소
 *   - GET    /api/v1/feeds/{id}/comments                               → CommentListResponse (cursor 기반)
 *   - POST   /api/v1/feeds/{id}/comments                               → CreateCommentResponse (parentCommentId로 대댓글 가능)
 *   - DELETE /api/v1/feeds/{feedId}/comments/{commentId}               → 댓글 삭제
 *   - GET    /api/v1/feeds/{feedId}/comments/{commentId}/replies        → CommentListResponse (cursor 기반)
 *   - POST   /api/v1/feeds/{feedId}/comments/{commentId}/likes         → 댓글 좋아요
 *   - DELETE /api/v1/feeds/{feedId}/comments/{commentId}/likes         → 댓글 좋아요 취소
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
  /**
   * 댓글 본문. 소프트 삭제된 댓글은 isDeleted=true이며 content는 빈 문자열일 수 있습니다.
   * isDeleted 여부로 판단하고 content 값에 의존하지 않을 것.
   */
  content: string;
  createdAt: string; // ISO 8601
  /** 부모 댓글 ID. 최상위 댓글이면 null, 대댓글이면 부모 댓글 ID. */
  parentId: number | null;
  likeCount: number;
  /** 요청자의 좋아요 여부. 비로그인 시 false. */
  likedByMe: boolean;
  /** 대댓글 수. 대댓글 항목에서는 항상 0. */
  replyCount: number;
  /**
   * 소프트 삭제 여부. 백엔드가 이 필드를 내려주지 않는 경우 undefined로 취급하며
   * content가 빈 문자열인 경우와 함께 삭제 상태로 간주합니다.
   */
  isDeleted?: boolean;
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
  /** 대댓글 작성 시 부모 댓글 ID. null이면 최상위 댓글. 1단계 깊이만 허용. */
  parentCommentId?: number;
}
