/**
 * AuthHydration.tsx
 *
 * 앱 최초 마운트 시 인증 상태를 복원하고 hydration 완료를 표시하는 컴포넌트.
 *
 * 복원 순서:
 *   1. localStorage에 저장된 인증 정보를 복원한다 (rememberMe=true였던 세션).
 *   2. 복원 후 accessToken이 없으면 silent refresh를 시도한다.
 *      Refresh Token은 HttpOnly Cookie로 브라우저가 자동 전송하므로
 *      쿠키가 유효하면 새 accessToken을 발급받을 수 있다.
 *   3. 복원/갱신 완료 후 isHydrated = true로 전환한다.
 *
 * 레이아웃 가드((auth)/layout, (guest)/layout)는 isHydrated가 true가 될 때까지
 * null을 반환하여 보호된 콘텐츠의 flash를 방지한다.
 *
 * 배치:
 *   root layout.tsx에서 <QueryProvider> 내부에 배치한다.
 *   children을 그대로 pass-through하는 wrapper 컴포넌트이다.
 */

'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { silentRefresh, getCurrentUser } from '@/api/auth';

export default function AuthHydration({ children }: { children: ReactNode }) {
  const restoreAuth = useAuthStore((s) => s.restoreAuth);
  const setHydrated = useAuthStore((s) => s.setHydrated);
  // React Strict Mode에서 useEffect가 2회 실행될 수 있으므로 중복 방지.
  // refresh token rotation이 동반되므로 두 번째 호출이 이전 쿠키로
  // 들어가면 정상 세션이 비인증 처리될 수 있다.
  const hydratedRef = useRef(false);

  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;

    async function hydrate() {
      // 1. localStorage에서 인증 정보 복원 (rememberMe=true였던 세션)
      restoreAuth();

      // 2. 복원 후 accessToken이 없으면 silent refresh 시도
      //    (rememberMe=false였지만 세션 쿠키가 유효한 경우)
      const { accessToken } = useAuthStore.getState();
      if (!accessToken) {
        try {
          const result = await silentRefresh();
          useAuthStore.getState().setAccessToken(result.accessToken);

          // accessToken만으로는 user 정보를 알 수 없으므로 프로필을 함께 복원한다.
          // user가 null이면 isOwner 등 소유자 판단 로직이 항상 false가 된다.
          const profile = await getCurrentUser();
          useAuthStore.getState().setUser({
            id: profile.userId,
            email: profile.email,
            nickname: profile.nickname,
            profileImage: profile.profileImage,
            provider: null,
          });
        } catch {
          // 쿠키가 없거나 만료 → 비인증 상태로 진행
        }
      }

      // 3. hydration 완료 표시
      setHydrated();
    }

    hydrate();
  }, [restoreAuth, setHydrated]);

  return <>{children}</>;
}
