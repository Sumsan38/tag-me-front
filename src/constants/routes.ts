/**
 * routes.ts
 *
 * 서비스 전체 라우트 경로 상수 및 접근 정책 정의.
 *
 * access:
 *   - "guest"  : 비로그인 전용. 인증 상태면 홈(/)으로 리다이렉트.
 *   - "public" : 인증 여부와 무관하게 접근 가능.
 *   - "auth"   : 로그인 필수. 비로그인 시 /login으로 리다이렉트.
 *
 * renderStrategy:
 *   - "SSR"  : async Server Component, generateMetadata() 포함
 *   - "CSR"  : 'use client' + 인증 상태 확인 후 렌더링
 *   - "ISR"  : export const revalidate = 3600 설정
 */

// ---------------------------------------------------------------------------
// 경로 상수
// ---------------------------------------------------------------------------

export const ROUTES = {
  // 루트
  HOME: '/',

  // Guest 전용
  LOGIN: '/login',
  REGISTER: '/register',
  OAUTH_CALLBACK: '/oauth/callback',

  // Public
  FEED: '/feed',
  FEED_DETAIL: (id: string) => `/feed/${id}`,
  USER_PROFILE: (id: string) => `/users/${id}`,
  TRENDING: '/trending',
  CHALLENGE_DETAIL: (id: string) => `/challenges/${id}`,
  CIRCLE_DETAIL: (id: string) => `/circles/${id}`,

  // Auth
  FEED_WRITE: '/feed/write',
  DIARY: '/diary',
  DIARY_WRITE: '/diary/write',
  DIARY_DETAIL: (id: string) => `/diary/${id}`,
  DIARY_EDIT: (id: string) => `/diary/${id}/edit`,
  MINDMAP: '/mindmap',
  SEARCH: '/search',
  NOTIFICATIONS: '/notifications',
  MYPAGE: '/mypage',
  MYPAGE_EDIT: '/mypage/edit',
  MYPAGE_REPORT: '/mypage/report',
  MYPAGE_SETTINGS: '/mypage/settings',
  SOCIAL_CIRCLES: '/social/circles',
  SOCIAL_CHALLENGES: '/social/challenges',
  SOCIAL_TAG_FRIENDS: '/social/tag-friends',

  // 정적
  TERMS: '/terms',
  PRIVACY: '/privacy',
  REPORT_SHARE: (id: string) => `/reports/${id}`,
} as const;

// ---------------------------------------------------------------------------
// 접근 정책 타입
// ---------------------------------------------------------------------------

export type AccessPolicy = 'guest' | 'public' | 'auth';
export type RenderStrategy = 'SSR' | 'CSR' | 'ISR';

export interface RoutePolicy {
  /** 라우트 경로 패턴 (Next.js App Router 규칙 준수) */
  pattern: string;
  /** 접근 권한 */
  access: AccessPolicy;
  /** 렌더링 전략 */
  renderStrategy: RenderStrategy;
  /** revalidate 초 단위 (ISR 전용) */
  revalidateSeconds?: number;
  /** 간략 설명 */
  description: string;
}

// ---------------------------------------------------------------------------
// 라우트 정책 목록
// ---------------------------------------------------------------------------

