/**
 * authStore.ts
 *
 * 인증 상태를 관리하는 Zustand 스토어.
 *
 * 설계 원칙:
 *   - Access Token은 메모리(Zustand)에 보관한다.
 *   - Refresh Token은 HttpOnly Cookie로 브라우저가 자동 관리한다.
 *     프론트엔드에서 직접 다루지 않는다.
 *   - "로그인 상태 유지" 체크 시 localStorage에 accessToken + user를 저장하여
 *     새 탭/새로고침에서도 인증을 유지한다.
 *   - isAuthenticated는 accessToken 유무로 파생되는 값이므로 selector로 계산한다.
 *   - isHydrated는 CSR 레이아웃 가드에서 hydration 완료 전 flash를 막는 데 사용한다.
 */

import { create } from 'zustand';
import type { User } from '@/types/auth';

export type { User };

// ---------------------------------------------------------------------------
// localStorage 헬퍼
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'tag-me:auth';

interface PersistedAuth {
  accessToken: string;
  user: User;
}

function persistToStorage(data: PersistedAuth): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage 비활성 환경 (Private Browsing 등)에서는 무시
  }
}

function loadFromStorage(): PersistedAuth | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedAuth;
  } catch {
    return null;
  }
}

function clearStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // 무시
  }
}

// ---------------------------------------------------------------------------
// 타입 정의
// ---------------------------------------------------------------------------

export interface AuthState {
  accessToken: string | null;
  user: User | null;
  isHydrated: boolean;

  /** "로그인 상태 유지" 체크 여부. true이면 토큰을 localStorage에도 저장한다. */
  rememberMe: boolean;

  setAuth: (accessToken: string, user: User) => void;
  setAccessToken: (accessToken: string) => void;
  setUser: (user: User) => void;
  clearAuth: () => void;
  setHydrated: () => void;
  setRememberMe: (value: boolean) => void;

  /**
   * 앱 마운트 시 localStorage에서 저장된 인증 정보를 복원한다.
   * AuthHydration에서 호출한다.
   */
  restoreAuth: () => void;
}

// ---------------------------------------------------------------------------
// 스토어 생성
// ---------------------------------------------------------------------------

export const selectIsAuthenticated = (state: AuthState) =>
  state.accessToken !== null;

export const useAuthStore = create<AuthState>()((set, get) => ({
  accessToken: null,
  user: null,
  isHydrated: false,
  rememberMe: false,

  setAuth: (accessToken, user) => {
    set({ accessToken, user });
    if (get().rememberMe) {
      persistToStorage({ accessToken, user });
    }
  },

  setAccessToken: (accessToken) => {
    set({ accessToken });
    // rememberMe 상태에서 토큰 갱신 시 localStorage도 업데이트
    if (get().rememberMe) {
      const user = get().user;
      if (user) {
        persistToStorage({ accessToken, user });
      }
    }
  },

  setUser: (user) => {
    set({ user });
    if (get().rememberMe) {
      const { accessToken } = get();
      if (accessToken) {
        persistToStorage({ accessToken, user });
      }
    }
  },

  clearAuth: () => {
    set({ accessToken: null, user: null, rememberMe: false });
    clearStorage();
  },

  setHydrated: () => {
    set({ isHydrated: true });
  },

  setRememberMe: (value) => {
    set({ rememberMe: value });
    // false로 전환 시 이전 세션에서 남아 있을 수 있는 localStorage를 정리한다.
    if (!value) {
      clearStorage();
    }
  },

  restoreAuth: () => {
    const persisted = loadFromStorage();
    if (persisted) {
      set({
        accessToken: persisted.accessToken,
        user: persisted.user,
        rememberMe: true,
      });
    }
  },
}));
