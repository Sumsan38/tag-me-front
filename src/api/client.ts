/**
 * client.ts
 *
 * Axios 인스턴스 및 인터셉터 설정.
 *
 * 인증 흐름:
 *   - Request Interceptor: Authorization 헤더에 Access Token 자동 첨부
 *   - Response Interceptor:
 *       - 401 응답 시 Refresh Token(HttpOnly Cookie)으로 갱신 후 원래 요청 재시도
 *       - 동시에 여러 요청이 401을 받을 경우 갱신 요청이 중복되지 않도록 Promise 큐 관리
 *       - 갱신 실패 시 로그인 페이지 리다이렉트
 *   - Response Interceptor: ApiEnvelope<T> 에서 data 필드 자동 추출
 *
 * Refresh Token 관리:
 *   - Refresh Token은 HttpOnly Cookie로 브라우저가 자동 관리한다.
 *   - withCredentials: true 설정으로 모든 요청에 쿠키가 자동 전송된다.
 *   - 토큰 갱신 시 body 없이 POST /api/v1/auth/refresh 호출 (쿠키 자동 전송).
 */

import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import { ROUTES } from '@/constants/routes';
import { useAuthStore } from '@/stores/authStore';

// ---------------------------------------------------------------------------
// 타입 정의
// ---------------------------------------------------------------------------

/**
 * 백엔드 Envelope 응답 구조.
 * types/common.ts 구현 전까지 여기서 로컬로 정의한다.
 */
interface ApiEnvelope<T = unknown> {
  success: boolean;
  data: T;
  error?: { code: string; message: string };
  timestamp: string;
}

/**
 * 재시도 플래그가 추가된 요청 설정 타입.
 * axios InternalAxiosRequestConfig 를 확장한다.
 */
interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// ---------------------------------------------------------------------------
// Access Token Placeholder
// ---------------------------------------------------------------------------

/**
 * Access Token 조회 함수.
 *
 * 인터셉터는 React 렌더 사이클 밖에서 실행되므로
 * 훅 대신 getState()를 통해 스토어 값에 접근한다.
 */
function getAccessToken(): string | null {
  return useAuthStore.getState().accessToken;
}

/**
 * Access Token 저장 함수.
 *
 * Silent Refresh(토큰 갱신) 성공 후 응답 인터셉터에서 호출한다.
 * Refresh Token은 HttpOnly Cookie로 브라우저가 관리하므로 저장하지 않는다.
 */
function setAccessToken(accessToken: string): void {
  useAuthStore.getState().setAccessToken(accessToken);
}

/**
 * 인증 상태 초기화 함수.
 *
 * Refresh Token 갱신 실패 시 응답 인터셉터에서 호출한다.
 * clearAuth는 accessToken과 user를 모두 null로 초기화한다.
 */
function clearAuthState(): void {
  useAuthStore.getState().clearAuth();
}

// ---------------------------------------------------------------------------
// 토큰 갱신 제외 경로
// ---------------------------------------------------------------------------

/**
 * 401 응답 시 토큰 갱신(Silent Refresh)을 시도하지 않을 경로 목록.
 * 로그인·회원가입 등 인증 엔드포인트 자체의 401은
 * "잘못된 credentials" 의미이므로 갱신 대상이 아니다.
 */
const AUTH_ENDPOINTS = [
  '/api/v1/auth/login',
  '/api/v1/auth/register',
  '/api/v1/auth/refresh',
];

function isAuthEndpoint(url: string | undefined): boolean {
  if (!url) return false;
  return AUTH_ENDPOINTS.some((endpoint) => url.includes(endpoint));
}

// ---------------------------------------------------------------------------
// Axios 인스턴스
// ---------------------------------------------------------------------------

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
  /**
   * HttpOnly Cookie(Refresh Token)를 자동 전송하기 위해 필수.
   * 백엔드 CORS: Access-Control-Allow-Credentials: true + 명시적 origin.
   */
  withCredentials: true,
});

// ---------------------------------------------------------------------------
// 토큰 갱신 큐 관리
// ---------------------------------------------------------------------------

/**
 * 토큰 갱신 중 여부 플래그.
 * 갱신이 진행 중일 때 추가로 들어온 401 요청은 큐에 쌓아 대기시킨다.
 */
let isRefreshing = false;

