/**
 * error.ts
 *
 * API 에러 핸들링 유틸리티.
 *
 * - 도메인별 에러 코드 → 사용자 메시지 매핑
 * - HTTP 상태 코드별 기본 메시지
 * - toast 알림 연동 (TODO: toast 컴포넌트 구현 후 실제 연동)
 *
 * 의존 관계:
 *   - ApiError, isApiError: @/api/client
 *   - toast: TODO(toast) — 구현 전까지 console.error 로 대체
 */

import { isApiError } from '@/api/client';

// ---------------------------------------------------------------------------
// 로컬 타입 정의
// ---------------------------------------------------------------------------

/**
 * toast 메시지의 심각도.
 * TODO(toast): 실제 toast 컴포넌트의 variant 타입과 맞추어 교체한다.
 */
type ToastVariant = 'error' | 'warning' | 'info';

// ---------------------------------------------------------------------------
// Toast Placeholder
// ---------------------------------------------------------------------------

/**
 * toast 표시 함수.
 *
 * TODO(toast): 실제 toast 컴포넌트 구현 후 아래 구현으로 교체한다.
 *
 * ```ts
 * import { toast } from '@/components/common/Toast';
 * toast({ message, variant });
 * ```
 */
function showToast(message: string, variant: ToastVariant = 'error'): void {
  // toast 컴포넌트 미구현 — console 출력으로 대체
  if (process.env.NODE_ENV !== 'production') {
    console.error(`[Toast/${variant.toUpperCase()}] ${message}`);
  }
}

// ---------------------------------------------------------------------------
// 도메인별 에러 코드 → 사용자 메시지 매핑
// ---------------------------------------------------------------------------

const ERROR_MESSAGES: Record<string, string> = {
  // ---- Identity ------------------------------------------------------------
  IDENTITY_001: '사용자를 찾을 수 없습니다.',
  IDENTITY_002: '이미 사용 중인 이메일입니다.',
  IDENTITY_003: '이메일 또는 비밀번호가 올바르지 않습니다.',
  IDENTITY_004: '삭제된 사용자는 수정할 수 없습니다.',
  IDENTITY_005: '닉네임은 2자 이상 20자 이하여야 합니다.',
  IDENTITY_006: '올바르지 않은 이메일 형식입니다.',
  IDENTITY_007: '이미 연결된 인증 제공자입니다.',
  IDENTITY_008: '소셜 로그인 전용 계정은 비밀번호를 사용할 수 없습니다.',
  IDENTITY_009: '유효하지 않거나 만료된 OAuth 인증 요청입니다.',
  IDENTITY_010: 'OAuth 인가 코드 교환에 실패했습니다.',
  IDENTITY_011: 'OAuth 사용자 정보 조회에 실패했습니다.',
  IDENTITY_012: 'OAuth 제공자가 이메일을 제공하지 않았습니다.',
  IDENTITY_013: '지원하지 않는 OAuth 제공자입니다.',

  // ---- Diary ---------------------------------------------------------------
  DIARY_001: '일기를 찾을 수 없습니다.',
  DIARY_002: '일기 작성 권한이 없습니다.',
  DIARY_012: '해당 날짜에 이미 일기가 존재합니다.',

  // ---- Feed ----------------------------------------------------------------
  FEED_001: '게시글을 찾을 수 없습니다.',
  FEED_002: '이미 좋아요를 누른 게시글입니다.',

  // ---- Tag -----------------------------------------------------------------
  TAG_001: '태그를 찾을 수 없습니다.',
  TAG_002: '태그 형식이 올바르지 않습니다.',

  // ---- Search --------------------------------------------------------------
  SEARCH_001: '검색어를 입력해주세요.',

  // ---- Social --------------------------------------------------------------
  SOCIAL_001: '이미 팔로우 중입니다.',
  SOCIAL_002: '써클을 찾을 수 없습니다.',

  // ---- Notification --------------------------------------------------------
  NOTIFICATION_001: '알림을 찾을 수 없습니다.',

  // ---- 공통 ----------------------------------------------------------------
  COMMON_001: '요청을 처리할 수 없습니다.',
  COMMON_002: '권한이 없습니다.',
  COMMON_003: '서버 오류가 발생했습니다.',
};

