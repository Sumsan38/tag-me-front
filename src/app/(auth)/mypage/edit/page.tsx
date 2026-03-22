/**
 * /mypage/edit — 프로필 편집 페이지
 *
 * 닉네임 수정을 제공한다.
 * 프로필 이미지 변경은 S3 업로드 구현 후 추가 예정.
 */

'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft } from 'lucide-react';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { Avatar } from '@/components/common';
import { useAuthStore } from '@/stores/authStore';
import { useCurrentUser, useUpdateProfile } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';

const editProfileSchema = z.object({
  nickname: z
    .string()
    .min(2, '닉네임은 2자 이상이어야 합니다.')
    .max(20, '닉네임은 20자 이하여야 합니다.'),
});

type EditProfileFormValues = z.infer<typeof editProfileSchema>;

export default function EditProfilePage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { data: profile } = useCurrentUser();
  const updateProfile = useUpdateProfile();

  const currentNickname = profile?.nickname ?? user?.nickname ?? '';
  const currentImage = profile?.profileImage ?? user?.profileImage ?? null;

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<EditProfileFormValues>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: { nickname: currentNickname },
    values: { nickname: currentNickname },
  });

  const onSubmit = (data: EditProfileFormValues) => {
    updateProfile.mutate(
      { nickname: data.nickname, profileImageUrl: currentImage },
      { onSuccess: () => router.push(ROUTES.MYPAGE) },
    );
  };

  return (
    <div className="py-4 px-4 space-y-6">
      {/* 헤더 */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="뒤로 가기"
          className="flex items-center justify-center w-9 h-9 rounded-xl text-sub hover:bg-[#F5F5F4] transition-colors"
        >
          <ArrowLeft size={20} aria-hidden />
        </button>
        <h1 className="text-lg font-bold text-text">프로필 편집</h1>
      </div>

      {/* 아바타 */}
      <div className="flex flex-col items-center gap-3">
        <Avatar
          src={currentImage ?? undefined}
          initials={currentNickname.slice(0, 2)}
          size="xl"
        />
        <p className="text-xs text-muted">
          프로필 이미지 변경은 곧 지원됩니다.
        </p>
      </div>

      {/* 폼 */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          type="text"
          label="닉네임"
          id="nickname"
          placeholder="2~20자 닉네임"
          error={errors.nickname?.message}
          disabled={updateProfile.isPending}
          autoComplete="nickname"
          {...register('nickname')}
        />

        <div className="bg-[#F5F5F4] rounded-xl p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-sub">이메일</span>
            <span className="text-text">{user?.email ?? '-'}</span>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          loading={updateProfile.isPending}
          disabled={!isDirty || updateProfile.isPending}
        >
          저장
        </Button>
      </form>
    </div>
  );
}
