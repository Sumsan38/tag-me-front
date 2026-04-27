'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send } from 'lucide-react';

import { useComments, useCreateComment } from '@/hooks/useFeed';
import { useAuthStore, selectIsAuthenticated } from '@/stores/authStore';
import CommentItem from './CommentItem';
import ReplyList from './ReplyList';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface CommentListProps {
  feedId: number;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CommentList({ feedId }: CommentListProps) {
  const isAuthenticated = useAuthStore(selectIsAuthenticated);

  const commentsQuery = useComments(feedId);
  const createComment = useCreateComment();

  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const comments =
    commentsQuery.data?.pages.flatMap((page) => page.items) ?? [];

  // ---- Infinite scroll ----
  const sentinelRef = useRef<HTMLDivElement>(null);

  const handleIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (
        entry.isIntersecting &&
        commentsQuery.hasNextPage &&
        !commentsQuery.isFetchingNextPage
      ) {
        commentsQuery.fetchNextPage();
      }
    },
    [commentsQuery],
  );

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(handleIntersect, {
      rootMargin: '100px',
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [handleIntersect]);

  // ---- Submit ----
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || createComment.isPending) return;

    createComment.mutate(
      { feedId, content: trimmed },
      {
        onSuccess: () => {
          setInput('');
          inputRef.current?.focus();
        },
      },
    );
  }

  return (
    <div>
      {/* Comment items */}
      <div className="divide-y divide-gray-50">
        {comments.map((comment) => (
          <CommentItem
            key={comment.id}
            feedId={feedId}
            comment={comment}
            renderReplies={(commentId) => (
              <ReplyList feedId={feedId} commentId={commentId} />
            )}
          />
        ))}
      </div>

      {/* Loading */}
      {commentsQuery.isLoading && (
        <div className="flex justify-center py-6">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-200 border-t-accent" />
        </div>
      )}

      {commentsQuery.isFetchingNextPage && (
        <div className="flex justify-center py-4">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-200 border-t-accent" />
        </div>
      )}

      {/* Empty */}
      {!commentsQuery.isLoading && comments.length === 0 && (
        <p className="py-8 text-center text-sm text-muted">
          아직 댓글이 없습니다
        </p>
      )}

      {/* Sentinel */}
      <div ref={sentinelRef} className="h-1" />

      {/* Comment input (fixed at bottom) */}
      {isAuthenticated && (
        <form
          onSubmit={handleSubmit}
          className="sticky bottom-16 md:bottom-0 flex items-center gap-2 border-t border-gray-100 bg-white px-5 py-3"
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="댓글을 입력하세요"
            maxLength={1000}
            className="flex-1 rounded-full border border-gray-100 bg-gray-50 px-4 py-2 text-sm text-gray-900 placeholder:text-gray-300 focus:border-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-200"
          />
          <button
            type="submit"
            disabled={!input.trim() || createComment.isPending}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-white disabled:opacity-40 transition-colors"
            aria-label="댓글 등록"
          >
            <Send size={16} />
          </button>
        </form>
      )}
    </div>
  );
}
