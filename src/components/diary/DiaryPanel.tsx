'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, parseISO } from 'date-fns';
import { Pencil, Trash2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

import { useDiary, useUpdateDiary, useDeleteDiary, diaryKeys } from '@/hooks/useDiary';
import TagInput from '@/components/tag/TagInput';
import { MOOD_EMOJIS, MOOD_LABELS } from '@/constants/diary';
import { TAG_PALETTE_CLASSES, TAG_SUGGESTIONS } from '@/constants/tag';

// ---------------------------------------------------------------------------
// zod 스키마
// ---------------------------------------------------------------------------

const diarySchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요.').max(255),
  content: z.string().min(1, '내용을 입력해주세요.').max(10000),
  mood: z.number().min(1, '기분을 선택해주세요.').max(5),
});

type DiaryFormValues = z.infer<typeof diarySchema>;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

type PanelMode = 'view' | 'edit';

interface DiaryPanelProps {
  diaryId: number;
  /** 삭제/수정 성공 시 패널 초기화 콜백 */
  onClose: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function DiaryPanel({ diaryId, onClose }: DiaryPanelProps) {
  const { data: diary, isLoading, isError } = useDiary(diaryId);
  const updateDiary = useUpdateDiary();
  const deleteDiary = useDeleteDiary();
  const queryClient = useQueryClient();

  const [mode, setMode] = useState<PanelMode>('view');
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [tags, setTags] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<DiaryFormValues>({
    resolver: zodResolver(diarySchema),
    defaultValues: { title: '', content: '', mood: 0 },
  });

  // diaryId 변경 시 view 모드로 복귀
  useEffect(() => {
    setMode('view');
    setDeleteConfirm(false);
  }, [diaryId]);

  // 수정 모드 진입 시 폼 초기화
  useEffect(() => {
    if (mode === 'edit' && diary) {
      reset({ title: diary.title, content: diary.content, mood: diary.mood });
      setTags(diary.tags.map((t) => t.name));
    }
  }, [mode, diary, reset]);

  const selectedMood = watch('mood');
  const contentValue = watch('content');

  // ---- 수정 저장 ----
  function onSubmitEdit(data: DiaryFormValues) {
    updateDiary.mutate(
      {
        id: diaryId,
        data: {
          title: data.title,
          content: data.content,
          mood: data.mood,
          diaryDate: diary!.date,
          tagNames: tags.length > 0 ? tags : undefined,
        },
      },
      {
        onSuccess: () => {
          setMode('view');
          // 패널 내에서 처리하므로 라우트 이동 안 함 — 캐시만 갱신
          queryClient.invalidateQueries({ queryKey: diaryKeys.detail(diaryId) });
          queryClient.invalidateQueries({ queryKey: diaryKeys.all });
        },
      },
    );
  }

  // ---- 삭제 ----
  function handleDelete() {
    deleteDiary.mutate(diaryId, {
      onSuccess: () => {
        queryClient.removeQueries({ queryKey: diaryKeys.detail(diaryId) });
        queryClient.invalidateQueries({ queryKey: diaryKeys.all });
        onClose();
      },
    });
  }

  // ---- 로딩 ----
  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-100 bg-white p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-32 rounded bg-gray-200" />
          <div className="h-6 w-48 rounded bg-gray-200" />
          <div className="h-40 w-full rounded-xl bg-gray-100" />
        </div>
      </div>
    );
  }

  // ---- 에러 ----
  if (isError || !diary) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
        <p className="text-3xl">😥</p>
        <p className="text-sm text-gray-400">일기를 불러올 수 없어요</p>
        <button
          type="button"
          onClick={onClose}
          className="mt-2 text-sm font-medium text-indigo-500 hover:text-indigo-600"
        >
          돌아가기
        </button>
      </div>
    );
  }

  // =====================================================================
  // 수정 모드
  // =====================================================================
  if (mode === 'edit') {
    return (
      <div className="rounded-xl border border-gray-100 bg-white">
        {/* 수정 헤더 */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
          <h3 className="text-sm font-semibold text-gray-900">일기 수정</h3>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMode('view')}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleSubmit(onSubmitEdit)}
              disabled={updateDiary.isPending}
              className="rounded-lg bg-gray-900 px-4 py-1.5 text-xs font-medium text-white hover:bg-gray-800 disabled:opacity-50 transition-colors"
            >
              {updateDiary.isPending ? '저장 중...' : '저장'}
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmitEdit)} className="p-5 space-y-4">
          {/* Title */}
          <div>
            <label htmlFor="panel-title" className="text-[11px] font-semibold tracking-widest text-gray-400 uppercase">
              제목
            </label>
            <input
              id="panel-title"
              type="text"
              {...register('title')}
              className="mt-1.5 w-full rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-300 focus:border-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-200"
              placeholder="제목을 입력하세요"
            />
            {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
          </div>

          {/* Mood */}
          <div>
            <label id="panel-mood-label" className="text-[11px] font-semibold tracking-widest text-gray-400 uppercase">
              오늘의 기분
            </label>
            <div className="mt-2 flex gap-2" role="radiogroup" aria-labelledby="panel-mood-label">
              {MOOD_EMOJIS.map((emoji, idx) => {
                const moodValue = idx + 1;
                const isSelected = selectedMood === moodValue;
                return (
                  <button
                    key={moodValue}
                    type="button"
                    onClick={() => setValue('mood', moodValue, { shouldValidate: true })}
                    className={`flex flex-1 flex-col items-center gap-1 rounded-xl border-2 py-2.5 transition-colors ${
                      isSelected
                        ? 'border-indigo-400 bg-indigo-50'
                        : 'border-gray-100 bg-white hover:border-gray-200'
                    }`}
                  >
                    <span className="text-lg">{emoji}</span>
                    <span className={`text-[10px] font-medium ${isSelected ? 'text-indigo-600' : 'text-gray-400'}`}>
                      {MOOD_LABELS[idx]}
                    </span>
                  </button>
                );
              })}
            </div>
            {errors.mood && <p className="mt-1 text-xs text-red-500">{errors.mood.message}</p>}
          </div>

          {/* Content */}
          <div>
            <label htmlFor="panel-content" className="text-[11px] font-semibold tracking-widest text-gray-400 uppercase">
              내용
            </label>
            <div className="relative mt-1.5">
              <textarea
                id="panel-content"
                {...register('content')}
                rows={6}
                className="w-full resize-none rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm leading-relaxed text-gray-900 placeholder:text-gray-300 focus:border-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-200"
                style={{ minHeight: 140 }}
                placeholder="오늘 하루를 기록해보세요"
              />
              <span className="absolute bottom-3 right-4 text-[11px] text-gray-300">
                {contentValue?.length ?? 0} / 10,000
              </span>
            </div>
            {errors.content && <p className="mt-1 text-xs text-red-500">{errors.content.message}</p>}
          </div>

          {/* Tags */}
          <div>
            <label htmlFor="panel-tags" className="text-[11px] font-semibold tracking-widest text-gray-400 uppercase">
              태그
            </label>
            <div className="mt-1.5">
              <TagInput id="panel-tags" tags={tags} onChange={setTags} suggestions={[...TAG_SUGGESTIONS]} />
            </div>
          </div>
        </form>
      </div>
    );
  }

  // =====================================================================
  // 조회 모드
  // =====================================================================
  const moodEmoji = MOOD_EMOJIS[(diary.mood || 1) - 1] ?? MOOD_EMOJIS[2];
  const moodLabel = MOOD_LABELS[(diary.mood || 1) - 1] ?? MOOD_LABELS[2];

  return (
    <div className="rounded-xl border border-gray-100 bg-white">
      {/* 헤더: 날짜 + 기분 + 수정/삭제 버튼 */}
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">
            {format(parseISO(diary.date), 'yyyy. MM. dd')}
          </span>
          <span className="flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs">
            <span>{moodEmoji}</span>
            <span className="text-gray-500">{moodLabel}</span>
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setMode('edit')}
            className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Pencil size={13} />
            수정
          </button>
          <button
            type="button"
            onClick={() => setDeleteConfirm(true)}
            className="flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 transition-colors"
          >
            <Trash2 size={13} />
            삭제
          </button>
        </div>
      </div>

      {/* 본문 */}
      <div className="p-5 space-y-4">
        <h2 className="text-lg font-bold text-gray-900">{diary.title}</h2>

        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
            {diary.content}
          </p>
        </div>

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

      {/* 삭제 확인 */}
      {deleteConfirm && (
        <div className="border-t border-gray-100 p-5">
          <p className="text-sm font-semibold text-gray-900">이 일기를 삭제할까요?</p>
          <p className="mt-1 text-xs text-gray-400">삭제된 일기는 복구할 수 없습니다.</p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => setDeleteConfirm(false)}
              className="flex-1 rounded-xl border border-gray-200 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleteDiary.isPending}
              className="flex-1 rounded-xl bg-red-500 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50 transition-colors"
            >
              {deleteDiary.isPending ? '삭제 중...' : '삭제'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