export const ROUTE_POLICIES: RoutePolicy[] = [
  // ---- 홈 ----------------------------------------------------------------
  {
    pattern: '/',
    access: 'public',
    renderStrategy: 'SSR',
    description: '홈 — 인증 시 피드, 비인증 시 랜딩 페이지',
  },

  // ---- Guest 전용 --------------------------------------------------------
  {
    pattern: '/login',
    access: 'guest',
    renderStrategy: 'CSR',
    description: '로그인 (OAuth Google + Kakao)',
  },
  {
    pattern: '/register',
    access: 'guest',
    renderStrategy: 'CSR',
    description: '회원가입 (이메일/비밀번호 + OAuth)',
  },
  {
    pattern: '/oauth/callback',
    access: 'guest',
    renderStrategy: 'CSR',
    description: 'OAuth 소셜 로그인 콜백 처리',
  },

  // ---- Public ------------------------------------------------------------
  {
    pattern: '/feed',
    access: 'public',
    renderStrategy: 'SSR',
    description: '공개 피드',
  },
  {
    pattern: '/feed/[id]',
    access: 'public',
    renderStrategy: 'SSR',
    description: '게시글 상세',
  },
  {
    pattern: '/users/[id]',
    access: 'public',
    renderStrategy: 'SSR',
    description: '사용자 공개 프로필',
  },
  {
    pattern: '/trending',
    access: 'public',
    renderStrategy: 'ISR',
    revalidateSeconds: 3600,
    description: '트렌딩 태그 (1시간 캐시)',
  },
  {
    pattern: '/challenges/[id]',
    access: 'public',
    renderStrategy: 'SSR',
    description: '챌린지 상세',
  },
  {
    pattern: '/circles/[id]',
    access: 'public',
    renderStrategy: 'SSR',
    description: '써클 상세',
  },
  {
    pattern: '/terms',
    access: 'public',
    renderStrategy: 'SSR',
    description: '이용약관',
  },
  {
    pattern: '/privacy',
    access: 'public',
    renderStrategy: 'SSR',
    description: '개인정보처리방침',
  },
  {
    pattern: '/reports/[id]',
    access: 'public',
    renderStrategy: 'SSR',
    description: '월간 리포트 공유 (OG 메타태그 포함)',
  },

  // ---- Auth (로그인 필수) -------------------------------------------------
  {
    pattern: '/feed/write',
    access: 'auth',
    renderStrategy: 'CSR',
    description: '게시글 작성',
  },
  {
    pattern: '/diary',
    access: 'auth',
    renderStrategy: 'CSR',
    description: '개인 일기 목록',
  },
  {
    pattern: '/diary/write',
    access: 'auth',
    renderStrategy: 'CSR',
    description: '일기 작성',
  },
  {
    pattern: '/diary/[id]',
    access: 'auth',
    renderStrategy: 'CSR',
    description: '일기 상세 (본인 소유 확인 필요)',
  },
  {
    pattern: '/diary/[id]/edit',
    access: 'auth',
    renderStrategy: 'CSR',
    description: '일기 수정 (본인 소유 확인 필요)',
  },
  {
    pattern: '/mindmap',
    access: 'auth',
    renderStrategy: 'CSR',
    description: '태그 마인드맵 (D3.js 인터랙티브)',
  },
  {
    pattern: '/search',
    access: 'auth',
    renderStrategy: 'CSR',
    description: '통합 검색 (일기[본인 전용] + 피드[공개])',
  },
  {
    pattern: '/notifications',
    access: 'auth',
    renderStrategy: 'CSR',
    description: '알림 목록',
  },
  {
    pattern: '/mypage',
    access: 'auth',
    renderStrategy: 'CSR',
    description: '마이페이지',
  },
  {
    pattern: '/mypage/edit',
    access: 'auth',
    renderStrategy: 'CSR',
    description: '프로필 수정',
  },
  {
    pattern: '/mypage/report',
    access: 'auth',
    renderStrategy: 'CSR',
    description: '월간 리포트 (본인)',
  },
  {
    pattern: '/mypage/settings',
    access: 'auth',
    renderStrategy: 'CSR',
    description: '계정 설정',
  },
  {
    pattern: '/social/circles',
    access: 'auth',
    renderStrategy: 'CSR',
    description: '써클 목록',
  },
  {
    pattern: '/social/challenges',
    access: 'auth',
    renderStrategy: 'CSR',
    description: '챌린지 목록',
  },
  {
    pattern: '/social/tag-friends',
    access: 'auth',
    renderStrategy: 'CSR',
    description: '태그 친구',
  },
];

// ---------------------------------------------------------------------------
// 접근 정책별 경로 집합 (미들웨어·가드에서 매처로 활용)
// ---------------------------------------------------------------------------

// 미들웨어 matcher 변환 주의: /diary/[id] → /diary/:id*
// ROUTE_POLICIES.pattern은 App Router 파일 시스템 규칙을 따르며,
// middleware.ts의 config.matcher에서는 path-to-regexp 패턴으로 변환 필요

/** 비로그인 전용 경로 패턴 목록 */
export const GUEST_ROUTE_PATTERNS = ROUTE_POLICIES.filter(
  (r) => r.access === 'guest',
).map((r) => r.pattern);

/** 로그인 필수 경로 패턴 목록 */
export const AUTH_ROUTE_PATTERNS = ROUTE_POLICIES.filter(
  (r) => r.access === 'auth',
).map((r) => r.pattern);

/** 공개 접근 경로 패턴 목록 */
export const PUBLIC_ROUTE_PATTERNS = ROUTE_POLICIES.filter(
  (r) => r.access === 'public',
).map((r) => r.pattern);
