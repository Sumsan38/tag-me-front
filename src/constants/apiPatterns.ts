/**
 * apiPatterns.ts
 *
 * 백엔드 API 접근 권한 패턴 상수 및 판별 함수.
 * 백엔드 권한 정책이 변경될 때 이 파일만 수정하면 된다.
 */

/**
 * 401 응답 시 토큰 갱신(Silent Refresh)을 시도하지 않을 경로 목록.
 * 로그인·회원가입 등 인증 엔드포인트 자체의 401은
 * "잘못된 credentials" 의미이므로 갱신 대상이 아니다.
 */
export const AUTH_ENDPOINTS: ReadonlyArray<string> = [
  '/api/v1/auth/login',
  '/api/v1/auth/register',
  '/api/v1/auth/refresh',
];

export function isAuthEndpoint(url: string | undefined): boolean {
  if (!url) return false;
  return AUTH_ENDPOINTS.some((endpoint) => url.includes(endpoint));
}

/**
 * 백엔드가 비로그인 호출도 허용하는 GET 엔드포인트 패턴.
 * feedId/commentId는 숫자형 ID로 제한해 /feeds/following 같은 인증 필수 sub-route를
 * 우연히 강등 대상으로 잡지 않도록 한다.
 */
export const PERMIT_ALL_GET_PATTERNS: ReadonlyArray<RegExp> = [
  /^\/api\/v1\/feeds$/,
  /^\/api\/v1\/feeds\/\d+$/,
  /^\/api\/v1\/feeds\/\d+\/comments$/,
  /^\/api\/v1\/feeds\/\d+\/comments\/\d+\/replies$/,
  /^\/api\/v1\/search$/,
  /^\/api\/v1\/search\/autocomplete$/,
];

/**
 * 주어진 method+url이 게스트 강등 가능한 permitAll GET인지 판정한다.
 *
 * - method가 GET이 아닐 경우 항상 false (POST 등은 강등하면 멱등성을 깬다).
 * - url에 query string이나 origin이 포함되어 있어도 안전하게 path만 추출해 매칭.
 * - 호출자가 url을 비워서 호출한 비정상 케이스는 false.
 *
 * 테스트를 위해 export한다.
 */
export function isPermitAllGet(
  method: string | undefined,
  url: string | undefined,
): boolean {
  if (!url) return false;
  if ((method ?? 'get').toLowerCase() !== 'get') return false;
  // origin과 query 제거 후 path만 비교
  const path = url.split('?')[0].replace(/^https?:\/\/[^/]+/, '');
  return PERMIT_ALL_GET_PATTERNS.some((pattern) => pattern.test(path));
}
