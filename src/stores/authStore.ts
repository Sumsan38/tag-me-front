/**
 * authStore.ts
 *
 * 인증 상태를 관리하는 Zustand 스토어.
 *
 * 설계 원칙:
 *   - 기본적으로 Access Token과 Refresh Token은 메모리(Zustand)에만 보관한다.
 *   - "로그인 상태 유지" 체크 시에만 localStorage에 토큰을 저장하여
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
  refreshToken: string;
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
  refreshToken: string | null;
  user: User | null;
  isHydrated: boolean;

  /** "로그인 상태 유지" 체크 여부. true이면 토큰을 localStorage에도 저장한다. */
  rememberMe: boolean;

  setAuth: (accessToken: string, refreshToken: string, user: User) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
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
  refreshToken: null,
  user: null,
  isHydrated: false,
  rememberMe: false,

  setAuth: (accessToken, refreshToken, user) => {
    set({ accessToken, refreshToken, user });
    if (get().rememberMe) {
      persistToStorage({ accessToken, refreshToken, user });
    }
  },

  setTokens: (accessToken, refreshToken) => {
    set({ accessToken, refreshToken });
    // rememberMe 상태에서 토큰 갱신 시 localStorage도 업데이트
    if (get().rememberMe) {
      const user = get().user;
      if (user) {
        persistToStorage({ accessToken, refreshToken, user });
      }
    }
  },

  setUser: (user) => {
    set({ user });
    if (get().rememberMe) {
      const { accessToken, refreshToken } = get();
      if (accessToken && refreshToken) {
        persistToStorage({ accessToken, refreshToken, user });
      }
    }
  },

  clearAuth: () => {
    set({ accessToken: null, refreshToken: null, user: null, rememberMe: false });
    clearStorage();
  },

  setHydrated: () => {
    set({ isHydrated: true });
  },

  setRememberMe: (value) => {
    set({ rememberMe: value });
  },

  restoreAuth: () => {
    const persisted = loadFromStorage();
    if (persisted) {
      set({
        accessToken: persisted.accessToken,
        refreshToken: persisted.refreshToken,
        user: persisted.user,
        rememberMe: true,
      });
    }
  },
}));
