'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import TagInput from '@/components/tag/TagInput';
import { useCreateDiary } from '@/hooks/useDiary';
import { MOOD_EMOJIS, MOOD_LABELS } from '@/constants/diary';
import { TAG_SUGGESTIONS } from '@/constants/tag';

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

interface DiaryCreatePanelProps {
  /** 선택된 날짜 (제목 기본값) */
  defaultDate?: string;
  /** 작성 성공 시 생성된 일기 ID 전달 */
  onCreated: (diaryId: number) => void;
  /** 취소 시 패널 닫기 */
  onCancel: () => void;
}

// ---------------------------------------------------------------------------
// 헬퍼
// ---------------------------------------------------------------------------

function getTodayString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function DiaryCreatePanel({ defaultDate, onCreated, onCancel }: DiaryCreatePanelProps) {
  const createDiary = useCreateDiary();
  const [tags, setTags] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DiaryFormValues>({
    resolver: zodResolver(diarySchema),
    defaultValues: {
      title: defaultDate ?? getTodayString(),
      content: '',
      mood: 0,
    },
  });

  const selectedMood = watch('mood');
  const contentValue = watch('content');

  function onSubmit(data: DiaryFormValues) {
    createDiary.mutate(
      {
        title: data.title,
        content: data.content,
        mood: data.mood,
        diaryDate: defaultDate ?? getTodayString(),
        tagNames: tags.length > 0 ? tags : undefined,
      },
      {
        onSuccess: (response) => {
          onCreated(response.diaryId);
        },
      },
    );
  }

  return (
    <div className="rounded-xl border border-gray-100 bg-white">
      {/* 헤더 */}
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
        <h3 className="text-sm font-semibold text-gray-900">새 일기 작성</h3>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={createDiary.isPending}
            className="rounded-lg bg-gray-900 px-4 py-1.5 text-xs font-medium text-white hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            {createDiary.isPending ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
        {/* Title */}
        <div>
          <label htmlFor="create-panel-title" className="text-[11px] font-semibold tracking-widest text-gray-400 uppercase">
            제목
          </label>
          <input
            id="create-panel-title"
            type="text"
            {...register('title')}
            className="mt-1.5 w-full rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-300 focus:border-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-200"
            placeholder="제목을 입력하세요"
          />
          {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
        </div>

        {/* Mood */}
        <div>
          <label id="create-panel-mood-label" className="text-[11px] font-semibold tracking-widest text-gray-400 uppercase">
            오늘의 기분
          </label>
          <div className="mt-2 flex gap-2" role="radiogroup" aria-labelledby="create-panel-mood-label">
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
          <label htmlFor="create-panel-content" className="text-[11px] font-semibold tracking-widest text-gray-400 uppercase">
            내용
          </label>
          <div className="relative mt-1.5">
            <textarea
              id="create-panel-content"
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
          <label htmlFor="create-panel-tags" className="text-[11px] font-semibold tracking-widest text-gray-400 uppercase">
            태그
          </label>
          <div className="mt-1.5">
            <TagInput id="create-panel-tags" tags={tags} onChange={setTags} suggestions={[...TAG_SUGGESTIONS]} />
          </div>
        </div>
      </form>
    </div>
  );
}
