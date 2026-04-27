import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { InfiniteData } from '@tanstack/react-query';
import { createElement, type ReactNode } from 'react';
import {
  useLikeComment,
  useUnlikeComment,
  useCreateReply,
  feedKeys,
} from '@/hooks/useFeed';
import type { CommentListResponse } from '@/types/feed';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockToast = {
  success: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  warning: vi.fn(),
  show: vi.fn(),
  dismiss: vi.fn(),
};
vi.mock('@/hooks/useToast', () => ({
  useToast: () => mockToast,
}));

vi.mock('@/api/error', () => ({
  getErrorMessage: (e: unknown) =>
    e instanceof Error ? e.message : '알 수 없는 오류',
}));

const mockFeedApi = vi.hoisted(() => ({
  likeComment: vi.fn(),
  unlikeComment: vi.fn(),
  createComment: vi.fn(),
  getReplies: vi.fn(),
  getComments: vi.fn(),
}));

vi.mock('@/api/feed', () => mockFeedApi);

// ---------------------------------------------------------------------------
// 헬퍼
// ---------------------------------------------------------------------------

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return {
    wrapper: ({ children }: { children: ReactNode }) =>
      createElement(QueryClientProvider, { client: queryClient }, children),
    queryClient,
  };
}

/** InfiniteData 형태의 댓글 목록 캐시 픽스처를 생성한다. */
function makeInfiniteCommentData(
  items: CommentListResponse['items'],
): InfiniteData<CommentListResponse> {
  return {
    pages: [{ items, nextCursor: null, hasNext: false }],
    pageParams: [undefined],
  };
}

const BASE_COMMENT = {
  id: 10,
  userId: 2,
  authorNickname: '작성자',
  content: '댓글 내용',
  createdAt: '2026-04-01T10:00:00',
  parentId: null,
  likeCount: 3,
  likedByMe: false,
  replyCount: 2,
};

const BASE_REPLY = {
  ...BASE_COMMENT,
  id: 20,
  parentId: 10,
  replyCount: 0,
};

// ---------------------------------------------------------------------------
// 테스트
// ---------------------------------------------------------------------------

