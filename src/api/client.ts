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
 *       - 갱신 실패 시:
 *           · permitAll GET 경로(피드/검색 등 비로그인 허용)이면 Authorization 헤더를 제거하고
 *             게스트 요청으로 강등하여 재시도한다 — 백엔드가 invalid Bearer 토큰에 대해
 *             200 게스트가 아닌 401을 반환하도록 정책을 변경(2026-05-05)함에 따른 대응.
 *           · 그 외 인증 필수 경로는 인증 상태 초기화 후 로그인 페이지로 리다이렉트.
 *       - 헤더가 처음부터 없는 게스트 요청은 인터셉터가 건드리지 않는다(401이 안 오기 때문).
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
import { isAuthEndpoint, isPermitAllGet } from '@/constants/apiPatterns';

export { isPermitAllGet } from '@/constants/apiPatterns';

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
 * 재시도/강등 플래그가 추가된 요청 설정 타입.
 * axios InternalAxiosRequestConfig 를 확장한다.
 *
 *   - `_retry`: 401 → refresh 시도가 한 번 일어났음을 표시한다 (무한 루프 방지).
 *   - `_skipAuth`: 이번 요청 회에 한해 Authorization 헤더 첨부를 건너뛰라는 표시.
 *     refresh 실패 후 permitAll GET을 게스트로 강등 재시도할 때 store에 살아 있는
 *     access token이 다시 붙지 않도록 사용한다. 인증 상태 자체는 보존된다.
 */
interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
  _skipAuth?: boolean;
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
 * 갱신 완료를 기다리는 요청 묶음.
 * 갱신 결과(성공/실패)에 따라 각 요청을 재시도하거나 강등 분기로 보낸다.
 */
interface PendingRequest {
  request: RetryableRequestConfig;
  resolve: (response: AxiosResponse) => void;
  reject: (error: unknown) => void;
}

let refreshQueue: PendingRequest[] = [];

/**
 * 갱신 성공 시 대기 요청들을 새 토큰으로 재시도한다.
 * 큐를 즉시 비워서 이후 들어오는 요청과 섞이지 않도록 한다.
 */
function processQueueWithToken(newToken: string): void {
  const pending = refreshQueue;
  refreshQueue = [];
  for (const { request, resolve, reject } of pending) {
    request.headers.Authorization = `Bearer ${newToken}`;
    apiClient(request).then(resolve).catch(reject);
  }
}

/**
 * 갱신 실패 시 대기 요청들을 게스트 강등 분기로 보낸다.
 * permitAll GET이면 헤더 없이 재시도, 아니면 동일하게 실패시킨다.
 */
function processQueueWithFailure(error: unknown): void {
  const pending = refreshQueue;
  refreshQueue = [];
  for (const { request, resolve, reject } of pending) {
    handleRefreshFailure(request, error).then(resolve, reject);
  }
}

// ---------------------------------------------------------------------------
// Refresh 실패 시 분기
// ---------------------------------------------------------------------------

/**
 * Refresh가 최종 실패한 요청을 처리한다.
 *
 *   - permitAll GET: Authorization 헤더 제거 후 재시도. 백엔드가 200 게스트 응답을 내려준다.
 *     `_retry === true`이므로 다시 401이 와도 refresh 분기에 재진입하지 않는다.
 *     이 경로는 사용자를 강제 로그아웃시키지 않는다. 인증 상태는 호출자(401 핸들러)가
 *     인증 필수 분기에서만 정리하므로 store는 그대로 둔다.
 *   - 그 외(인증 필수): 인증 상태를 정리하고 로그인 페이지로 리다이렉트한 뒤 원본 에러를 reject한다.
 */
async function handleRefreshFailure(
  request: RetryableRequestConfig,
  error: unknown,
): Promise<AxiosResponse> {
  if (isPermitAllGet(request.method, request.url)) {
    request._skipAuth = true;
    if (request.headers) {
      delete request.headers.Authorization;
    }
    return apiClient(request);
  }

  // 인증 필수 경로에서만 인증 상태를 비운다. 강등 성공 케이스가 휩쓸려 같이 로그아웃되는 일을 막는다.
  clearAuthState();
  if (typeof window !== 'undefined') {
    window.location.href = ROUTES.LOGIN;
  }
  throw error;
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
    const retryable = config as RetryableRequestConfig;
    if (retryable._skipAuth) {
      // 강등 재시도: 헤더가 다시 붙지 않도록 명시적으로 비운다.
      if (config.headers) {
        delete config.headers.Authorization;
      }
      return config;
    }
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
        // 이미 갱신 중 — 큐에 등록하고 갱신 완료(성공/실패) 후 일괄 처리
        originalRequest._retry = true;
        return new Promise<AxiosResponse>((resolve, reject) => {
          refreshQueue.push({ request: originalRequest, resolve, reject });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { accessToken } = await requestTokenRefresh();
        setAccessToken(accessToken);
        processQueueWithToken(accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // 인증 상태 정리는 handleRefreshFailure 내부에서 인증 필수 경로일 때만 수행한다.
        // 그래야 permitAll GET 강등이 성공한 사용자가 함께 로그아웃되지 않는다.
        processQueueWithFailure(refreshError);
        return handleRefreshFailure(originalRequest, refreshError);
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
