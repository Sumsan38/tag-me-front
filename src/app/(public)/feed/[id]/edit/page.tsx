'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Globe, Lock } from 'lucide-react';

import TagInput from '@/components/tag/TagInput';
import { useFeed, useUpdateFeed } from '@/hooks/useFeed';
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

export default function FeedEditPage() {
  const router = useRouter();
  const params = useParams();
  const rawId = params.id ? Number(params.id) : null;
  const feedId = rawId !== null && Number.isFinite(rawId) ? rawId : null;

  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const currentUserId = useAuthStore((s) => s.user?.id ?? null);

  const { data: feed, isLoading, isError } = useFeed(feedId);
  const updateFeed = useUpdateFeed();

  const [tags, setTags] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(true);
  const [prefilled, setPrefilled] = useState(false);

  // ---- 인증 가드 ----
  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.replace(`${ROUTES.LOGIN}?redirect=${encodeURIComponent(window.location.pathname)}`);
    }
  }, [isAuthenticated, isHydrated, router]);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FeedFormValues>({
    resolver: zodResolver(feedSchema),
    defaultValues: { content: '' },
  });

  const contentValue = watch('content');

  // ---- 기존 데이터 프리필 ----
  useEffect(() => {
    if (feed && !prefilled) {
      reset({ content: feed.content });
      setTags(feed.tags.map((t) => t.name));
      setIsPublic(feed.isPublic);
      setPrefilled(true);
    }
  }, [feed, prefilled, reset]);

  // ---- 소유자 검증 ----
  const isOwner = currentUserId != null && feed?.userId === currentUserId;

  function onSubmit(data: FeedFormValues) {
    if (!feedId) return;
    updateFeed.mutate(
      {
        id: feedId,
        data: {
          content: data.content,
          isPublic,
          tagNames: tags.length > 0 ? tags : undefined,
          imageUrls: feed?.imageUrls ?? [],
        },
      },
      {
        onSuccess: () => {
          router.replace(ROUTES.FEED_DETAIL(String(feedId)));
        },
      },
    );
  }

  // ---- 에러 / 소유자 아님 ----
  if (isError || (feed && !isOwner)) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-2">
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
    );
  }

  // ---- 로딩 ----
  if (!isHydrated || !isAuthenticated || isLoading || !feed) {
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
          <h1 className="text-base font-semibold text-gray-900">게시글 수정</h1>
          <button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={updateFeed.isPending}
            className="rounded-lg bg-gray-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            {updateFeed.isPending ? '저장 중...' : '저장'}
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
              ].join(' ')}>
              <Lock size={16} />
              나만 보기
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
