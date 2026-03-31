/**
 * (guest)/oauth/callback/page.tsx — OAuth 소셜 로그인 콜백 처리
 *
 * 렌더링 전략: CSR
 *   - OAuth 제공자(Google, Kakao)가 리다이렉트한 URL을 처리한다.
 *   - URL 쿼리 파라미터(code, state, provider)를 읽어 백엔드 콜백 API를 호출한다.
 *   - window.location.search를 직접 읽으므로 Suspense boundary가 불필요하다.
 *
 * 처리 흐름:
 *   1. 마운트 시 code, state, provider 파라미터 추출
 *   2. processOAuthCallback() 호출 → LoginResponse(JWT) 수신
 *   3. 임시 토큰 저장(setTokens) → getCurrentUser() 호출 → setAuth() 저장
 *   4. 홈(ROUTES.HOME)으로 리다이렉트
 *   5. 오류 발생 시 toast.error() 표시 → 로그인(ROUTES.LOGIN)으로 리다이렉트
 */

'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { processOAuthCallback, getCurrentUser } from '@/api/auth';
import { useAuthStore } from '@/stores/authStore';
import type { AuthProvider, User } from '@/types/auth';
import Spinner from '@/components/common/Spinner';
import { ROUTES } from '@/constants/routes';
import { useToast } from '@/hooks/useToast';

// OAuth 콜백에서 수신한 provider 문자열이 유효한 AuthProvider 값인지 검증한다.
// 'local'은 소셜 로그인 경로가 아니므로 허용하지 않는다.
const OAUTH_PROVIDERS: ReadonlyArray<AuthProvider> = ['google', 'kakao'];

function isValidOAuthProvider(value: string): value is AuthProvider {
  return (OAUTH_PROVIDERS as ReadonlyArray<string>).includes(value);
}

export default function OAuthCallbackPage() {
  const router = useRouter();
  const toast = useToast();
  // React Strict Mode에서 useEffect가 2회 실행되므로 중복 처리를 방지한다.
  const processedRef = useRef(false);

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');
    const provider = params.get('provider');

    // 필수 파라미터 누락 시 즉시 로그인 페이지로 리다이렉트한다.
    if (!code || !state || !provider) {
      toast.error('올바르지 않은 인증 요청입니다.');
      router.replace(ROUTES.LOGIN);
      return;
    }

    // provider 값이 지원하는 OAuth 제공자인지 검증한다.
    if (!isValidOAuthProvider(provider)) {
      toast.error(`지원하지 않는 로그인 방식입니다: ${provider}`);
      router.replace(ROUTES.LOGIN);
      return;
    }

    handleCallback(provider, code, state);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleCallback(
    provider: AuthProvider,
    code: string,
    state: string,
  ) {
    try {
      // redirectUri는 백엔드 CSRF state 검증에서 사용된 값과 일치해야 한다.
      const redirectUri = `${window.location.origin}${ROUTES.OAUTH_CALLBACK}`;
      const loginResponse = await processOAuthCallback(
        provider,
        code,
        state,
        redirectUri,
      );

      // 프로필 조회 API(/api/v1/users/me)가 Authorization 헤더를 필요로 하므로
      // getCurrentUser() 호출 전에 임시로 토큰을 스토어에 저장한다.
      useAuthStore.getState().setAccessToken(loginResponse.accessToken);

      const profile = await getCurrentUser();

      const user: User = {
        id: profile.userId,
        email: profile.email,
        nickname: profile.nickname,
        profileImage: profile.profileImage,
        provider,
      };

      // 토큰과 사용자 정보를 한 번에 스토어에 저장한다.
      useAuthStore.getState().setAuth(loginResponse.accessToken, user);

      router.replace(ROUTES.FEED);
    } catch {
      toast.error('소셜 로그인에 실패했습니다.');
      router.replace(ROUTES.LOGIN);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      <Spinner size="lg" className="text-accent" />
      <p className="text-sm text-sub">로그인 처리 중...</p>
    </div>
  );
}
