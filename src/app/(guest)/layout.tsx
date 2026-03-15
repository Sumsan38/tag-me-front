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
 *
 * TODO(auth-guard): 인증 스토어 구현 후 아래 가드를 활성화한다.
 *   1. useAuthStore()로 isAuthenticated 상태를 구독
 *   2. isAuthenticated === true 이면 router.replace(ROUTES.HOME) 호출
 *   3. 스토어 hydration 완료 전에는 스피너 또는 null을 반환하여
 *      로그인 페이지가 순간 노출되는 플래시를 방지
 */

'use client';

import type { ReactNode } from 'react';

// TODO(auth-guard): import { useEffect } from 'react';
// TODO(auth-guard): import { useRouter } from 'next/navigation';
// TODO(auth-guard): import { useAuthStore } from '@/stores/authStore';
// TODO(auth-guard): import { ROUTES } from '@/constants/routes';

export default function GuestLayout({
  children,
}: {
  children: ReactNode;
}) {
  // TODO(auth-guard): 인증 가드 시작 ---
  // const router = useRouter();
  // const { isAuthenticated, isHydrated } = useAuthStore();
  //
  // useEffect(() => {
  //   if (isHydrated && isAuthenticated) {
  //     router.replace(ROUTES.HOME);
  //   }
  // }, [isAuthenticated, isHydrated, router]);
  //
  // if (!isHydrated || isAuthenticated) {
  //   return null; // 또는 <FullScreenSpinner />
  // }
  // TODO(auth-guard): 인증 가드 끝 ---

  return <>{children}</>;
}
