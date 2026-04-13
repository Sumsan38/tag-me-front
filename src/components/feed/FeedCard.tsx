'use client';

import Link from 'next/link';
import { Heart, MessageCircle } from 'lucide-react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';

import Avatar from '@/components/common/Avatar';
import Badge from '@/components/common/Badge';
import type { FeedResponse } from '@/types/feed';
import { useAuthStore, selectIsAuthenticated } from '@/stores/authStore';
import { useLikeFeed, useUnlikeFeed } from '@/hooks/useFeed';
import { ROUTES } from '@/constants/routes';

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

  const displayName = feed.authorNickname || '탈퇴한 사용자';
  const avatarInitial = feed.authorNickname
    ? feed.authorNickname[0].toUpperCase()
    : '?';

  const relativeTime = formatDistanceToNow(parseISO(feed.createdAt), {
    addSuffix: true,
    locale: ko,
  });

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

  return (
    <article className="px-4 pt-4 pb-3">
      {/* ── 헤더: 아바타 + 닉네임 + 시간 ─────────────────── */}
      <div className="flex items-center gap-2.5 mb-2.5">
        <Link href={ROUTES.FEED_DETAIL(String(feed.id))} className="shrink-0">
          <Avatar initials={avatarInitial} size="md" />
        </Link>
        <div className="flex-1 min-w-0 flex items-center justify-between">
          <span className="text-[13px] font-bold text-gray-900 truncate">
            {displayName}
          </span>
          <span className="text-[11px] text-gray-400 shrink-0 ml-2">
            {relativeTime}
          </span>
        </div>
      </div>

      {/* ── 컨텐츠 ────────────────────────────────────────── */}
      <div className="min-w-0">
        <Link href={ROUTES.FEED_DETAIL(String(feed.id))} className="block">
          <p className="text-[14px] leading-[1.6] text-gray-800 line-clamp-4 mb-2.5">
            {feed.content}
          </p>

          {/* Images */}
          {feed.imageUrls.length > 0 && (
            <div
              className={[
                'mb-2.5 rounded-2xl overflow-hidden border border-gray-100',
                feed.imageUrls.length === 1
                  ? 'grid grid-cols-1'
                  : feed.imageUrls.length === 2
                    ? 'grid grid-cols-2 gap-0.5'
                    : 'grid grid-cols-3 gap-0.5',
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
            <div className="flex flex-wrap gap-1.5 mb-2.5" role="list">
              {feed.tags.map((tag, index) => (
                <Badge key={tag.id} variant="tag" label={tag.name} idx={index} sm />
              ))}
            </div>
          )}
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleToggleLike}
            disabled={isLikeLoading}
            className={[
              'flex items-center gap-1.5 text-[12px] transition-colors',
              feed.likedByMe
                ? 'text-rose-500'
                : 'text-gray-400 hover:text-rose-400',
            ].join(' ')}
            aria-label={feed.likedByMe ? '좋아요 취소' : '좋아요'}
          >
            <Heart
              size={15}
              fill={feed.likedByMe ? 'currentColor' : 'none'}
              strokeWidth={feed.likedByMe ? 0 : 2}
            />
            <span className="tabular-nums">{feed.likeCount}</span>
          </button>

          <Link
            href={ROUTES.FEED_DETAIL(String(feed.id))}
            className="flex items-center gap-1.5 text-[12px] text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="댓글"
          >
            <MessageCircle size={15} strokeWidth={2} />
            <span className="tabular-nums">{feed.commentCount}</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
