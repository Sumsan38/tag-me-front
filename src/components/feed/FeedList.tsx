'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { PenLine } from 'lucide-react';
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

  // ---- Infinite scroll ----
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

  function handleTabChange(next: FeedTab) {
    if (next === 'following' && !isAuthenticated) return;
    setTab(next);
  }

  return (
    <div className="min-h-screen bg-white">
      {/* ── 탭 헤더 (Instagram 스타일) ───────────────────── */}
      <div className="bg-white border-b border-gray-100 sticky top-14 z-10">
        <div className="flex">
          {(['public', 'following'] as FeedTab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => handleTabChange(t)}
              disabled={t === 'following' && !isAuthenticated}
              className={[
                'relative flex-1 py-3 text-[13px] font-semibold transition-colors',
                tab === t ? 'text-gray-900' : 'text-gray-400',
                t === 'following' && !isAuthenticated ? 'opacity-40 cursor-not-allowed' : '',
              ].join(' ')}
            >
              {t === 'public' ? '전체' : '팔로잉'}
              {/* 하단 인디케이터 */}
              {tab === t && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-8 bg-gray-900 rounded-t-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── 피드 목록 ─────────────────────────────────────── */}
      <div>
        {feeds.map((feed, index) => (
          <div key={feed.id}>
            <FeedCard feed={feed} />
            {index < feeds.length - 1 && (
              <div className="mx-4 h-px bg-gray-100" />
            )}
          </div>
        ))}
      </div>

      {/* ── 로딩 ──────────────────────────────────────────── */}
      {activeQuery.isLoading && (
        <div className="flex justify-center py-12">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-200 border-t-gray-600" />
        </div>
      )}
      {activeQuery.isFetchingNextPage && (
        <div className="flex justify-center py-6">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-200 border-t-gray-600" />
        </div>
      )}

      {/* ── 빈 상태 ───────────────────────────────────────── */}
      {!activeQuery.isLoading && feeds.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-2 py-24 text-center">
          <p className="text-4xl">{tab === 'following' ? '👀' : '📝'}</p>
          <p className="mt-1 text-[13px] text-gray-400">
            {tab === 'following'
              ? '팔로잉한 사용자의 게시글이 없습니다'
              : '아직 게시글이 없습니다'}
          </p>
          {isAuthenticated && (
            <Link
              href={ROUTES.FEED_WRITE}
              className="mt-2 text-[13px] font-semibold text-gray-900 hover:underline"
            >
              첫 게시글을 작성해보세요
            </Link>
          )}
        </div>
      )}

      {/* ── Infinite scroll sentinel ──────────────────────── */}
      <div ref={sentinelRef} className="h-1" />

      {/* ── 플로팅 작성 버튼 (Threads 스타일 — 연필 아이콘) ─ */}
      {isAuthenticated && (
        <Link
          href={ROUTES.FEED_WRITE}
          className="fixed bottom-20 right-5 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-gray-900 text-white shadow-xl hover:bg-gray-700 transition-colors"
          aria-label="게시글 작성"
        >
          <PenLine size={20} />
        </Link>
      )}
    </div>
  );
}
