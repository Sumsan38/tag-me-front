'use client';

import { useReplies } from '@/hooks/useFeed';
import CommentItem from './CommentItem';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface ReplyListProps {
  feedId: number;
  commentId: number;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ReplyList({ feedId, commentId }: ReplyListProps) {
  const repliesQuery = useReplies(feedId, commentId);
  const replies = repliesQuery.data?.pages.flatMap((page) => page.items) ?? [];

  if (repliesQuery.isLoading) {
    return (
      <div className="flex justify-center py-4">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-200 border-t-accent" />
      </div>
    );
  }

  return (
    <div>
      {replies.map((reply) => (
        <CommentItem key={reply.id} feedId={feedId} comment={reply} isReply />
      ))}

      {repliesQuery.hasNextPage && (
        <button
          type="button"
          onClick={() => repliesQuery.fetchNextPage()}
          disabled={repliesQuery.isFetchingNextPage}
          className="mb-2 ml-2 text-xs font-medium text-accent hover:underline disabled:opacity-40"
        >
          {repliesQuery.isFetchingNextPage ? '불러오는 중...' : '대댓글 더 보기'}
        </button>
      )}
    </div>
  );
}
