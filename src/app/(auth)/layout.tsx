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
 *
 * TODO(auth-guard): 인증 스토어 구현 후 아래 가드를 활성화한다.
 *   1. useAuthStore()로 isAuthenticated, isHydrated 상태를 구독
 *   2. isHydrated && !isAuthenticated 이면
 *      router.replace(`${ROUTES.LOGIN}?redirect=${pathname}`) 호출
 *   3. 스토어 hydration 완료 전에는 스피너 또는 null을 반환하여
 *      보호된 콘텐츠가 순간 노출되는 플래시를 방지
 *
 * TODO(role-guard): Admin 전용 기능(제재, 고객지원)은 별도 role 확인 레이어 추가
 */

'use client';

import type { ReactNode } from 'react';
import { MainLayout } from '@/components/layout';

// TODO(auth-guard): import { useEffect } from 'react';
// TODO(auth-guard): import { useRouter, usePathname } from 'next/navigation';
// TODO(auth-guard): import { useAuthStore } from '@/stores/authStore';
// TODO(auth-guard): import { ROUTES } from '@/constants/routes';

export default function AuthGroupLayout({
  children,
}: {
  children: ReactNode;
}) {
  // TODO(auth-guard): 인증 가드 시작 ---
  // const router = useRouter();
  // const pathname = usePathname();
  // const { isAuthenticated, isHydrated } = useAuthStore();
  //
  // useEffect(() => {
  //   if (isHydrated && !isAuthenticated) {
  //     router.replace(`${ROUTES.LOGIN}?redirect=${encodeURIComponent(pathname)}`);
  //   }
  // }, [isAuthenticated, isHydrated, router, pathname]);
  //
  // if (!isHydrated || !isAuthenticated) {
  //   return null; // 또는 <FullScreenSpinner />
  // }
  // TODO(auth-guard): 인증 가드 끝 ---

  return <MainLayout>{children}</MainLayout>;
}
