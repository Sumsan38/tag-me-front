/**
 * useFeed.ts
 *
 * Feed 도메인 React Query 훅.
 *
 * 훅 목록:
 *   - useFeeds()            — 전체 공개 피드 infinite query
 *   - useFollowingFeeds()   — 팔로잉 피드 infinite query
 *   - useFeed()             — 게시글 상세 query
 *   - useCreateFeed()       — 게시글 작성 mutation
 *   - useUpdateFeed()       — 게시글 수정 mutation
 *   - useDeleteFeed()       — 게시글 삭제 mutation
 *   - useLikeFeed()         — 좋아요 mutation (낙관적 업데이트)
 *   - useUnlikeFeed()       — 좋아요 취소 mutation (낙관적 업데이트)
 *   - useComments()         — 댓글 목록 infinite query
 *   - useCreateComment()    — 댓글 작성 mutation
 *   - useDeleteComment()    — 댓글 삭제 mutation
 */

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import type { InfiniteData } from '@tanstack/react-query';
import { useToast } from '@/hooks/useToast';
import { getErrorMessage } from '@/api/error';
import * as feedApi from '@/api/feed';
import type {
  CreateFeedRequest,
  UpdateFeedRequest,
  FeedListResponse,
  FeedResponse,
} from '@/types/feed';

// ---------------------------------------------------------------------------
// Query Keys
// ---------------------------------------------------------------------------

export const feedKeys = {
  all: ['feed'] as const,
  lists: () => [...feedKeys.all, 'list'] as const,
  public: () => [...feedKeys.lists(), 'public'] as const,
  following: () => [...feedKeys.lists(), 'following'] as const,
  detail: (id: number) => [...feedKeys.all, 'detail', id] as const,
  comments: (feedId: number) =>
    [...feedKeys.all, 'comments', feedId] as const,
};

// ---------------------------------------------------------------------------
// useFeeds (전체 공개)
// ---------------------------------------------------------------------------

/** 전체 공개 피드. Cursor 기반 무한 스크롤. */
export function useFeeds() {
  return useInfiniteQuery({
    queryKey: feedKeys.public(),
    queryFn: ({ pageParam }) => feedApi.getFeeds(pageParam),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? (lastPage.nextCursor ?? undefined) : undefined,
    staleTime: 2 * 60 * 1000,
  });
}

// ---------------------------------------------------------------------------
// useFollowingFeeds
// ---------------------------------------------------------------------------

/** 팔로잉 피드. Cursor 기반 무한 스크롤. 인증 필수. */
export function useFollowingFeeds(enabled = true) {
  return useInfiniteQuery({
    queryKey: feedKeys.following(),
    queryFn: ({ pageParam }) => feedApi.getFollowingFeeds(pageParam),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? (lastPage.nextCursor ?? undefined) : undefined,
    staleTime: 2 * 60 * 1000,
    enabled,
  });
}

// ---------------------------------------------------------------------------
// useFeed
// ---------------------------------------------------------------------------

