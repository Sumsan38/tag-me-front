/**
 * / — 루트 페이지
 *
 * 인증 상태에 따라 리다이렉트한다:
 *   - 토큰 있음(로그인) → /feed(메인 피드)
 *   - 토큰 없음(비로그인) → /login
 *
 * hydration 완료 전에는 빈 화면을 보여주어 flash를 방지한다.
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, selectIsAuthenticated } from '@/stores/authStore';
import { ROUTES } from '@/constants/routes';

export default function RootPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  useEffect(() => {
    if (!isHydrated) return;

    if (isAuthenticated) {
      router.replace(ROUTES.FEED);
    } else {
      router.replace(ROUTES.LOGIN);
    }
  }, [isAuthenticated, isHydrated, router]);

  return null;
}
