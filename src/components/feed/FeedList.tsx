'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { Plus } from 'lucide-react';
import Link from 'next/link';

import FeedCard from '@/components/feed/FeedCard';
import { useFeeds, useFollowingFeeds } from '@/hooks/useFeed';
import { useAuthStore, selectIsAuthenticated } from '@/stores/authStore';
import { ROUTES } from '@/constants/routes';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type FeedTab = 'public' | 'following';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function FeedList() {
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const [tab, setTab] = useState<FeedTab>('public');

  const publicQuery = useFeeds();
  const followingQuery = useFollowingFeeds(isAuthenticated && tab === 'following');

  const activeQuery = tab === 'following' ? followingQuery : publicQuery;
  const feeds = activeQuery.data?.pages.flatMap((page) => page.items) ?? [];

  // ---- Infinite scroll with IntersectionObserver ----
  const sentinelRef = useRef<HTMLDivElement>(null);

  const handleIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (
        entry.isIntersecting &&
        activeQuery.hasNextPage &&
        !activeQuery.isFetchingNextPage
      ) {
        activeQuery.fetchNextPage();
      }
    },
    [activeQuery],
  );

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(handleIntersect, {
      rootMargin: '200px',
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [handleIntersect]);

  // ---- Tab switch resets to public if not authed ----
  function handleTabChange(next: FeedTab) {
    if (next === 'following' && !isAuthenticated) return;
    setTab(next);
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Tab Header */}
      <div className="bg-surface border-b border-border sticky top-0 z-10">
        <div className="flex">
          <button
            type="button"
            onClick={() => handleTabChange('public')}
            className={[
              'flex-1 py-2.5 text-[13px] font-semibold transition-colors',
              tab === 'public'
                ? 'text-foreground border-b-2 border-foreground'
                : 'text-muted border-b-2 border-transparent',
            ].join(' ')}
          >
            전체
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('following')}
            disabled={!isAuthenticated}
            className={[
              'flex-1 py-2.5 text-[13px] font-semibold transition-colors',
              tab === 'following'
                ? 'text-foreground border-b-2 border-foreground'
                : 'text-muted border-b-2 border-transparent',
              !isAuthenticated ? 'opacity-40 cursor-not-allowed' : '',
            ].join(' ')}
          >
            팔로잉
          </button>
        </div>
      </div>

      {/* Feed items */}
      <div className="divide-y divide-border">
        {feeds.map((feed) => (
          <Link
            key={feed.id}
            href={ROUTES.FEED_DETAIL(String(feed.id))}
            className="block hover:bg-gray-50/50 transition-colors"
          >
            <FeedCard feed={feed} />
          </Link>
        ))}
      </div>

      {/* Loading / Empty states */}
      {activeQuery.isLoading && (
        <div className="flex justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-accent" />
        </div>
      )}

      {activeQuery.isFetchingNextPage && (
        <div className="flex justify-center py-6">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-200 border-t-accent" />
        </div>
      )}

      {!activeQuery.isLoading && feeds.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
          <p className="text-3xl">
            {tab === 'following' ? '👀' : '📝'}
          </p>
          <p className="text-sm text-muted">
            {tab === 'following'
              ? '팔로잉한 사용자의 게시글이 없습니다'
              : '아직 게시글이 없습니다'}
          </p>
          {isAuthenticated && (
            <Link
              href={ROUTES.FEED_WRITE}
              className="mt-2 text-sm font-medium text-accent hover:underline"
            >
              첫 게시글을 작성해보세요
            </Link>
          )}
        </div>
      )}

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} className="h-1" />

      {/* Floating write button */}
      {isAuthenticated && (
        <Link
          href={ROUTES.FEED_WRITE}
          className="fixed bottom-20 right-5 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-accent text-white shadow-lg hover:bg-accent/90 transition-colors"
          aria-label="게시글 작성"
        >
          <Plus size={22} />
        </Link>
      )}
    </div>
  );
}