/** 게시글 상세 query. id가 truthy일 때만 활성화. */
export function useFeed(id: number | null | undefined) {
  return useQuery({
    queryKey: feedKeys.detail(id!),
    queryFn: () => feedApi.getFeed(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

// ---------------------------------------------------------------------------
// useCreateFeed
// ---------------------------------------------------------------------------

/** 게시글 작성 mutation. 성공 시 피드 목록 캐시 무효화 + toast. */
export function useCreateFeed() {
  const toast = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFeedRequest) => feedApi.createFeed(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feedKeys.lists() });
      toast.success('게시글이 등록되었습니다.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

// ---------------------------------------------------------------------------
// useUpdateFeed
// ---------------------------------------------------------------------------

/** 게시글 수정 mutation. 성공 시 상세 + 목록 캐시 무효화 + toast. */
export function useUpdateFeed() {
  const toast = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateFeedRequest }) =>
      feedApi.updateFeed(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: feedKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: feedKeys.lists() });
      toast.success('게시글이 수정되었습니다.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

// ---------------------------------------------------------------------------
// useDeleteFeed
// ---------------------------------------------------------------------------

/** 게시글 삭제 mutation. 성공 시 캐시 정리 + toast. */
export function useDeleteFeed() {
  const toast = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => feedApi.deleteFeed(id),
    onSuccess: (_, deletedId) => {
      queryClient.removeQueries({ queryKey: feedKeys.detail(deletedId) });
      queryClient.invalidateQueries({ queryKey: feedKeys.lists() });
      toast.success('게시글이 삭제되었습니다.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

// ---------------------------------------------------------------------------
// useLikeFeed — 낙관적 업데이트
// ---------------------------------------------------------------------------

/** 좋아요. 클릭 즉시 UI 반영, 서버 실패 시 자동 롤백. */
export function useLikeFeed() {
  const toast = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (feedId: number) => feedApi.likeFeed(feedId),

    onMutate: async (feedId) => {
      await queryClient.cancelQueries({ queryKey: feedKeys.detail(feedId) });
      await queryClient.cancelQueries({ queryKey: feedKeys.lists() });

      const prevDetail = queryClient.getQueryData<FeedResponse>(
        feedKeys.detail(feedId),
      );
      const prevPublic = queryClient.getQueryData<
        InfiniteData<FeedListResponse>
      >(feedKeys.public());
      const prevFollowing = queryClient.getQueryData<
        InfiniteData<FeedListResponse>
      >(feedKeys.following());

      // 상세 캐시 낙관적 업데이트
      if (prevDetail) {
        queryClient.setQueryData<FeedResponse>(feedKeys.detail(feedId), {
          ...prevDetail,
          likedByMe: true,
          likeCount: prevDetail.likeCount + 1,
        });
      }

      // 목록 캐시 낙관적 업데이트
      const updateList = (
        data: InfiniteData<FeedListResponse> | undefined,
      ) => {
        if (!data) return data;
        return {
          ...data,
          pages: data.pages.map((page) => ({
            ...page,
            items: page.items.map((item) =>
              item.id === feedId
                ? { ...item, likedByMe: true, likeCount: item.likeCount + 1 }
                : item,
            ),
          })),
        };
      };

      queryClient.setQueryData(feedKeys.public(), updateList(prevPublic));
      queryClient.setQueryData(
        feedKeys.following(),
        updateList(prevFollowing),
      );

      return { prevDetail, prevPublic, prevFollowing };
    },

    onError: (error, feedId, context) => {
      if (context?.prevDetail) {
        queryClient.setQueryData(feedKeys.detail(feedId), context.prevDetail);
      }
      if (context?.prevPublic) {
        queryClient.setQueryData(feedKeys.public(), context.prevPublic);
      }
      if (context?.prevFollowing) {
        queryClient.setQueryData(feedKeys.following(), context.prevFollowing);
      }
      toast.error(getErrorMessage(error));
    },
  });
}

// ---------------------------------------------------------------------------
// useUnlikeFeed — 낙관적 업데이트
// ---------------------------------------------------------------------------

/** 좋아요 취소. 클릭 즉시 UI 반영, 서버 실패 시 자동 롤백. */
export function useUnlikeFeed() {
  const toast = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (feedId: number) => feedApi.unlikeFeed(feedId),

    onMutate: async (feedId) => {
      await queryClient.cancelQueries({ queryKey: feedKeys.detail(feedId) });
      await queryClient.cancelQueries({ queryKey: feedKeys.lists() });

      const prevDetail = queryClient.getQueryData<FeedResponse>(
        feedKeys.detail(feedId),
      );
      const prevPublic = queryClient.getQueryData<
        InfiniteData<FeedListResponse>
      >(feedKeys.public());
      const prevFollowing = queryClient.getQueryData<
        InfiniteData<FeedListResponse>
      >(feedKeys.following());

      if (prevDetail) {
        queryClient.setQueryData<FeedResponse>(feedKeys.detail(feedId), {
          ...prevDetail,
          likedByMe: false,
          likeCount: Math.max(0, prevDetail.likeCount - 1),
        });
      }

      const updateList = (
        data: InfiniteData<FeedListResponse> | undefined,
      ) => {
        if (!data) return data;
        return {
          ...data,
          pages: data.pages.map((page) => ({
            ...page,
            items: page.items.map((item) =>
              item.id === feedId
                ? {
                    ...item,
                    likedByMe: false,
                    likeCount: Math.max(0, item.likeCount - 1),
                  }
                : item,
            ),
          })),
        };
      };

      queryClient.setQueryData(feedKeys.public(), updateList(prevPublic));
      queryClient.setQueryData(
        feedKeys.following(),
        updateList(prevFollowing),
      );

      return { prevDetail, prevPublic, prevFollowing };
    },

    onError: (error, feedId, context) => {
      if (context?.prevDetail) {
        queryClient.setQueryData(feedKeys.detail(feedId), context.prevDetail);
      }
      if (context?.prevPublic) {
        queryClient.setQueryData(feedKeys.public(), context.prevPublic);
      }
      if (context?.prevFollowing) {
        queryClient.setQueryData(feedKeys.following(), context.prevFollowing);
      }
      toast.error(getErrorMessage(error));
    },
  });
}

// ---------------------------------------------------------------------------
// useComments
// ---------------------------------------------------------------------------

/** 댓글 목록. Cursor 기반 무한 스크롤. */
export function useComments(feedId: number | null | undefined) {
  return useInfiniteQuery({
    queryKey: feedKeys.comments(feedId!),
    queryFn: ({ pageParam }) => feedApi.getComments(feedId!, pageParam),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? (lastPage.nextCursor ?? undefined) : undefined,
    enabled: !!feedId,
    staleTime: 60 * 1000,
  });
}

// ---------------------------------------------------------------------------
// useCreateComment
// ---------------------------------------------------------------------------

/** 댓글 작성 mutation. 성공 시 댓글 목록 + 게시글 상세(commentCount) 무효화. */
export function useCreateComment() {
  const toast = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ feedId, content }: { feedId: number; content: string }) =>
      feedApi.createComment(feedId, content),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: feedKeys.comments(variables.feedId),
      });
      queryClient.invalidateQueries({
        queryKey: feedKeys.detail(variables.feedId),
      });
      queryClient.invalidateQueries({ queryKey: feedKeys.lists() });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

// ---------------------------------------------------------------------------
// useDeleteComment
// ---------------------------------------------------------------------------

/** 댓글 삭제 mutation. 성공 시 댓글 목록 + 게시글 상세(commentCount) 무효화. */
export function useDeleteComment() {
  const toast = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      feedId,
      commentId,
    }: {
      feedId: number;
      commentId: number;
    }) => feedApi.deleteComment(feedId, commentId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: feedKeys.comments(variables.feedId),
      });
      queryClient.invalidateQueries({
        queryKey: feedKeys.detail(variables.feedId),
      });
      queryClient.invalidateQueries({ queryKey: feedKeys.lists() });
      toast.success('댓글이 삭제되었습니다.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
