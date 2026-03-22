/**
 * AuthHydration.tsx
 *
 * 앱 최초 마운트 시 인증 스토어의 hydration 완료를 표시하는 컴포넌트.
 *
 * 역할:
 *   - 마운트 시 useAuthStore.setHydrated()를 호출하여 isHydrated = true로 전환
 *   - 레이아웃 가드((auth)/layout, (guest)/layout)가 isHydrated를 기반으로
 *     인증 상태 확인 후 리다이렉트를 수행할 수 있도록 한다
 *   - isHydrated가 false인 동안 레이아웃 가드는 null을 반환하여
 *     보호된 콘텐츠나 로그인 UI가 순간 노출되는 flash를 방지한다
 *
 * 배치:
 *   root layout.tsx에서 <QueryProvider> 내부에 배치한다.
 *   children을 그대로 pass-through하는 wrapper 컴포넌트이다.
 */

'use client';

import { useEffect, type ReactNode } from 'react';
import { useAuthStore } from '@/stores/authStore';

export default function AuthHydration({ children }: { children: ReactNode }) {
  const restoreAuth = useAuthStore((s) => s.restoreAuth);
  const setHydrated = useAuthStore((s) => s.setHydrated);

  useEffect(() => {
    // localStorage에 저장된 인증 정보를 먼저 복원한 뒤 hydration 완료 표시.
    // 순서가 바뀌면 레이아웃 가드가 "미인증"으로 판단 → 로그인 리다이렉트 발생.
    restoreAuth();
    setHydrated();
  }, [restoreAuth, setHydrated]);

  return <>{children}</>;
}
