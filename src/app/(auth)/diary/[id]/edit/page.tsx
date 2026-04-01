'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft } from 'lucide-react';

import TagInput from '@/components/tag/TagInput';
import { useDiary, useUpdateDiary } from '@/hooks/useDiary';
import { ROUTES } from '@/constants/routes';
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
// Component
// ---------------------------------------------------------------------------

export default function DiaryEditPage() {
  const router = useRouter();
  const params = useParams();
  const diaryId = params.id ? Number(params.id) : null;

  const { data: diary, isLoading, isError } = useDiary(diaryId);
  const updateDiary = useUpdateDiary();
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
    defaultValues: {
      title: '',
      content: '',
      mood: 0,
    },
  });

  // ---- 기존 데이터로 폼 초기화 ----
  useEffect(() => {
    if (diary) {
      reset({
        title: diary.title,
        content: diary.content,
        mood: diary.mood,
      });
      setTags(diary.tags.map((t) => t.name));
    }
  }, [diary, reset]);

  const selectedMood = watch('mood');
  const contentValue = watch('content');

  function onSubmit(data: DiaryFormValues) {
    if (!diaryId) return;
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
        onSuccess: () => router.replace(ROUTES.DIARY_DETAIL(String(diaryId))),
      },
    );
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
            <h1 className="text-base font-semibold text-gray-900">일기 수정</h1>
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
              onClick={() => router.back()}
              className="rounded-full p-1 hover:bg-gray-100 transition-colors"
              aria-label="뒤로 가기"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <h1 className="text-base font-semibold text-gray-900">일기 수정</h1>
          </div>
        </header>
        <div className="px-5 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-10 w-full rounded-xl bg-gray-200" />
            <div className="h-20 w-full rounded-xl bg-gray-100" />
            <div className="h-40 w-full rounded-xl bg-gray-100" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white px-5 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.push(ROUTES.DIARY_DETAIL(String(diaryId)))}
            className="rounded-full p-1 hover:bg-gray-100 transition-colors"
            aria-label="뒤로 가기"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <h1 className="text-base font-semibold text-gray-900">일기 수정</h1>
          <button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={updateDiary.isPending}
            className="rounded-lg bg-gray-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            {updateDiary.isPending ? '저장 중...' : '저장'}
          </button>
        </div>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="px-5 py-5 space-y-5">
        {/* Title */}
        <div>
          <label htmlFor="diary-title" className="text-[11px] font-semibold tracking-widest text-gray-400 uppercase">
            제목
          </label>
          <input
            id="diary-title"
            type="text"
            {...register('title')}
            className="mt-1.5 w-full rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-300 focus:border-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-200"
            placeholder="제목을 입력하세요"
          />
          {errors.title && (
            <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>
          )}
        </div>

        {/* Mood Selector */}
        <div>
          <label id="diary-mood-label" className="text-[11px] font-semibold tracking-widest text-gray-400 uppercase">
            오늘의 기분
          </label>
          <div className="mt-2 flex gap-2" role="radiogroup" aria-labelledby="diary-mood-label">
            {MOOD_EMOJIS.map((emoji, idx) => {
              const moodValue = idx + 1;
              const isSelected = selectedMood === moodValue;
              return (
                <button
                  key={moodValue}
                  type="button"
                  onClick={() => setValue('mood', moodValue, { shouldValidate: true })}
                  className={`flex flex-1 flex-col items-center gap-1 rounded-xl border-2 py-3 transition-colors ${
                    isSelected
                      ? 'border-indigo-400 bg-indigo-50'
                      : 'border-gray-100 bg-white hover:border-gray-200'
                  }`}
                >
                  <span className="text-xl">{emoji}</span>
                  <span
                    className={`text-[10px] font-medium ${
                      isSelected ? 'text-indigo-600' : 'text-gray-400'
                    }`}
                  >
                    {MOOD_LABELS[idx]}
                  </span>
                </button>
              );
            })}
          </div>
          {errors.mood && (
            <p className="mt-1 text-xs text-red-500">{errors.mood.message}</p>
          )}
        </div>

        {/* Content */}
        <div>
          <label htmlFor="diary-content" className="text-[11px] font-semibold tracking-widest text-gray-400 uppercase">
            내용
          </label>
          <div className="relative mt-1.5">
            <textarea
              id="diary-content"
              {...register('content')}
              rows={8}
              className="w-full resize-none rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm leading-relaxed text-gray-900 placeholder:text-gray-300 focus:border-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-200"
              style={{ minHeight: 180 }}
              placeholder="오늘 하루를 기록해보세요"
            />
            <span className="absolute bottom-3 right-4 text-[11px] text-gray-300">
              {contentValue?.length ?? 0} / 10,000
            </span>
          </div>
          {errors.content && (
            <p className="mt-1 text-xs text-red-500">{errors.content.message}</p>
          )}
        </div>

        {/* Tags */}
        <div>
          <label htmlFor="diary-tags" className="text-[11px] font-semibold tracking-widest text-gray-400 uppercase">
            태그
          </label>
          <div className="mt-1.5">
            <TagInput
              id="diary-tags"
              tags={tags}
              onChange={setTags}
              suggestions={TAG_SUGGESTIONS}
            />
          </div>
        </div>
      </form>
    </div>
  );
}
