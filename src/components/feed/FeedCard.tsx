'use client';

import { Heart, MessageCircle } from 'lucide-react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';

import Avatar from '@/components/common/Avatar';
import Badge from '@/components/common/Badge';
import type { FeedResponse } from '@/types/feed';
import { useAuthStore, selectIsAuthenticated } from '@/stores/authStore';
import { useLikeFeed, useUnlikeFeed } from '@/hooks/useFeed';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface FeedCardProps {
  feed: FeedResponse;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function FeedCard({ feed }: FeedCardProps) {
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const likeFeed = useLikeFeed();
  const unlikeFeed = useUnlikeFeed();
  const isLikeLoading = likeFeed.isPending || unlikeFeed.isPending;

  function handleToggleLike(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated || isLikeLoading) return;

    if (feed.likedByMe) {
      unlikeFeed.mutate(feed.id);
    } else {
      likeFeed.mutate(feed.id);
    }
  }

  const relativeTime = formatDistanceToNow(parseISO(feed.createdAt), {
    addSuffix: true,
    locale: ko,
  });

  return (
    <article className="px-5 py-4">
      {/* Header: Avatar + Nickname + Time */}
      <div className="flex gap-2.5 mb-2.5">
        <Avatar
          initials={`U${feed.userId}`}
          size="md"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between">
            <span className="text-[13px] font-semibold text-foreground truncate">
              사용자 {feed.userId}
            </span>
            <span className="text-[11px] text-muted shrink-0 ml-2">
              {relativeTime}
            </span>
          </div>

          {/* Content preview (3 lines) */}
          <p className="mt-1.5 text-[13px] leading-relaxed text-sub line-clamp-3">
            {feed.content}
          </p>
        </div>
      </div>

      {/* Images (grid) */}
      {feed.imageUrls.length > 0 && (
        <div
          className={[
            'ml-[42px] mb-2.5 rounded-xl overflow-hidden',
            feed.imageUrls.length === 1
              ? 'grid grid-cols-1'
              : feed.imageUrls.length === 2
                ? 'grid grid-cols-2 gap-1'
                : 'grid grid-cols-3 gap-1',
          ].join(' ')}
        >
          {feed.imageUrls.slice(0, 3).map((url, i) => (
            <div
              key={url}
              className="relative bg-gray-100 aspect-square overflow-hidden"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`이미지 ${i + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              {i === 2 && feed.imageUrls.length > 3 && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    +{feed.imageUrls.length - 3}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tags */}
      {feed.tags.length > 0 && (
        <div className="ml-[42px] mb-2.5 flex flex-wrap gap-1.5" role="list">
          {feed.tags.map((tag, index) => (
            <Badge key={tag.id} variant="tag" label={tag.name} idx={index} sm />
          ))}
        </div>
      )}

      {/* Actions: Like + Comment */}
      <div className="ml-[42px] flex items-center gap-4">
        <button
          type="button"
          onClick={handleToggleLike}
          disabled={isLikeLoading}
          className={[
            'flex items-center gap-1 text-xs transition-colors',
            feed.likedByMe
              ? 'text-error'
              : 'text-muted hover:text-error',
          ].join(' ')}
          aria-label={feed.likedByMe ? '좋아요 취소' : '좋아요'}
        >
          <Heart
            size={14}
            fill={feed.likedByMe ? 'currentColor' : 'none'}
          />
          <span>{feed.likeCount}</span>
        </button>

        <span
          className="flex items-center gap-1 text-xs text-muted"
          aria-label="댓글"
        >
          <MessageCircle size={14} />
          <span>{feed.commentCount}</span>
        </span>
      </div>
    </article>
  );
}
