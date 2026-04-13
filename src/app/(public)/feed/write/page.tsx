'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Globe, Lock } from 'lucide-react';

import TagInput from '@/components/tag/TagInput';
import { useCreateFeed } from '@/hooks/useFeed';
import { useAuthStore, selectIsAuthenticated } from '@/stores/authStore';
import { TAG_SUGGESTIONS } from '@/constants/tag';
import { ROUTES } from '@/constants/routes';

// ---------------------------------------------------------------------------
// zod 스키마
// ---------------------------------------------------------------------------

const feedSchema = z.object({
  content: z.string().min(1, '내용을 입력해주세요.').max(10000),
});

type FeedFormValues = z.infer<typeof feedSchema>;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function FeedWritePage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const createFeed = useCreateFeed();
  const [tags, setTags] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(true);

  // ---- 인증 가드: 비로그인 시 로그인 페이지로 리다이렉트 ----
  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.replace(
        `${ROUTES.LOGIN}?redirect=${encodeURIComponent(ROUTES.FEED_WRITE)}`,
      );
    }
  }, [isAuthenticated, isHydrated, router]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FeedFormValues>({
    resolver: zodResolver(feedSchema),
    defaultValues: { content: '' },
  });

  const contentValue = watch('content');

  function onSubmit(data: FeedFormValues) {
    createFeed.mutate(
      {
        content: data.content,
        isPublic,
        tagNames: tags.length > 0 ? tags : undefined,
      },
      {
        onSuccess: (response) => {
          router.replace(ROUTES.FEED_DETAIL(String(response.feedId)));
        },
      },
    );
  }

  // hydration 전이거나 비인증 상태면 빈 화면 (flash 방지)
  if (!isHydrated || !isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white px-5 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-full p-1 hover:bg-gray-100 transition-colors"
            aria-label="뒤로 가기"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <h1 className="text-base font-semibold text-gray-900">새 게시글</h1>
          <button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={createFeed.isPending}
            className="rounded-lg bg-gray-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            {createFeed.isPending ? '등록 중...' : '등록'}
          </button>
        </div>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="px-5 py-5 space-y-5">
        {/* Content */}
        <div>
          <label
            htmlFor="feed-content"
            className="text-[11px] font-semibold tracking-widest text-gray-400 uppercase"
          >
            내용
          </label>
          <div className="relative mt-1.5">
            <textarea
              id="feed-content"
              {...register('content')}
              rows={8}
              className="w-full resize-none rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm leading-relaxed text-gray-900 placeholder:text-gray-300 focus:border-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-200"
              style={{ minHeight: 200 }}
              placeholder="오늘 나누고 싶은 이야기를 적어보세요"
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
          <label
            htmlFor="feed-tags"
            className="text-[11px] font-semibold tracking-widest text-gray-400 uppercase"
          >
            태그
          </label>
          <div className="mt-1.5">
            <TagInput
              id="feed-tags"
              tags={tags}
              onChange={setTags}
              suggestions={TAG_SUGGESTIONS}
            />
          </div>
        </div>

        {/* Visibility toggle */}
        <div>
          <span className="text-[11px] font-semibold tracking-widest text-gray-400 uppercase">
            공개 범위
          </span>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() => setIsPublic(true)}
              className={[
                'flex flex-1 items-center justify-center gap-2 rounded-xl border-2 py-3 text-sm font-medium transition-colors',
                isPublic
                  ? 'border-indigo-400 bg-indigo-50 text-indigo-600'
                  : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200',
              ].join(' ')}
            >
              <Globe size={16} />
              전체 공개
            </button>
            <button
              type="button"
              onClick={() => setIsPublic(false)}
              className={[
                'flex flex-1 items-center justify-center gap-2 rounded-xl border-2 py-3 text-sm font-medium transition-colors',
                !isPublic
                  ? 'border-indigo-400 bg-indigo-50 text-indigo-600'
                  : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200',
              ].join(' ')}
            >
              <Lock size={16} />
              나만 보기
            </button>
          </div>
        </div>

        {/* Image upload placeholder */}
        <div className="rounded-xl border-2 border-dashed border-gray-200 p-6 text-center">
          <p className="text-sm text-gray-400">
            이미지 업로드는 추후 지원 예정입니다
          </p>
        </div>
      </form>
    </div>
  );
}