/**
 * 갱신 완료 대기 중인 요청의 resolve/reject 콜백 큐.
 */
let refreshQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

/**
 * 갱신 성공 시 대기 중인 요청 모두 재개.
 */
function resolveRefreshQueue(newToken: string): void {
  refreshQueue.forEach(({ resolve }) => resolve(newToken));
  refreshQueue = [];
}

/**
 * 갱신 실패 시 대기 중인 요청 모두 에러 처리.
 */
function rejectRefreshQueue(error: unknown): void {
  refreshQueue.forEach(({ reject }) => reject(error));
  refreshQueue = [];
}

// ---------------------------------------------------------------------------
// Refresh Token 갱신 API 호출
// ---------------------------------------------------------------------------

/**
 * HttpOnly Cookie의 Refresh Token을 이용해 새로운 Access Token을 발급받는다.
 * body 없이 호출하며, 브라우저가 쿠키를 자동 전송한다.
 * apiClient 를 사용하면 인터셉터가 재귀 호출되므로 axios 원본을 사용한다.
 */
async function requestTokenRefresh(): Promise<{ accessToken: string }> {
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

// ---------------------------------------------------------------------------
// Request Interceptor
// ---------------------------------------------------------------------------

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: unknown) => Promise.reject(error),
);

// ---------------------------------------------------------------------------
// Response Interceptor
// ---------------------------------------------------------------------------

apiClient.interceptors.response.use(
  /**
   * 성공 응답: ApiEnvelope<T> 에서 data 필드를 추출하여 반환한다.
   * 이후 호출부에서는 response.data 가 곧 비즈니스 데이터가 된다.
   *
   * success === false 인 경우(HTTP 2xx 이지만 논리적 실패)는 에러로 변환한다.
   */
  (response: AxiosResponse<ApiEnvelope>) => {
    const envelope = response.data;

    if (!envelope.success) {
      // 백엔드가 2xx 로 논리적 에러를 내려보낸 경우
      return Promise.reject(
        new ApiError(
          envelope.error?.message ?? '요청을 처리할 수 없습니다.',
          envelope.error?.code ?? 'COMMON_001',
          response.status,
        ),
      );
    }

    // response.data 를 envelope.data 로 교체하여 호출부 편의를 높인다
    response.data = envelope.data as unknown as ApiEnvelope;
    return response;
  },

  /**
   * 에러 응답 처리.
   *
   * 401: Refresh Token(HttpOnly Cookie)으로 갱신 시도 후 원래 요청 재시도.
   *   - 갱신 중 추가 401 요청은 큐에 쌓아 갱신 완료 후 일괄 재시도.
   *   - 갱신 실패 시 인증 상태 초기화 후 로그인 페이지 리다이렉트.
   */
  async (error: AxiosError<ApiEnvelope>) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthEndpoint(originalRequest.url)
    ) {
      if (isRefreshing) {
        // 이미 갱신 중 — 큐에 등록하고 갱신 완료 후 재시도
        return new Promise<AxiosResponse>((resolve, reject) => {
          refreshQueue.push({
            resolve: (newToken: string) => {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              resolve(apiClient(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { accessToken } = await requestTokenRefresh();
        setAccessToken(accessToken);
        resolveRefreshQueue(accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        rejectRefreshQueue(refreshError);
        clearAuthState();

        // 브라우저 환경에서만 리다이렉트
        if (typeof window !== 'undefined') {
          window.location.href = ROUTES.LOGIN;
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // 401 외 에러: ApiEnvelope 의 error 필드가 있으면 ApiError 로 래핑
    const envelopeError = error.response?.data?.error;
    if (envelopeError) {
      return Promise.reject(
        new ApiError(
          envelopeError.message,
          envelopeError.code,
          error.response?.status,
        ),
      );
    }

    return Promise.reject(error);
  },
);

// ---------------------------------------------------------------------------
// ApiError 클래스
// ---------------------------------------------------------------------------

/**
 * API 호출에서 발생하는 도메인 에러.
 * error.ts 의 handleApiError 에서 이 타입을 기준으로 분기한다.
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * unknown 값이 ApiError 인지 판별하는 타입 가드.
 */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

// ---------------------------------------------------------------------------
// 기본 내보내기
// ---------------------------------------------------------------------------

export default apiClient;
