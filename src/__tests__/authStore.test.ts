/**
 * authStore.test.ts
 *
 * Refresh Token HttpOnly Cookie 전환 후 authStore 동작 검증.
 *
 * 검증 항목:
 *   - refreshToken 상태가 완전히 제거되었는지
 *   - setAuth가 (accessToken, user) 시그니처로 동작하는지
 *   - setAccessToken이 accessToken만 저장하는지
 *   - localStorage에 refreshToken이 저장되지 않는지
 *   - clearAuth가 모든 인증 상태를 초기화하는지
 *   - restoreAuth가 refreshToken 없이 복원하는지
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore, selectIsAuthenticated } from '@/stores/authStore';
import type { User } from '@/types/auth';

const mockUser: User = {
  id: 1,
  email: 'test@example.com',
  nickname: '테스터',
  profileImage: null,
  provider: 'local',
};

beforeEach(() => {
  // 스토어 초기화
  useAuthStore.getState().clearAuth();
  useAuthStore.setState({ isHydrated: false });
  localStorage.clear();
});

describe('authStore — refreshToken 제거 검증', () => {
  it('스토어 상태에 refreshToken 필드가 존재하지 않는다', () => {
    const state = useAuthStore.getState();
    expect(state).not.toHaveProperty('refreshToken');
  });

  it('setAuth는 (accessToken, user) 시그니처로 동작한다', () => {
    useAuthStore.getState().setAuth('access-123', mockUser);

    const state = useAuthStore.getState();
    expect(state.accessToken).toBe('access-123');
    expect(state.user).toEqual(mockUser);
    expect(state).not.toHaveProperty('refreshToken');
  });

  it('setAccessToken은 accessToken만 업데이트한다', () => {
    useAuthStore.getState().setAuth('old-token', mockUser);
    useAuthStore.getState().setAccessToken('new-token');

    const state = useAuthStore.getState();
    expect(state.accessToken).toBe('new-token');
    expect(state.user).toEqual(mockUser);
  });

  it('clearAuth는 accessToken, user, rememberMe를 모두 초기화한다', () => {
    useAuthStore.getState().setRememberMe(true);
    useAuthStore.getState().setAuth('access-123', mockUser);
    useAuthStore.getState().clearAuth();

    const state = useAuthStore.getState();
    expect(state.accessToken).toBeNull();
    expect(state.user).toBeNull();
    expect(state.rememberMe).toBe(false);
  });
});

describe('authStore — localStorage 동작', () => {
  it('rememberMe=false일 때 localStorage에 저장하지 않는다', () => {
    useAuthStore.getState().setAuth('access-123', mockUser);

    expect(localStorage.getItem('tag-me:auth')).toBeNull();
  });

  it('rememberMe=true일 때 localStorage에 accessToken + user만 저장한다 (refreshToken 없음)', () => {
    useAuthStore.getState().setRememberMe(true);
    useAuthStore.getState().setAuth('access-123', mockUser);

    const stored = JSON.parse(localStorage.getItem('tag-me:auth')!);
    expect(stored.accessToken).toBe('access-123');
    expect(stored.user).toEqual(mockUser);
    expect(stored).not.toHaveProperty('refreshToken');
  });

  it('setAccessToken 호출 시 rememberMe=true이면 localStorage도 업데이트한다', () => {
    useAuthStore.getState().setRememberMe(true);
    useAuthStore.getState().setAuth('access-123', mockUser);
    useAuthStore.getState().setAccessToken('access-456');

    const stored = JSON.parse(localStorage.getItem('tag-me:auth')!);
    expect(stored.accessToken).toBe('access-456');
  });

  it('clearAuth 시 localStorage가 비워진다', () => {
    useAuthStore.getState().setRememberMe(true);
    useAuthStore.getState().setAuth('access-123', mockUser);
    useAuthStore.getState().clearAuth();

    expect(localStorage.getItem('tag-me:auth')).toBeNull();
  });

  it('restoreAuth는 localStorage에서 accessToken + user를 복원한다', () => {
    localStorage.setItem(
      'tag-me:auth',
      JSON.stringify({ accessToken: 'restored-token', user: mockUser }),
    );

    useAuthStore.getState().restoreAuth();

    const state = useAuthStore.getState();
    expect(state.accessToken).toBe('restored-token');
    expect(state.user).toEqual(mockUser);
    expect(state.rememberMe).toBe(true);
  });
});

describe('authStore — setRememberMe 동기화', () => {
  it('setRememberMe(false) 호출 시 localStorage가 정리된다', () => {
    // 이전 세션에서 rememberMe=true로 저장된 상태를 시뮬레이션
    useAuthStore.getState().setRememberMe(true);
    useAuthStore.getState().setAuth('access-123', mockUser);
    expect(localStorage.getItem('tag-me:auth')).not.toBeNull();

    // 새 로그인에서 rememberMe=false로 전환
    useAuthStore.getState().setRememberMe(false);

    expect(useAuthStore.getState().rememberMe).toBe(false);
    expect(localStorage.getItem('tag-me:auth')).toBeNull();
  });

  it('restoreAuth 후 rememberMe=false로 전환하면 이전 세션 데이터가 정리된다', () => {
    // 이전 세션 데이터가 localStorage에 남아있는 상태
    localStorage.setItem(
      'tag-me:auth',
      JSON.stringify({ accessToken: 'old-token', user: mockUser }),
    );
    useAuthStore.getState().restoreAuth();
    expect(useAuthStore.getState().rememberMe).toBe(true);

    // 새 로그인에서 체크박스 해제
    useAuthStore.getState().setRememberMe(false);

    expect(useAuthStore.getState().rememberMe).toBe(false);
    expect(localStorage.getItem('tag-me:auth')).toBeNull();
  });
});

describe('authStore — selectIsAuthenticated', () => {
  it('accessToken이 있으면 true', () => {
    useAuthStore.getState().setAuth('access-123', mockUser);
    expect(selectIsAuthenticated(useAuthStore.getState())).toBe(true);
  });

  it('accessToken이 없으면 false', () => {
    expect(selectIsAuthenticated(useAuthStore.getState())).toBe(false);
  });
});
