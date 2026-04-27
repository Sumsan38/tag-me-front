'use client';

import { useState } from 'react';
import { Heart, Trash2, Send } from 'lucide-react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';

import Avatar from '@/components/common/Avatar';
import {
  useDeleteComment,
  useLikeComment,
  useUnlikeComment,
  useCreateReply,
} from '@/hooks/useFeed';
import { useAuthStore, selectIsAuthenticated } from '@/stores/authStore';
import type { CommentResponse } from '@/types/feed';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface CommentItemProps {
  feedId: number;
  comment: CommentResponse;
  /** true이면 답글 달기 / 대댓글 보기 버튼을 렌더링하지 않음 (1단계 깊이 한정). */
  isReply?: boolean;
  /** 대댓글 목록을 렌더링하는 render prop. CommentList에서 주입. */
  renderReplies?: (commentId: number) => React.ReactNode;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CommentItem({
  feedId,
  comment,
  isReply = false,
  renderReplies,
}: CommentItemProps) {
  const [showReplies, setShowReplies] = useState(false);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState('');

  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const currentUserId = useAuthStore((s) => s.user?.id ?? null);

  const likeComment = useLikeComment();
  const unlikeComment = useUnlikeComment();
  const deleteComment = useDeleteComment();
  const createReply = useCreateReply();

  function handleLikeToggle() {
    if (!isAuthenticated) return;
    const params = {
      feedId,
      commentId: comment.id,
      parentId: comment.parentId ?? undefined,
    };
    if (comment.likedByMe) {
      unlikeComment.mutate(params);
    } else {
      likeComment.mutate(params);
    }
  }

  function handleReplySubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = replyText.trim();
    if (!trimmed || createReply.isPending) return;

    createReply.mutate(
      { feedId, content: trimmed, parentCommentId: comment.id },
      {
        onSuccess: () => {
          setReplyText('');
          setShowReplyInput(false);
          setShowReplies(true);
        },
      },
    );
  }

  const authorLabel = comment.authorNickname || '탈퇴한 사용자';
  // isDeleted 플래그 또는 content 빈 문자열로 삭제 상태를 판단한다.
  const isDeleted = comment.isDeleted === true || (!comment.isDeleted && comment.content === '');

  return (
    <div>
      {/* Comment body */}
      <div className={`flex gap-2.5 ${isReply ? 'py-2.5' : 'py-3'}`}>
        <Avatar
          initials={comment.authorNickname ? comment.authorNickname[0].toUpperCase() : '?'}
          size="sm"
        />
        <div className="flex-1 min-w-0">
          {/* Header row */}
          <div className="flex items-baseline gap-2">
            <span className="text-xs font-semibold text-foreground">{authorLabel}</span>
            <span className="text-[10px] text-muted">
              {formatDistanceToNow(parseISO(comment.createdAt), {
                addSuffix: true,
                locale: ko,
              })}
            </span>
            {/* 삭제된 댓글에는 삭제 버튼을 표시하지 않는다 */}
            {!isDeleted && currentUserId === comment.userId && (
              <button
                type="button"
                onClick={() =>
                  deleteComment.mutate({
                    feedId,
                    commentId: comment.id,
                    parentId: comment.parentId ?? undefined,
                  })
                }
                className="ml-auto text-muted hover:text-error transition-colors"
                aria-label="댓글 삭제"
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>

          {/* Content */}
          {isDeleted ? (
            <p className="mt-0.5 text-[13px] leading-relaxed text-gray-400 italic">
              삭제된 댓글입니다.
            </p>
          ) : (
            <p className="mt-0.5 text-[13px] leading-relaxed text-sub">{comment.content}</p>
          )}

          {/* 삭제된 댓글에는 좋아요·답글 달기 버튼을 표시하지 않는다 */}
          {!isDeleted && (
            <div className="flex items-center gap-3 mt-1.5">
              {/* Like */}
              <button
                type="button"
                onClick={handleLikeToggle}
                disabled={!isAuthenticated}
                className="flex items-center gap-1 text-xs text-muted hover:text-red-500 transition-colors disabled:opacity-40"
                aria-label={comment.likedByMe ? '좋아요 취소' : '좋아요'}
              >
                <Heart
                  size={12}
                  className={comment.likedByMe ? 'fill-red-500 text-red-500' : ''}
                />
                {comment.likeCount > 0 && <span>{comment.likeCount}</span>}
              </button>

              {/* 답글 달기 (최상위 댓글만) */}
              {!isReply && isAuthenticated && (
                <button
                  type="button"
                  onClick={() => setShowReplyInput((v) => !v)}
                  className="text-xs text-muted hover:text-accent transition-colors"
                >
                  답글 달기
                </button>
              )}
            </div>
          )}

          {/* 대댓글 N개 보기 (최상위 댓글만 — 삭제 여부와 무관하게 대댓글은 표시) */}
          {!isReply && comment.replyCount > 0 && (
            <button
              type="button"
              onClick={() => setShowReplies((v) => !v)}
              className="mt-2 text-xs font-medium text-accent hover:underline"
            >
              {showReplies
                ? '대댓글 숨기기'
                : `대댓글 ${comment.replyCount}개 보기`}
            </button>
          )}
        </div>
      </div>

      {/* Reply input */}
      {showReplyInput && (
        <form
          onSubmit={handleReplySubmit}
          className="pl-9 pr-2 pb-2 flex items-center gap-2"
        >
          <input
            type="text"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="답글을 입력하세요"
            maxLength={1000}
            autoFocus
            className="flex-1 rounded-full border border-gray-100 bg-gray-50 px-3 py-1.5 text-xs text-gray-900 placeholder:text-gray-300 focus:border-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-200"
          />
          <button
            type="button"
            onClick={() => {
              setShowReplyInput(false);
              setReplyText('');
            }}
            className="text-xs text-muted hover:text-foreground whitespace-nowrap"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={!replyText.trim() || createReply.isPending}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-white disabled:opacity-40 transition-colors"
            aria-label="답글 등록"
          >
            <Send size={12} />
          </button>
        </form>
      )}

      {/* Replies */}
      {!isReply && showReplies && renderReplies && (
        <div className="ml-5 border-l-2 border-gray-100 pl-3">
          {renderReplies(comment.id)}
        </div>
      )}
    </div>
  );
}
