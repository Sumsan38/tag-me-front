'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Bell, LogIn, UserPlus } from 'lucide-react';
import { Avatar, Badge } from '@/components/common';
import { ROUTES } from '@/constants/routes';
import { useAuthStore, selectIsAuthenticated } from '@/stores/authStore';

export interface HeaderProps {
  /** 알림 카운트 (기본값: 0) */
  notificationCount?: number;
  className?: string;
}

export default function Header({
  notificationCount = 0,
  className = '',
}: HeaderProps) {
  const router = useRouter();
  const isLoggedIn = useAuthStore(selectIsAuthenticated);
  const user = useAuthStore((s) => s.user);

  return (
    <header
      className={[
        'sticky top-0 z-40 bg-surface border-b border-border',
        className,
      ].join(' ')}
    >
      <div className="flex items-center gap-3 px-4 h-14">
        {/* 로고 */}
        <Link
          href={ROUTES.HOME}
          aria-label="Tag Me 홈으로 이동"
          className="shrink-0 text-[17px] font-bold text-text tracking-[-0.03em] hover:opacity-80 transition-opacity"
        >
          Tag Me
        </Link>

        {/* 검색바 — 데스크탑에서만 표시 */}
        <button
          type="button"
          onClick={() => router.push(ROUTES.SEARCH)}
          aria-label="검색 페이지로 이동"
          className={[
            'hidden md:flex flex-1 items-center gap-2 max-w-sm mx-auto',
            'h-9 px-3 rounded-xl bg-[#F5F5F4] border border-border',
            'text-sm text-muted hover:border-muted transition-colors cursor-pointer',
          ].join(' ')}
        >
          <Search size={14} className="shrink-0 text-muted" aria-hidden />
          <span>태그, 일기, 게시글 검색</span>
        </button>

        {/* 오른쪽 영역 */}
        <div className="ml-auto flex items-center gap-2 shrink-0">
          {isLoggedIn ? (
            <>
              {/* 모바일 검색 아이콘 */}
              <button
                type="button"
                onClick={() => router.push(ROUTES.SEARCH)}
                aria-label="검색"
                className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl text-sub hover:bg-[#F5F5F4] transition-colors"
              >
                <Search size={18} aria-hidden />
              </button>

              {/* 알림 아이콘 */}
              <Link
                href={ROUTES.NOTIFICATIONS}
                aria-label={`알림 ${notificationCount}개`}
                className="relative flex items-center justify-center w-9 h-9 rounded-xl text-sub hover:bg-[#F5F5F4] transition-colors"
              >
                <Bell size={18} aria-hidden />
                {notificationCount > 0 && (
                  <span className="absolute top-1 right-1 translate-x-1/2 -translate-y-1/2">
                    <Badge
                      variant="notification"
                      count={notificationCount}
                    />
                  </span>
                )}
              </Link>

              {/* 프로필 아바타 */}
              <Link
                href={ROUTES.MYPAGE}
                aria-label="마이페이지로 이동"
                className="rounded-full hover:ring-2 hover:ring-border transition-all"
              >
                <Avatar
                  src={user?.profileImage ?? undefined}
                  initials={user?.nickname?.slice(0, 2)}
                  size="sm"
                />
              </Link>
            </>
          ) : (
            <>
              {/* 비로그인: 로그인 / 회원가입 버튼 */}
              <Link
                href={ROUTES.LOGIN}
                aria-label="로그인"
                className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-sub hover:text-text transition-colors px-3 py-1.5"
              >
                <LogIn size={15} aria-hidden />
                로그인
              </Link>
              <Link
                href={ROUTES.REGISTER}
                aria-label="회원가입"
                className="inline-flex items-center gap-1.5 text-sm font-semibold bg-text text-white px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity"
              >
                <UserPlus size={15} className="hidden sm:block" aria-hidden />
                회원가입
              </Link>

              {/* 모바일 검색 아이콘 (비로그인) */}
              <button
                type="button"
                onClick={() => router.push(ROUTES.SEARCH)}
                aria-label="검색"
                className="sm:hidden flex items-center justify-center w-9 h-9 rounded-xl text-sub hover:bg-[#F5F5F4] transition-colors"
              >
                <Search size={18} aria-hidden />
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