describe('useFeed hooks — 대댓글/댓글 좋아요', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ---- feedKeys ----
  describe('feedKeys', () => {
    it('comments 키에 feedId를 포함한다', () => {
      expect(feedKeys.comments(1)).toEqual(['feed', 'comments', 1]);
    });

    it('replies 키에 feedId와 commentId를 포함한다', () => {
      expect(feedKeys.replies(1, 5)).toEqual(['feed', 'replies', 1, 5]);
    });
  });

  // ---- useLikeComment ----
  describe('useLikeComment', () => {
    it('parentId 없을 때 — comments 캐시를 낙관적으로 업데이트한다', async () => {
      mockFeedApi.likeComment.mockResolvedValueOnce(undefined);
      const { wrapper, queryClient } = createWrapper();

      // 사전 캐시 세팅
      const cacheKey = feedKeys.comments(1);
      queryClient.setQueryData(cacheKey, makeInfiniteCommentData([BASE_COMMENT]));

      const { result } = renderHook(() => useLikeComment(), { wrapper });
      result.current.mutate({ feedId: 1, commentId: 10 });

      // onMutate 직후 캐시가 낙관적으로 변경되어야 한다
      await waitFor(() => {
        const data = queryClient.getQueryData<InfiniteData<CommentListResponse>>(cacheKey);
        const item = data?.pages[0].items.find((i) => i.id === 10);
        expect(item?.likedByMe).toBe(true);
        expect(item?.likeCount).toBe(4);
      });
    });

    it('parentId 있을 때 — replies 캐시를 낙관적으로 업데이트한다', async () => {
      mockFeedApi.likeComment.mockResolvedValueOnce(undefined);
      const { wrapper, queryClient } = createWrapper();

      const repliesKey = feedKeys.replies(1, 10);
      queryClient.setQueryData(repliesKey, makeInfiniteCommentData([BASE_REPLY]));

      const { result } = renderHook(() => useLikeComment(), { wrapper });
      result.current.mutate({ feedId: 1, commentId: 20, parentId: 10 });

      await waitFor(() => {
        const data = queryClient.getQueryData<InfiniteData<CommentListResponse>>(repliesKey);
        const item = data?.pages[0].items.find((i) => i.id === 20);
        expect(item?.likedByMe).toBe(true);
        expect(item?.likeCount).toBe(4);
      });
    });

    it('parentId 있을 때 — comments 캐시는 변경하지 않는다', async () => {
      mockFeedApi.likeComment.mockResolvedValueOnce(undefined);
      const { wrapper, queryClient } = createWrapper();

      const commentsKey = feedKeys.comments(1);
      const repliesKey = feedKeys.replies(1, 10);
      queryClient.setQueryData(commentsKey, makeInfiniteCommentData([BASE_COMMENT]));
      queryClient.setQueryData(repliesKey, makeInfiniteCommentData([BASE_REPLY]));

      const { result } = renderHook(() => useLikeComment(), { wrapper });
      result.current.mutate({ feedId: 1, commentId: 20, parentId: 10 });

      await waitFor(() => result.current.isSuccess);

      // comments 캐시의 likedByMe는 변경되지 않아야 한다
      const commentsData = queryClient.getQueryData<InfiniteData<CommentListResponse>>(commentsKey);
      const commentItem = commentsData?.pages[0].items.find((i) => i.id === 10);
      expect(commentItem?.likedByMe).toBe(false);
    });

    it('API 실패 시 캐시를 롤백하고 에러 toast를 표시한다', async () => {
      mockFeedApi.likeComment.mockRejectedValueOnce(new Error('서버 오류'));
      const { wrapper, queryClient } = createWrapper();

      const cacheKey = feedKeys.comments(1);
      queryClient.setQueryData(cacheKey, makeInfiniteCommentData([BASE_COMMENT]));

      const { result } = renderHook(() => useLikeComment(), { wrapper });
      result.current.mutate({ feedId: 1, commentId: 10 });

      await waitFor(() => result.current.isError);

      // 롤백: 원래 값으로 복원
      const data = queryClient.getQueryData<InfiniteData<CommentListResponse>>(cacheKey);
      const item = data?.pages[0].items.find((i) => i.id === 10);
      expect(item?.likedByMe).toBe(false);
      expect(item?.likeCount).toBe(3);
      expect(mockToast.error).toHaveBeenCalledWith('서버 오류');
    });
  });

  // ---- useUnlikeComment ----
  describe('useUnlikeComment', () => {
    it('parentId 없을 때 — comments 캐시에서 좋아요를 취소한다', async () => {
      mockFeedApi.unlikeComment.mockResolvedValueOnce(undefined);
      const { wrapper, queryClient } = createWrapper();

      const likedComment = { ...BASE_COMMENT, likedByMe: true, likeCount: 3 };
      const cacheKey = feedKeys.comments(1);
      queryClient.setQueryData(cacheKey, makeInfiniteCommentData([likedComment]));

      const { result } = renderHook(() => useUnlikeComment(), { wrapper });
      result.current.mutate({ feedId: 1, commentId: 10 });

      await waitFor(() => {
        const data = queryClient.getQueryData<InfiniteData<CommentListResponse>>(cacheKey);
        const item = data?.pages[0].items.find((i) => i.id === 10);
        expect(item?.likedByMe).toBe(false);
        expect(item?.likeCount).toBe(2);
      });
    });

    it('parentId 있을 때 — replies 캐시에서 좋아요를 취소한다', async () => {
      mockFeedApi.unlikeComment.mockResolvedValueOnce(undefined);
      const { wrapper, queryClient } = createWrapper();

      const likedReply = { ...BASE_REPLY, likedByMe: true, likeCount: 5 };
      const repliesKey = feedKeys.replies(1, 10);
      queryClient.setQueryData(repliesKey, makeInfiniteCommentData([likedReply]));

      const { result } = renderHook(() => useUnlikeComment(), { wrapper });
      result.current.mutate({ feedId: 1, commentId: 20, parentId: 10 });

      await waitFor(() => {
        const data = queryClient.getQueryData<InfiniteData<CommentListResponse>>(repliesKey);
        const item = data?.pages[0].items.find((i) => i.id === 20);
        expect(item?.likedByMe).toBe(false);
        expect(item?.likeCount).toBe(4);
      });
    });

    it('likeCount가 0일 때 음수가 되지 않는다', async () => {
      mockFeedApi.unlikeComment.mockResolvedValueOnce(undefined);
      const { wrapper, queryClient } = createWrapper();

      const zeroLikeComment = { ...BASE_COMMENT, likedByMe: true, likeCount: 0 };
      const cacheKey = feedKeys.comments(1);
      queryClient.setQueryData(cacheKey, makeInfiniteCommentData([zeroLikeComment]));

      const { result } = renderHook(() => useUnlikeComment(), { wrapper });
      result.current.mutate({ feedId: 1, commentId: 10 });

      await waitFor(() => {
        const data = queryClient.getQueryData<InfiniteData<CommentListResponse>>(cacheKey);
        const item = data?.pages[0].items.find((i) => i.id === 10);
        expect(item?.likeCount).toBe(0);
      });
    });

    it('API 실패 시 캐시를 롤백하고 에러 toast를 표시한다', async () => {
      mockFeedApi.unlikeComment.mockRejectedValueOnce(new Error('좋아요 취소 실패'));
      const { wrapper, queryClient } = createWrapper();

      const likedComment = { ...BASE_COMMENT, likedByMe: true, likeCount: 3 };
      const cacheKey = feedKeys.comments(1);
      queryClient.setQueryData(cacheKey, makeInfiniteCommentData([likedComment]));

      const { result } = renderHook(() => useUnlikeComment(), { wrapper });
      result.current.mutate({ feedId: 1, commentId: 10 });

      await waitFor(() => result.current.isError);

      // 롤백: 원래 값 복원
      const data = queryClient.getQueryData<InfiniteData<CommentListResponse>>(cacheKey);
      const item = data?.pages[0].items.find((i) => i.id === 10);
      expect(item?.likedByMe).toBe(true);
      expect(item?.likeCount).toBe(3);
      expect(mockToast.error).toHaveBeenCalledWith('좋아요 취소 실패');
    });
  });

  // ---- useCreateReply ----
  describe('useCreateReply', () => {
    it('성공 시 replies 캐시를 무효화한다', async () => {
      mockFeedApi.createComment.mockResolvedValueOnce({ commentId: 30 });
      const { wrapper, queryClient } = createWrapper();

      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useCreateReply(), { wrapper });
      result.current.mutate({ feedId: 1, content: '대댓글', parentCommentId: 10 });

      await waitFor(() => result.current.isSuccess);

      expect(invalidateQueriesSpy).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: feedKeys.replies(1, 10) }),
      );
    });

    it('성공 시 comments 캐시도 무효화한다 (replyCount 갱신)', async () => {
      mockFeedApi.createComment.mockResolvedValueOnce({ commentId: 31 });
      const { wrapper, queryClient } = createWrapper();

      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useCreateReply(), { wrapper });
      result.current.mutate({ feedId: 1, content: '대댓글2', parentCommentId: 10 });

      await waitFor(() => result.current.isSuccess);

      expect(invalidateQueriesSpy).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: feedKeys.comments(1) }),
      );
    });

    it('createComment API를 parentCommentId 포함하여 호출한다', async () => {
      mockFeedApi.createComment.mockResolvedValueOnce({ commentId: 32 });
      const { wrapper } = createWrapper();

      const { result } = renderHook(() => useCreateReply(), { wrapper });
      result.current.mutate({ feedId: 2, content: '답글 내용', parentCommentId: 7 });

      await waitFor(() => result.current.isSuccess);

      expect(mockFeedApi.createComment).toHaveBeenCalledWith(2, '답글 내용', 7);
    });

    it('실패 시 에러 toast를 표시한다', async () => {
      mockFeedApi.createComment.mockRejectedValueOnce(new Error('등록 실패'));
      const { wrapper } = createWrapper();

      const { result } = renderHook(() => useCreateReply(), { wrapper });
      result.current.mutate({ feedId: 1, content: '대댓글', parentCommentId: 5 });

      await waitFor(() => result.current.isError);

      expect(mockToast.error).toHaveBeenCalledWith('등록 실패');
    });
  });
});
