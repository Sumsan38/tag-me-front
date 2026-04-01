'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';

import { useDiary, useDeleteDiary } from '@/hooks/useDiary';
import { ROUTES } from '@/constants/routes';
import { MOOD_EMOJIS, MOOD_LABELS } from '@/constants/diary';
import { TAG_PALETTE_CLASSES } from '@/constants/tag';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function DiaryDetailPage() {
  const router = useRouter();
  const params = useParams();
  const diaryId = params.id ? Number(params.id) : null;

  const { data: diary, isLoading, isError } = useDiary(diaryId);
  const deleteDiary = useDeleteDiary();

  const [menuOpen, setMenuOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // ---- 메뉴 외부 클릭 시 닫기 ----
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

  // ---- 삭제 핸들러 ----
  function handleDelete() {
    if (diaryId) {
      deleteDiary.mutate(diaryId, {
        onSuccess: () => router.replace(ROUTES.DIARY),
      });
    }
  }

  // ---- 에러 ----
  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push(ROUTES.DIARY)}
              className="rounded-full p-1 hover:bg-gray-100 transition-colors"
              aria-label="뒤로 가기"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <h1 className="text-base font-semibold text-gray-900">일기</h1>
          </div>
        </header>
        <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
          <p className="text-3xl">😥</p>
          <p className="text-sm text-gray-400">일기를 불러올 수 없어요</p>
          <button
            type="button"
            onClick={() => router.push(ROUTES.DIARY)}
            className="mt-2 text-sm font-medium text-indigo-500 hover:text-indigo-600"
          >
            목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  // ---- 로딩 ----
  if (isLoading || !diary) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push(ROUTES.DIARY)}
              className="rounded-full p-1 hover:bg-gray-100 transition-colors"
              aria-label="뒤로 가기"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <h1 className="text-base font-semibold text-gray-900">일기</h1>
          </div>
        </header>
        <div className="px-5 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-4 w-32 rounded bg-gray-200" />
            <div className="h-6 w-48 rounded bg-gray-200" />
            <div className="h-40 w-full rounded-xl bg-gray-100" />
          </div>
        </div>
      </div>
    );
  }

  const moodEmoji = MOOD_EMOJIS[(diary.mood || 1) - 1] ?? MOOD_EMOJIS[2];
  const moodLabel = MOOD_LABELS[(diary.mood || 1) - 1] ?? MOOD_LABELS[2];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white px-5 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push(ROUTES.DIARY)}
              className="rounded-full p-1 hover:bg-gray-100 transition-colors"
              aria-label="뒤로 가기"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <h1 className="text-base font-semibold text-gray-900">일기</h1>
          </div>

          {/* Menu */}
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
                    router.push(ROUTES.DIARY_EDIT(String(diaryId)));
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
        </div>
      </header>

      {/* Body */}
      <div className="px-5 py-5 space-y-4">
        {/* Date + Mood */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">
            {format(parseISO(diary.date), 'yyyy. MM. dd')}
          </span>
          <span className="flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs">
            <span>{moodEmoji}</span>
            <span className="text-gray-500">{moodLabel}</span>
          </span>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-gray-900">{diary.title}</h2>

        {/* Content Card */}
        <div className="rounded-xl border border-gray-100 bg-white p-4">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
            {diary.content}
          </p>
        </div>

        {/* Tags */}
        {diary.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {diary.tags.map((tag, index) => {
              const palette = TAG_PALETTE_CLASSES[index % TAG_PALETTE_CLASSES.length];
              return (
                <span
                  key={tag.id}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium ${palette.bg} ${palette.fg}`}
                >
                  #{tag.name}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="mx-5 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-base font-semibold text-gray-900">
              이 일기를 삭제할까요?
            </h3>
            <p className="mt-1.5 text-sm text-gray-500">
              삭제된 일기는 복구할 수 없습니다.
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
                disabled={deleteDiary.isPending}
                className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50 transition-colors"
              >
                {deleteDiary.isPending ? '삭제 중...' : '삭제'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
