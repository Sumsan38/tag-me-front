import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getReplies,
  likeComment,
  unlikeComment,
  createComment,
} from '@/api/feed';

// ---------------------------------------------------------------------------
// apiClient mock
// ---------------------------------------------------------------------------

const mockPost = vi.fn();
const mockGet = vi.fn();
const mockDelete = vi.fn();

vi.mock('@/api/client', () => ({
  default: {
    post: (...args: unknown[]) => mockPost(...args),
    get: (...args: unknown[]) => mockGet(...args),
    delete: (...args: unknown[]) => mockDelete(...args),
  },
  ApiError: class extends Error {
    code: string;
    status?: number;
    constructor(message: string, code: string, status?: number) {
      super(message);
      this.code = code;
      this.status = status;
    }
  },
  isApiError: (e: unknown) => e instanceof Error && 'code' in e,
}));

// ---------------------------------------------------------------------------
// 테스트 데이터
// ---------------------------------------------------------------------------

const COMMENT_LIST_RESPONSE = {
  items: [
    {
      id: 10,
      userId: 1,
      authorNickname: '테스터',
      content: '대댓글 내용',
      createdAt: '2026-04-01T10:00:00',
      parentId: 5,
      likeCount: 0,
      likedByMe: false,
      replyCount: 0,
    },
  ],
  nextCursor: null,
  hasNext: false,
};

// ---------------------------------------------------------------------------
// 테스트
// ---------------------------------------------------------------------------

describe('api/feed — 대댓글/댓글 좋아요', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ---- getReplies ----
  describe('getReplies', () => {
    it('GET /api/v1/feeds/{feedId}/comments/{commentId}/replies 를 호출한다', async () => {
      mockGet.mockResolvedValueOnce({ data: COMMENT_LIST_RESPONSE });

      const result = await getReplies(1, 5);

      expect(mockGet).toHaveBeenCalledWith(
        '/api/v1/feeds/1/comments/5/replies',
        { params: { size: 20 } },
      );
      expect(result.items).toHaveLength(1);
      expect(result.hasNext).toBe(false);
    });

    it('cursor 파라미터를 전달하면 params에 포함한다', async () => {
      mockGet.mockResolvedValueOnce({ data: COMMENT_LIST_RESPONSE });

      await getReplies(2, 7, 100);

      expect(mockGet).toHaveBeenCalledWith(
        '/api/v1/feeds/2/comments/7/replies',
        { params: { size: 20, cursor: 100 } },
      );
    });

    it('size를 커스텀하면 params에 반영된다', async () => {
      mockGet.mockResolvedValueOnce({ data: COMMENT_LIST_RESPONSE });

      await getReplies(3, 9, undefined, 10);

      expect(mockGet).toHaveBeenCalledWith(
        '/api/v1/feeds/3/comments/9/replies',
        { params: { size: 10 } },
      );
    });
  });

  // ---- likeComment ----
  describe('likeComment', () => {
    it('POST /api/v1/feeds/{feedId}/comments/{commentId}/likes 를 호출한다', async () => {
      mockPost.mockResolvedValueOnce({ data: undefined });

      await likeComment(1, 5);

      expect(mockPost).toHaveBeenCalledWith(
        '/api/v1/feeds/1/comments/5/likes',
      );
    });

    it('다른 feedId / commentId 조합도 올바른 URL을 생성한다', async () => {
      mockPost.mockResolvedValueOnce({ data: undefined });

      await likeComment(99, 42);

      expect(mockPost).toHaveBeenCalledWith(
        '/api/v1/feeds/99/comments/42/likes',
      );
    });
  });

  // ---- unlikeComment ----
  describe('unlikeComment', () => {
    it('DELETE /api/v1/feeds/{feedId}/comments/{commentId}/likes 를 호출한다', async () => {
      mockDelete.mockResolvedValueOnce({ data: undefined });

      await unlikeComment(1, 5);

      expect(mockDelete).toHaveBeenCalledWith(
        '/api/v1/feeds/1/comments/5/likes',
      );
    });

    it('다른 feedId / commentId 조합도 올바른 URL을 생성한다', async () => {
      mockDelete.mockResolvedValueOnce({ data: undefined });

      await unlikeComment(3, 17);

      expect(mockDelete).toHaveBeenCalledWith(
        '/api/v1/feeds/3/comments/17/likes',
      );
    });
  });

  // ---- createComment — parentCommentId 포함 시 body에 포함 ----
  describe('createComment', () => {
    it('parentCommentId 없이 호출하면 body에 content만 포함된다', async () => {
      mockPost.mockResolvedValueOnce({ data: { commentId: 1 } });

      await createComment(1, '일반 댓글');

      expect(mockPost).toHaveBeenCalledWith(
        '/api/v1/feeds/1/comments',
        { content: '일반 댓글' },
      );
    });

    it('parentCommentId를 전달하면 body에 parentCommentId가 포함된다', async () => {
      mockPost.mockResolvedValueOnce({ data: { commentId: 2 } });

      await createComment(1, '대댓글 내용', 5);

      expect(mockPost).toHaveBeenCalledWith(
        '/api/v1/feeds/1/comments',
        { content: '대댓글 내용', parentCommentId: 5 },
      );
    });

    it('성공 시 commentId를 반환한다', async () => {
      mockPost.mockResolvedValueOnce({ data: { commentId: 99 } });

      const result = await createComment(2, '내용', 10);

      expect(result.commentId).toBe(99);
    });
  });
});
