/**
 * (guest)/layout.tsx — Guest 전용 라우트 그룹 레이아웃
 *
 * 적용 대상: /login, /register, /oauth/callback
 *
 * 접근 정책:
 *   - 비로그인 사용자만 접근 가능
 *   - 이미 로그인한 사용자는 홈(/)으로 리다이렉트
 *
 * 렌더링 전략: CSR
 *   - OAuth 콜백, 폼 인터랙션 등 모두 클라이언트 의존
 *   - 인증 상태는 클라이언트 스토어에서 확인
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { useAuthStore, selectIsAuthenticated } from '@/stores/authStore';
import { ROUTES } from '@/constants/routes';
import { AuthLayout } from '@/components/layout';

export default function GuestLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  useEffect(() => {
    if (isHydrated && isAuthenticated) {
      router.replace(ROUTES.FEED);
    }
  }, [isAuthenticated, isHydrated, router]);

  // hydration 완료 전이거나 이미 인증된 상태면 빈 화면 (flash 방지)
  if (!isHydrated || isAuthenticated) {
    return null;
  }

  return <AuthLayout>{children}</AuthLayout>;
}