// ---------------------------------------------------------------------------
// HTTP 상태 코드 → 기본 메시지 매핑
// ---------------------------------------------------------------------------

const HTTP_STATUS_MESSAGES: Record<number, string> = {
  400: '잘못된 요청입니다.',
  401: '인증이 필요합니다.',
  403: '접근 권한이 없습니다.',
  404: '요청한 리소스를 찾을 수 없습니다.',
  409: '요청이 충돌하였습니다.',
  429: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
  500: '서버 오류가 발생했습니다.',
  502: '서버에 일시적인 문제가 발생했습니다.',
  503: '서비스를 일시적으로 사용할 수 없습니다.',
};

const FALLBACK_MESSAGE = '알 수 없는 오류가 발생했습니다.';
const NETWORK_ERROR_MESSAGE = '네트워크 연결을 확인해주세요.';

// ---------------------------------------------------------------------------
// 공개 유틸 함수
// ---------------------------------------------------------------------------

/**
 * error 값에서 사용자에게 표시할 메시지를 추출한다.
 *
 * 우선순위:
 *   1. ApiError.code → ERROR_MESSAGES 매핑 값
 *   2. ApiError.status → HTTP_STATUS_MESSAGES 매핑 값
 *   3. ApiError.message (서버 원문)
 *   4. 네트워크 오류(status 없음) → NETWORK_ERROR_MESSAGE
 *   5. Error.message
 *   6. FALLBACK_MESSAGE
 */
export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    // 1. 도메인 에러 코드 매핑
    const mapped = ERROR_MESSAGES[error.code];
    if (mapped) return mapped;

    // 2. HTTP 상태 코드 기본 메시지
    if (error.status !== undefined) {
      const statusMsg = HTTP_STATUS_MESSAGES[error.status];
      if (statusMsg) return statusMsg;
    }

    // 3. 서버가 내려보낸 원문 메시지
    if (error.message) return error.message;

    return FALLBACK_MESSAGE;
  }

  // 네트워크 오류 (fetch/axios 연결 실패 등)
  if (isNetworkError(error)) {
    return NETWORK_ERROR_MESSAGE;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return FALLBACK_MESSAGE;
}

/**
 * API 에러를 분석하여 적절한 toast를 표시한다.
 *
 * HTTP 상태에 따른 처리:
 *   - 403: 'warning' variant
 *   - 429: 'warning' variant
 *   - 5xx: 'error' variant
 *   - 그 외: 'error' variant
 *
 * TODO(toast): toast 컴포넌트 구현 후 429에 재시도 타이머 표시 추가.
 * TODO(router): 403 처리 시 이전 페이지 이동 로직 추가
 *   (현재는 메시지 표시만 수행).
 */
export function handleApiError(error: unknown): void {
  const message = getErrorMessage(error);
  const status = isApiError(error) ? error.status : undefined;

  const variant: ToastVariant = (() => {
    if (status === 403 || status === 429) return 'warning';
    return 'error';
  })();

  showToast(message, variant);
}

// ---------------------------------------------------------------------------
// 내부 헬퍼
// ---------------------------------------------------------------------------

/**
 * axios 또는 fetch 가 네트워크 연결 자체에 실패했는지 판별한다.
 * axios 에서는 error.request 가 존재하고 error.response 가 없을 때 해당한다.
 */
function isNetworkError(error: unknown): boolean {
  if (error == null || typeof error !== 'object') return false;

  const e = error as Record<string, unknown>;

  // axios 네트워크 에러: request 있음, response 없음
  if ('request' in e && !('response' in e)) return true;

  // fetch AbortError 또는 TypeError (Failed to fetch)
  if (error instanceof TypeError) return true;

  return false;
}
