'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Heart, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';

import Avatar from '@/components/common/Avatar';
import Badge from '@/components/common/Badge';
import CommentList from '@/components/feed/CommentList';
import ImageCarousel from '@/components/feed/ImageCarousel';
import { useFeed, useDeleteFeed, useLikeFeed, useUnlikeFeed } from '@/hooks/useFeed';
import { useAuthStore, selectIsAuthenticated } from '@/stores/authStore';
import { ROUTES } from '@/constants/routes';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function FeedDetailPage() {
  const router = useRouter();
  const params = useParams();
  const rawId = params.id ? Number(params.id) : null;
  const feedId = rawId !== null && Number.isFinite(rawId) ? rawId : null;
  const isInvalidId = params.id != null && feedId === null;

  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const currentUserId = useAuthStore((s) => s.user?.id ?? null);

  const { data: feed, isLoading, isError } = useFeed(feedId);
  const deleteFeed = useDeleteFeed();
  const likeFeed = useLikeFeed();
  const unlikeFeed = useUnlikeFeed();
  const isLikeLoading = likeFeed.isPending || unlikeFeed.isPending;

  const [menuOpen, setMenuOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isOwner = currentUserId != null && feed?.userId === currentUserId;

  // ---- Menu outside click ----
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  // ---- Like toggle ----
  function handleToggleLike() {
    if (!isAuthenticated || !feedId || isLikeLoading) return;
    if (feed?.likedByMe) {
      unlikeFeed.mutate(feedId);
    } else {
      likeFeed.mutate(feedId);
    }
  }

  // ---- Delete handler ----
  function handleDelete() {
    if (feedId) {
      deleteFeed.mutate(feedId, {
        onSuccess: () => router.replace(ROUTES.FEED),
      });
    }
  }

  // ---- Invalid ID or Error ----
  if (isInvalidId || isError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push(ROUTES.FEED)}
              className="rounded-full p-1 hover:bg-gray-100 transition-colors"
              aria-label="뒤로 가기"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <h1 className="text-base font-semibold text-gray-900">게시글</h1>
          </div>
        </header>
        <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
          <p className="text-3xl">😥</p>
          <p className="text-sm text-gray-400">게시글을 불러올 수 없어요</p>
          <button
            type="button"
            onClick={() => router.push(ROUTES.FEED)}
            className="mt-2 text-sm font-medium text-indigo-500 hover:text-indigo-600"
          >
            피드로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  // ---- Loading ----
  if (isLoading || !feed) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push(ROUTES.FEED)}
              className="rounded-full p-1 hover:bg-gray-100 transition-colors"
              aria-label="뒤로 가기"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <h1 className="text-base font-semibold text-gray-900">게시글</h1>
          </div>
        </header>
        <div className="px-5 py-8">
          <div className="animate-pulse space-y-4">
            <div className="flex gap-3">
              <div className="h-10 w-10 rounded-full bg-gray-200" />
              <div className="space-y-2">
                <div className="h-3 w-24 rounded bg-gray-200" />
                <div className="h-3 w-16 rounded bg-gray-200" />
              </div>
            </div>
            <div className="h-32 w-full rounded-xl bg-gray-100" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      {/* 콘텐츠 최대 너비 제한 */}
      <div className="max-w-xl mx-auto">
      {/* Header */}
      <header className="bg-white px-5 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push(ROUTES.FEED)}
              className="rounded-full p-1 hover:bg-gray-100 transition-colors"
              aria-label="뒤로 가기"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <h1 className="text-base font-semibold text-gray-900">게시글</h1>
          </div>

          {/* Owner menu */}
          {isOwner && (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="rounded-full p-1.5 hover:bg-gray-100 transition-colors"
                aria-label="메뉴"
              >
                <MoreVertical size={18} className="text-gray-500" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full mt-1 z-10 w-32 rounded-xl border border-gray-100 bg-white py-1 shadow-lg">
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      router.push(ROUTES.FEED_EDIT(String(feedId)));
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Pencil size={14} />
                    수정
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      setDeleteModalOpen(true);
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-gray-50"
                  >
                    <Trash2 size={14} />
                    삭제
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Body */}
      <div className="bg-white">
        <div className="px-5 py-4">
          {/* Author */}
          <div className="flex items-center gap-2.5 mb-3">
            <Avatar initials={feed.authorNickname ? feed.authorNickname[0].toUpperCase() : '?'} size="lg" />
            <div>
              <span className="text-sm font-semibold text-gray-900">
                {feed.authorNickname || '탈퇴한 사용자'}
              </span>
              <p className="text-xs text-gray-400">
                {format(parseISO(feed.createdAt), 'yyyy. MM. dd  HH:mm', {
                  locale: ko,
                })}
              </p>
            </div>
          </div>

          {/* Content */}
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700 mb-4">
            {feed.content}
          </p>

          {/* Images */}
          {feed.imageUrls.length > 0 && (
            <ImageCarousel urls={feed.imageUrls} />
          )}

          {/* Tags */}
          {feed.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4" role="list">
              {feed.tags.map((tag, index) => (
                <Badge
                  key={tag.id}
                  variant="tag"
                  label={tag.name}
                  idx={index}
                />
              ))}
            </div>
          )}

          {/* Like button */}
          <div className="flex items-center gap-4 pt-2 border-t border-gray-50">
            <button
              type="button"
              onClick={handleToggleLike}
              disabled={!isAuthenticated || isLikeLoading}
              className={[
                'flex items-center gap-1.5 py-2 text-sm font-medium transition-colors',
                feed.likedByMe
                  ? 'text-red-500'
                  : 'text-gray-400 hover:text-red-500',
              ].join(' ')}
              aria-label={feed.likedByMe ? '좋아요 취소' : '좋아요'}
            >
              <Heart
                size={18}
                fill={feed.likedByMe ? 'currentColor' : 'none'}
              />
              <span>좋아요 {feed.likeCount}</span>
            </button>
            <span className="text-sm text-gray-400">
              댓글 {feed.commentCount}
            </span>
          </div>
        </div>
      </div>

      {/* Comments */}
      <div className="mt-2 bg-white">
        <div className="px-5 py-3 border-b border-gray-50">
          <span className="text-[11px] font-semibold tracking-widest text-gray-400 uppercase">
            댓글
          </span>
        </div>
        <CommentList feedId={feedId!} />
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="mx-5 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-base font-semibold text-gray-900">
              이 게시글을 삭제할까요?
            </h3>
            <p className="mt-1.5 text-sm text-gray-500">
              삭제된 게시글은 복구할 수 없습니다.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleteFeed.isPending}
                className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50 transition-colors"
              >
                {deleteFeed.isPending ? '삭제 중...' : '삭제'}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>{/* max-w-xl */}
    </div>
  );
}
