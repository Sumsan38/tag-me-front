/**
 * authStore.ts
 *
 * 인증 상태를 관리하는 Zustand 스토어.
 *
 * 설계 원칙:
 *   - Access Token은 메모리(Zustand)에만 보관한다. localStorage/sessionStorage에
 *     저장하면 XSS 공격에 노출되므로 persist 미들웨어를 의도적으로 사용하지 않는다.
 *   - Refresh Token은 서버가 Set-Cookie(HttpOnly)로 관리하며 프론트에서 접근 불가.
 *   - isAuthenticated는 accessToken 유무로 파생되는 값이므로 별도 필드로 저장하지
 *     않고 get()을 통해 매번 계산한다.
 *   - isHydrated는 CSR 레이아웃 가드에서 hydration 완료 전 flash(깜박임)를 막는 데
 *     사용한다. 앱 최초 마운트 후 setHydrated()를 호출해 true로 전환한다.
 *   - clearAuth는 React Query 캐시 초기화도 함께 처리해야 한다. 현재는 TODO로
 *     표시하며, queryClient 참조를 확보한 뒤 연결한다.
 */

import { create } from 'zustand';
import type { User } from '@/types/auth';

// User 타입은 types/auth.ts에서 관리한다.
// authStore 외부에서 User 타입이 필요한 경우 '@/types/auth'에서 직접 import한다.
export type { User };

// ---------------------------------------------------------------------------
// 타입 정의
// ---------------------------------------------------------------------------

export interface AuthState {
  // ── 상태 ────────────────────────────────────────────────────────────────

  /** 메모리에만 보관되는 Access Token (15분 만료). null이면 비인증 상태. */
  accessToken: string | null;

  /** 로그인한 사용자 정보. null이면 비인증 상태. */
  user: User | null;

  /**
   * 클라이언트 hydration 완료 여부.
   * Next.js App Router CSR 페이지에서 서버/클라이언트 상태 불일치로 인한
   * 레이아웃 flash를 방지하기 위해 사용한다.
   */
  isHydrated: boolean;

  // ── Computed ─────────────────────────────────────────────────────────────

  /**
   * 인증 여부. accessToken이 존재하면 true.
   * Zustand get()을 통해 계산되는 파생 값이므로 직접 set하지 않는다.
   */
  isAuthenticated: boolean;

  // ── 액션 ─────────────────────────────────────────────────────────────────

  /**
   * 로그인 성공 시 Access Token과 사용자 정보를 한 번에 저장한다.
   * hooks/useAuth.ts의 로그인 뮤테이션 onSuccess에서 호출한다.
   */
  setAuth: (token: string, user: User) => void;

  /**
   * 토큰 갱신(Silent Refresh) 성공 시 Access Token만 교체한다.
   * api/client.ts의 응답 인터셉터에서 호출한다.
   */
  setAccessToken: (token: string) => void;

  /**
   * 프로필 수정 등 사용자 정보만 업데이트할 때 사용한다.
   * hooks/useAuth.ts의 프로필 수정 뮤테이션 onSuccess에서 호출한다.
   */
  setUser: (user: User) => void;

  /**
   * 로그아웃 또는 회원 탈퇴 시 인증 상태를 초기화한다.
   *
   * React Query 캐시 초기화를 함께 처리해야 한다.
   * TODO(query-cache): queryClient 참조 확보 후 아래 코드를 추가한다.
   *   import { getQueryClient } from '@/providers/QueryProvider';
   *   getQueryClient().clear();
   *
   * 회원 탈퇴 후 호출 시 다음 흐름이 완성된다:
   *   1. userApi.deleteAccount() 호출 → 서버에서 일기 삭제 + 게시글 익명화 + PII 물리 삭제
   *   2. clearAuth() → 메모리 토큰 삭제 + React Query 캐시 초기화
   *   3. router.push(ROUTES.LOGIN) → 로그인 페이지 리다이렉트
   */
  clearAuth: () => void;

  /**
   * 앱 최초 마운트(또는 Silent Refresh 시도) 완료 후 호출해 hydration 상태를 표시한다.
   * 레이아웃 가드에서 isHydrated가 false인 동안은 보호된 UI를 렌더링하지 않는다.
   */
  setHydrated: () => void;
}

// ---------------------------------------------------------------------------
// 스토어 생성
// ---------------------------------------------------------------------------

export const useAuthStore = create<AuthState>()((set, get) => ({
  // ── 초기 상태 ────────────────────────────────────────────────────────────

  accessToken: null,
  user: null,
  isHydrated: false,

  // isAuthenticated는 accessToken을 기반으로 계산되는 파생 값이다.
  // Zustand에서 getter 패턴은 get()을 직접 호출하는 방식으로 구현한다.
  get isAuthenticated() {
    return get().accessToken !== null;
  },

  // ── 액션 구현 ────────────────────────────────────────────────────────────

  setAuth: (token, user) => {
    set({ accessToken: token, user });
  },

  setAccessToken: (token) => {
    set({ accessToken: token });
  },

  setUser: (user) => {
    set({ user });
  },

  clearAuth: () => {
    set({ accessToken: null, user: null });

    // TODO(query-cache): QueryProvider에서 getQueryClient()를 export한 뒤
    // 아래 주석을 해제하여 React Query 캐시를 초기화한다.
    // import { getQueryClient } from '@/providers/QueryProvider';
    // getQueryClient().clear();
  },

  setHydrated: () => {
    set({ isHydrated: true });
  },
}));
