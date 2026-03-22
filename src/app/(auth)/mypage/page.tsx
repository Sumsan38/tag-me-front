/**
 * /mypage — 마이페이지 (내 기록)
 *
 * tagdiary-minimal.jsx의 MyPageScreen에 대응.
 * 프로필 요약(아바타, 닉네임, 이메일, streakCount)과
 * 설정/편집 링크를 제공한다.
 */

'use client';

import Link from 'next/link';
import { Settings, Edit3, ChevronRight, Flame, Calendar } from 'lucide-react';
import { Avatar } from '@/components/common';
import { useAuthStore } from '@/stores/authStore';
import { useCurrentUser } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import Skeleton from '@/components/common/Skeleton';

export default function MyPage() {
  const user = useAuthStore((s) => s.user);
  const { data: profile, isLoading } = useCurrentUser();

  const nickname = profile?.nickname ?? user?.nickname ?? '';
  const email = profile?.email ?? user?.email ?? '';
  const profileImage = profile?.profileImage ?? user?.profileImage ?? null;
  const streakCount = profile?.streakCount ?? 0;
  const createdAt = profile?.createdAt;

  const joinDate = createdAt
    ? new Date(createdAt).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  return (
    <div className="py-4 px-4 space-y-4">
      {/* 프로필 카드 */}
      <div className="bg-surface rounded-2xl border border-border p-5">
        <div className="flex items-center gap-4">
          {isLoading ? (
            <Skeleton className="w-14 h-14 rounded-full" />
          ) : (
            <Avatar
              src={profileImage ?? undefined}
              initials={nickname.slice(0, 2)}
              size="lg"
            />
          )}
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <>
                <Skeleton className="h-5 w-24 mb-2" />
                <Skeleton className="h-3.5 w-36" />
              </>
            ) : (
              <>
                <h1 className="text-lg font-bold text-text truncate">
                  {nickname}
                </h1>
                <p className="text-sm text-muted truncate">{email}</p>
              </>
            )}
          </div>
          <Link
            href={ROUTES.MYPAGE_EDIT}
            aria-label="프로필 편집"
            className="flex items-center justify-center w-9 h-9 rounded-xl text-sub hover:bg-[#F5F5F4] transition-colors"
          >
            <Edit3 size={18} aria-hidden />
          </Link>
        </div>

        {/* 스트릭 + 가입일 */}
        <div className="flex gap-4 mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <Flame size={16} className="text-success" aria-hidden />
            <span className="text-sm font-semibold text-text">
              {streakCount}일 연속
            </span>
          </div>
          {joinDate && (
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-muted" aria-hidden />
              <span className="text-sm text-sub">{joinDate} 가입</span>
            </div>
          )}
        </div>
      </div>

      {/* 메뉴 */}
      <div className="bg-surface rounded-2xl border border-border overflow-hidden">
        <Link
          href={ROUTES.MYPAGE_EDIT}
          className="flex items-center justify-between px-4 py-3.5 hover:bg-[#F5F5F4] transition-colors"
        >
          <div className="flex items-center gap-3">
            <Edit3 size={18} className="text-sub" aria-hidden />
            <span className="text-sm font-medium text-text">프로필 편집</span>
          </div>
          <ChevronRight size={16} className="text-muted" aria-hidden />
        </Link>

        <div className="h-px bg-border mx-4" />

        <Link
          href={ROUTES.MYPAGE_SETTINGS}
          className="flex items-center justify-between px-4 py-3.5 hover:bg-[#F5F5F4] transition-colors"
        >
          <div className="flex items-center gap-3">
            <Settings size={18} className="text-sub" aria-hidden />
            <span className="text-sm font-medium text-text">설정</span>
          </div>
          <ChevronRight size={16} className="text-muted" aria-hidden />
        </Link>
      </div>
    </div>
  );
}
