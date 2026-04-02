/**
 * (auth)/layout.tsx — 인증 필요 라우트 그룹 레이아웃
 *
 * 적용 대상:
 *   /feed/write, /diary/*, /mindmap, /search,
 *   /notifications, /mypage/*, /social/*
 *
 * 접근 정책:
 *   - 로그인 사용자만 접근 가능
 *   - 비로그인 사용자는 /login으로 리다이렉트
 *   - 리다이렉트 시 현재 경로를 ?redirect= 쿼리로 전달하여
 *     로그인 완료 후 원래 페이지로 복귀할 수 있도록 한다
 *
 * 렌더링 전략: CSR
 *   - 모든 하위 페이지가 인증 상태를 필요로 하며 인터랙티브
 *   - 인증 상태는 클라이언트 스토어에서 확인
 */

'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { useAuthStore, selectIsAuthenticated } from '@/stores/authStore';
import { ROUTES } from '@/constants/routes';
import { MainLayout } from '@/components/layout';

export default function AuthGroupLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.replace(`${ROUTES.LOGIN}?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isAuthenticated, isHydrated, router, pathname]);

  // hydration 완료 전이거나 비인증 상태면 빈 화면 (보호된 콘텐츠 flash 방지)
  if (!isHydrated || !isAuthenticated) {
    return null;
  }

  const isDiaryRoute = pathname.startsWith('/diary');
  return (
    <MainLayout contentMaxWidth={isDiaryRoute ? 'max-w-6xl' : undefined}>
      {children}
    </MainLayout>
  );
}
