/**
 * feed.ts
 *
 * Feed 도메인 타입 정의.
 *
 * - Post: 공개 게시글 엔티티 (좋아요, 댓글 집계 포함)
 * - CreatePostRequest: 게시글 작성 요청 바디
 * - Comment: 댓글 엔티티
 * - CreateCommentRequest: 댓글 작성 요청 바디
 * - Like: 좋아요 기록
 *
 * 이미지는 S3 Pre-signed URL로 업로드 후 CloudFront CDN URL을 저장한다.
 * 단일 이미지 최대 10MB, 게시글당 최대 10장.
 */

// ---------------------------------------------------------------------------
// 게시글
// ---------------------------------------------------------------------------

/**
 * 공개 게시글.
 * isLiked는 현재 인증된 사용자의 좋아요 여부이다. 비인증 상태에서는 항상 false.
 * isPublic이 false인 게시글은 본인만 조회 가능하다.
 * images는 CloudFront CDN URL 목록이다.
 */
export interface Post {
  id: string;
  content: string;
  images: string[];          // CloudFront CDN URL 목록
  tags: string[];
  authorId: string;
  authorNickname: string;
  authorProfileImage: string | null;
  likeCount: number;
  commentCount: number;
  isLiked: boolean;          // 현재 사용자의 좋아요 여부
  isPublic: boolean;
  createdAt: string;         // ISO 8601
}

export interface CreatePostRequest {
  content: string;
  imageUrls: string[];       // CloudFront CDN URL 목록 (S3 업로드 완료 후 전달)
  tags: string[];
  isPublic: boolean;
}

// ---------------------------------------------------------------------------
// 댓글
// ---------------------------------------------------------------------------

export interface Comment {
  id: string;
  postId: string;
  content: string;
  authorId: string;
  authorNickname: string;
  authorProfileImage: string | null;
  createdAt: string; // ISO 8601
}

export interface CreateCommentRequest {
  content: string;
}

// ---------------------------------------------------------------------------
// 좋아요
// ---------------------------------------------------------------------------

/**
 * 좋아요 기록.
 * 좋아요 토글 낙관적 업데이트 롤백 시 이전 상태를 복원하는 데 사용한다.
 */
export interface Like {
  userId: string;
  postId: string;
  createdAt: string; // ISO 8601
}
