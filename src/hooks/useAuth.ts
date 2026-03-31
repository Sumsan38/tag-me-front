/**
 * useAuth.ts
 *
 * Identity 도메인 React Query 훅.
 *
 * 훅 목록:
 *   - useRegister()    — 회원가입 mutation (성공 시 자동 로그인 + 홈 리다이렉트)
 *   - useLogin()       — 로그인 mutation (토큰 저장 + 프로필 조회 + 홈 리다이렉트)
 *   - useLogout()      — 로그아웃 mutation (토큰 클리어 + 로그인 페이지 리다이렉트)
 *   - useCurrentUser() — 본인 프로필 query (인증 상태에서만 활성화)
 *   - useOAuthLogin()  — OAuth 인가 URL 요청 + 리다이렉트
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/useToast';
import { ROUTES } from '@/constants/routes';
import { getErrorMessage } from '@/api/error';
import * as authApi from '@/api/auth';
import type {
  LoginRequest,
  RegisterRequest,
  UpdateProfileRequest,
  User,
  UserProfileResponse,
} from '@/types/auth';

// ---------------------------------------------------------------------------
// Query Keys
// ---------------------------------------------------------------------------

export const authKeys = {
  all: ['auth'] as const,
  currentUser: () => [...authKeys.all, 'currentUser'] as const,
};

// ---------------------------------------------------------------------------
// 헬퍼: UserProfileResponse → User 변환
// ---------------------------------------------------------------------------

function toUser(profile: UserProfileResponse): User {
  return {
    id: profile.userId,
    email: profile.email,
    nickname: profile.nickname,
    profileImage: profile.profileImage,
    provider: null, // 프로필 API에는 provider 정보가 없음
  };
}

// ---------------------------------------------------------------------------
// useRegister
// ---------------------------------------------------------------------------

/**
 * 회원가입 mutation.
 * 성공 시 같은 credentials로 자동 로그인 → 홈 리다이렉트.
 */
export function useRegister() {
  const router = useRouter();
  const toast = useToast();
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: async (data: RegisterRequest) => {
      await authApi.register(data);
      // 회원가입 성공 → 자동 로그인
      const loginResponse = await authApi.login({
        email: data.email,
        password: data.password,
        rememberMe: false,
      });
      return loginResponse;
    },
    onSuccess: async (loginResponse) => {
      // 프로필 조회 API가 Authorization 헤더를 필요로 하므로
      // getCurrentUser() 호출 전에 토큰을 먼저 스토어에 저장한다.
      useAuthStore.getState().setAccessToken(loginResponse.accessToken);

      const profile = await authApi.getCurrentUser();
      setAuth(loginResponse.accessToken, toUser(profile));
      toast.success('회원가입이 완료되었습니다.');
      router.replace(ROUTES.FEED);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

// ---------------------------------------------------------------------------
// useLogin
// ---------------------------------------------------------------------------

/**
 * 로그인 mutation.
 * 성공 시 토큰 저장 + 프로필 조회 + 홈(또는 redirect 경로)으로 리다이렉트.
 */
export function useLogin() {
  const router = useRouter();
  const toast = useToast();
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: async (loginResponse, variables) => {
      // rememberMe 상태를 항상 동기화한다.
      // false일 때 명시적으로 내려야 이전 세션의 true가 남지 않는다.
      useAuthStore.getState().setRememberMe(variables.rememberMe);

      // 임시로 토큰만 저장 (프로필 조회 시 Authorization 헤더 필요)
      useAuthStore.getState().setAccessToken(loginResponse.accessToken);

      const profile = await authApi.getCurrentUser();
      setAuth(loginResponse.accessToken, toUser(profile));
      toast.success('로그인되었습니다.');

      // redirect 쿼리 파라미터가 있으면 해당 경로로, 없으면 홈으로
      const params = new URLSearchParams(window.location.search);
      const redirectTo = params.get('redirect') || ROUTES.FEED;
      router.replace(redirectTo);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

// ---------------------------------------------------------------------------
// useLogout
// ---------------------------------------------------------------------------

/**
 * 로그아웃 mutation.
 * 서버에 로그아웃 요청 후 인증 상태 초기화 + 로그인 페이지 리다이렉트.
 */
export function useLogout() {
  const router = useRouter();
  const toast = useToast();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      clearAuth();
      queryClient.clear();
      toast.info('로그아웃되었습니다.');
      router.replace(ROUTES.LOGIN);
    },
    onError: () => {
      // 로그아웃 실패해도 클라이언트 상태는 초기화
      clearAuth();
      queryClient.clear();
      router.replace(ROUTES.LOGIN);
    },
  });
}

// ---------------------------------------------------------------------------
// useCurrentUser
// ---------------------------------------------------------------------------

/**
 * 현재 로그인한 사용자 프로필 query.
 * accessToken이 있을 때만 활성화된다.
 */
export function useCurrentUser() {
  const accessToken = useAuthStore((s) => s.accessToken);

  return useQuery({
    queryKey: authKeys.currentUser(),
    queryFn: authApi.getCurrentUser,
    enabled: !!accessToken,
    staleTime: 5 * 60 * 1000, // 프로필은 5분간 fresh
  });
}

// ---------------------------------------------------------------------------
// useUpdateProfile
// ---------------------------------------------------------------------------

/**
 * 프로필 수정 mutation.
 * 성공 시 스토어의 user 정보를 업데이트하고 currentUser 쿼리를 갱신한다.
 */
export function useUpdateProfile() {
  const toast = useToast();
  const setUser = useAuthStore((s) => s.setUser);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => authApi.updateProfile(data),
    onSuccess: (profile) => {
      setUser(toUser(profile));
      queryClient.setQueryData(authKeys.currentUser(), profile);
      toast.success('프로필이 수정되었습니다.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

// ---------------------------------------------------------------------------
// useOAuthLogin
// ---------------------------------------------------------------------------

/**
 * OAuth 인가 URL 요청 + 해당 URL로 브라우저 리다이렉트.
 * 버튼 클릭 시 mutate('google') 또는 mutate('kakao') 호출.
 */
export function useOAuthLogin() {
  const toast = useToast();

  return useMutation({
    mutationFn: async (provider: 'google' | 'kakao') => {
      const redirectUri = `${window.location.origin}${ROUTES.OAUTH_CALLBACK}`;
      const response = await authApi.getOAuthAuthorizeUrl(
        provider,
        redirectUri,
      );
      return response;
    },
    onSuccess: (response) => {
      // 인가 URL로 브라우저 리다이렉트 (전체 페이지 이동)
      window.location.href = response.authorizationUrl;
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
