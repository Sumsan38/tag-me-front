/**
 * auth.ts
 *
 * Identity 도메인 API 클라이언트.
 *
 * 엔드포인트:
 *   - POST /api/v1/auth/register   — 회원가입
 *   - POST /api/v1/auth/login      — 로그인
 *   - POST /api/v1/auth/refresh    — 토큰 갱신
 *   - POST /api/v1/auth/logout     — 로그아웃
 *   - GET  /api/v1/auth/oauth/{provider}           — OAuth 인가 URL 생성
 *   - GET  /api/v1/auth/oauth/{provider}/callback   — OAuth 콜백 처리
 *   - GET  /api/v1/users/me        — 본인 프로필 조회
 */

import axios from 'axios';
import apiClient from '@/api/client';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  OAuthAuthorizeResponse,
  UserProfileResponse,
  UpdateProfileRequest,
} from '@/types/auth';

// ---------------------------------------------------------------------------
// Envelope 타입 (client.ts와 동일 구조, silent refresh 전용)
// ---------------------------------------------------------------------------

interface ApiEnvelope<T = unknown> {
  success: boolean;
  data: T;
  error?: { code: string; message: string };
  timestamp: string;
}

// ---------------------------------------------------------------------------
// 인증 API
// ---------------------------------------------------------------------------

/** 회원가입. 성공 시 201 반환, 응답 body에 data 없음. */
export async function register(data: RegisterRequest): Promise<void> {
  await apiClient.post('/api/v1/auth/register', data);
}

/** 로그인. userId + accessToken 반환. Refresh Token은 HttpOnly Cookie로 설정됨. */
export async function login(data: LoginRequest): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>(
    '/api/v1/auth/login',
    data,
  );
  return response.data;
}

/**
 * HttpOnly Cookie의 Refresh Token으로 새 Access Token을 발급받는다.
 * body 없이 호출하며, 브라우저가 쿠키를 자동 전송한다.
 * AuthHydration에서 앱 초기 진입 시 silent refresh에 사용한다.
 * apiClient를 사용하면 인터셉터가 개입하므로 axios 원본을 사용한다.
 */
export async function silentRefresh(): Promise<{ accessToken: string }> {
  const response = await axios.post<ApiEnvelope<{ accessToken: string }>>(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/refresh`,
    null,
    {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true,
    },
  );
  return response.data.data;
}

/** 로그아웃. Authorization 헤더의 Access Token을 블랙리스트에 등록. */
export async function logout(): Promise<void> {
  await apiClient.post('/api/v1/auth/logout');
}

// ---------------------------------------------------------------------------
// OAuth API
// ---------------------------------------------------------------------------

/** OAuth 인가 URL 생성. 프론트엔드는 반환된 URL로 사용자를 리다이렉트한다. */
export async function getOAuthAuthorizeUrl(
  provider: string,
  redirectUri: string,
): Promise<OAuthAuthorizeResponse> {
  const response = await apiClient.get<OAuthAuthorizeResponse>(
    `/api/v1/auth/oauth/${provider}`,
    { params: { redirectUri } },
  );
  return response.data;
}

/** OAuth 콜백 처리. code + state 검증 후 JWT 토큰 발급. */
export async function processOAuthCallback(
  provider: string,
  code: string,
  state: string,
  redirectUri: string,
): Promise<LoginResponse> {
  const response = await apiClient.get<LoginResponse>(
    `/api/v1/auth/oauth/${provider}/callback`,
    { params: { code, state, redirectUri } },
  );
  return response.data;
}

// ---------------------------------------------------------------------------
// 사용자 API
// ---------------------------------------------------------------------------

/** 본인 프로필 조회. 인증 필요. */
export async function getCurrentUser(): Promise<UserProfileResponse> {
  const response = await apiClient.get<UserProfileResponse>(
    '/api/v1/users/me',
  );
  return response.data;
}

/** 프로필 수정. 닉네임 및 프로필 이미지 URL 변경. */
export async function updateProfile(
  data: UpdateProfileRequest,
): Promise<UserProfileResponse> {
  const response = await apiClient.put<UserProfileResponse>(
    '/api/v1/users/me',
    data,
  );
  return response.data;
}
