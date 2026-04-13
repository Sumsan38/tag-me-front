/**
 * feed.ts
 *
 * Feed 도메인 API 클라이언트.
 *
 * 엔드포인트:
 *   - POST   /api/v1/feeds                               — 게시글 작성
 *   - GET    /api/v1/feeds                                — 전체 공개 피드 조회 (cursor)
 *   - GET    /api/v1/feeds/following                      — 팔로잉 피드 조회 (cursor)
 *   - GET    /api/v1/feeds/{id}                           — 게시글 상세 조회
 *   - PUT    /api/v1/feeds/{id}                           — 게시글 수정 (전체 교체)
 *   - DELETE /api/v1/feeds/{id}                           — 게시글 삭제 (soft delete)
 *   - POST   /api/v1/feeds/{id}/likes                     — 좋아요
 *   - DELETE /api/v1/feeds/{id}/likes                     — 좋아요 취소
 *   - GET    /api/v1/feeds/{id}/comments                  — 댓글 목록 조회 (cursor)
 *   - POST   /api/v1/feeds/{id}/comments                  — 댓글 작성
 *   - DELETE /api/v1/feeds/{feedId}/comments/{commentId}  — 댓글 삭제
 */

import apiClient from '@/api/client';
import type {
  CreateFeedRequest,
  CreateFeedResponse,
  FeedListResponse,
  FeedResponse,
  UpdateFeedRequest,
  CommentListResponse,
  CreateCommentResponse,
} from '@/types/feed';

// ---------------------------------------------------------------------------
// 게시글 CRUD
// ---------------------------------------------------------------------------

/** 게시글 작성. 성공 시 생성된 feedId 반환. */
export async function createFeed(
  data: CreateFeedRequest,
): Promise<CreateFeedResponse> {
  const response = await apiClient.post<CreateFeedResponse>(
    '/api/v1/feeds',
    data,
  );
  return response.data;
}

/** 전체 공개 피드 조회. Cursor 기반 페이지네이션. */
export async function getFeeds(
  cursor?: number,
  size: number = 20,
): Promise<FeedListResponse> {
  const params: Record<string, number> = { size };
  if (cursor) params.cursor = cursor;

  const response = await apiClient.get<FeedListResponse>('/api/v1/feeds', {
    params,
  });
  return response.data;
}

/** 팔로잉 피드 조회. Cursor 기반 페이지네이션. 인증 필수. */
export async function getFollowingFeeds(
  cursor?: number,
  size: number = 20,
): Promise<FeedListResponse> {
  const params: Record<string, number> = { size };
  if (cursor) params.cursor = cursor;

  const response = await apiClient.get<FeedListResponse>(
    '/api/v1/feeds/following',
    { params },
  );
  return response.data;
}

/** 게시글 상세 조회. */
export async function getFeed(id: number): Promise<FeedResponse> {
  const response = await apiClient.get<FeedResponse>(`/api/v1/feeds/${id}`);
  return response.data;
}

/** 게시글 수정. PUT 전체 교체 방식 — 모든 필드 필수. */
export async function updateFeed(
  id: number,
  data: UpdateFeedRequest,
): Promise<void> {
  await apiClient.put(`/api/v1/feeds/${id}`, data);
}

/** 게시글 삭제 (soft delete). */
export async function deleteFeed(id: number): Promise<void> {
  await apiClient.delete(`/api/v1/feeds/${id}`);
}

// ---------------------------------------------------------------------------
// 좋아요
// ---------------------------------------------------------------------------

/** 게시글 좋아요. */
export async function likeFeed(id: number): Promise<void> {
  await apiClient.post(`/api/v1/feeds/${id}/likes`);
}

/** 게시글 좋아요 취소. */
export async function unlikeFeed(id: number): Promise<void> {
  await apiClient.delete(`/api/v1/feeds/${id}/likes`);
}

// ---------------------------------------------------------------------------
// 댓글
// ---------------------------------------------------------------------------

/** 댓글 목록 조회. Cursor 기반 페이지네이션. */
export async function getComments(
  feedId: number,
  cursor?: number,
  size: number = 20,
): Promise<CommentListResponse> {
  const params: Record<string, number> = { size };
  if (cursor) params.cursor = cursor;

  const response = await apiClient.get<CommentListResponse>(
    `/api/v1/feeds/${feedId}/comments`,
    { params },
  );
  return response.data;
}

/** 댓글 작성. 성공 시 생성된 commentId 반환. */
export async function createComment(
  feedId: number,
  content: string,
): Promise<CreateCommentResponse> {
  const response = await apiClient.post<CreateCommentResponse>(
    `/api/v1/feeds/${feedId}/comments`,
    { content },
  );
  return response.data;
}

/** 댓글 삭제 (soft delete). */
export async function deleteComment(
  feedId: number,
  commentId: number,
): Promise<void> {
  await apiClient.delete(`/api/v1/feeds/${feedId}/comments/${commentId}`);
}
