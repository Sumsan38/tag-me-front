/**
 * auth.ts
 *
 * Identity 도메인 타입 정의.
 *
 * - AuthProvider: 가입 경로 구분 (이메일/Google/Kakao)
 * - User: 로그인한 사용자 정보 (authStore.ts에서 import)
 * - LoginRequest / RegisterRequest: 로컬 인증 요청 바디
 * - LoginResponse: 로그인/토큰 갱신 응답 (accessToken + refreshToken)
 * - UserProfileResponse / PublicUserProfileResponse: 프로필 API 응답
 * - OAuthAuthorizeResponse: OAuth 인가 URL 응답
 *
 * OAuth 콜백 처리에서 CSRF state 파라미터 검증은 서버에서 수행한다.
 */

// ---------------------------------------------------------------------------
// 가입 경로
// ---------------------------------------------------------------------------

/**
 * 사용자 가입/로그인 경로.
 *   - 'local'  : 이메일/비밀번호 회원가입
 *   - 'google' : Google OAuth 2.0
 *   - 'kakao'  : Kakao OAuth 2.0
 */
export type AuthProvider = 'local' | 'google' | 'kakao';

// ---------------------------------------------------------------------------
// 사용자 정보
// ---------------------------------------------------------------------------

/**
 * 로그인한 사용자 정보.
 * authStore.ts의 Zustand 스토어에서 이 타입을 참조한다.
 * provider는 회원 탈퇴 시 OAuth 계정 연결 해제 경로를 분기하는 데 사용한다.
 * provider가 null이면 아직 정보를 불러오지 않은 상태이다.
 */
export interface User {
  id: number;
  email: string;
  nickname: string;
  profileImage: string | null;
  provider: AuthProvider | null;
}

// ---------------------------------------------------------------------------
// 요청 타입
// ---------------------------------------------------------------------------

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  nickname: string;
}

// ---------------------------------------------------------------------------
// 응답 타입
// ---------------------------------------------------------------------------

/**
 * 로그인 및 토큰 갱신(Silent Refresh) 응답.
 * Refresh Token은 HttpOnly Cookie로 전환되어 응답 body에 포함되지 않는다.
 * accessToken만 메모리(Zustand)에 보관한다.
 */
export interface LoginResponse {
  userId: number;
  accessToken: string;
}

/**
 * GET /api/v1/users/me 응답.
 */
export interface UserProfileResponse {
  userId: number;
  email: string;
  nickname: string;
  profileImage: string | null;
  streakCount: number;
  createdAt: string;
}

/**
 * GET /api/v1/users/{id} 응답.
 */
export interface PublicUserProfileResponse {
  userId: number;
  email: string;
  nickname: string;
  profileImage: string | null;
  streakCount: number;
  createdAt: string;
}

/**
 * PUT /api/v1/users/me 요청.
 */
export interface UpdateProfileRequest {
  nickname: string;
  profileImageUrl: string | null;
}

/**
 * GET /api/v1/auth/oauth/{provider} 응답.
 */
export interface OAuthAuthorizeResponse {
  authorizationUrl: string;
  state: string;
}
