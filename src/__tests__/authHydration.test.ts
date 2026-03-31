/**
 * authHydration.test.ts
 *
 * AuthHydration 컴포넌트의 실제 렌더링을 통한 hydration 흐름 검증.
 *
 * 검증 항목:
 *   - localStorage에 토큰이 있으면 복원 후 silent refresh를 건너뛴다
 *   - localStorage에 토큰이 없으면 silent refresh를 시도한다
 *   - silent refresh 성공 시 accessToken이 저장된다
 *   - silent refresh 실패 시 비인증 상태로 hydration 완료된다
 *   - children을 그대로 렌더링한다
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, act, cleanup } from '@testing-library/react';
import { createElement } from 'react';
import { useAuthStore } from '@/stores/authStore';
import AuthHydration from '@/providers/AuthHydration';

// silentRefresh mock
const mockSilentRefresh = vi.fn();
vi.mock('@/api/auth', () => ({
  silentRefresh: (...args: unknown[]) => mockSilentRefresh(...args),
}));

beforeEach(() => {
  useAuthStore.getState().clearAuth();
  useAuthStore.setState({ isHydrated: false });
  localStorage.clear();
  mockSilentRefresh.mockReset();
});

afterEach(() => {
  cleanup();
});

/**
 * useEffect + async 로직이 완료될 때까지 기다리는 헬퍼.
 */
async function flushEffects() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

describe('AuthHydration — 컴포넌트 렌더링 기반 검증', () => {
  it('localStorage에 토큰이 있으면 복원하고 silentRefresh를 호출하지 않는다', async () => {
    localStorage.setItem(
      'tag-me:auth',
      JSON.stringify({
        accessToken: 'stored-token',
        user: { id: 1, email: 'a@b.com', nickname: 'n', profileImage: null, provider: 'local' },
      }),
    );

    render(createElement(AuthHydration, null, createElement('div')));
    await flushEffects();

    expect(mockSilentRefresh).not.toHaveBeenCalled();
    expect(useAuthStore.getState().accessToken).toBe('stored-token');
    expect(useAuthStore.getState().isHydrated).toBe(true);
  });

  it('localStorage에 토큰이 없으면 silentRefresh를 시도하고 성공 시 accessToken을 저장한다', async () => {
    mockSilentRefresh.mockResolvedValueOnce({ accessToken: 'refreshed-token' });

    render(createElement(AuthHydration, null, createElement('div')));
    await flushEffects();

    expect(mockSilentRefresh).toHaveBeenCalledTimes(1);
    expect(useAuthStore.getState().accessToken).toBe('refreshed-token');
    expect(useAuthStore.getState().isHydrated).toBe(true);
  });

  it('silentRefresh 실패 시 비인증 상태로 hydration 완료된다', async () => {
    mockSilentRefresh.mockRejectedValueOnce(new Error('No cookie'));

    render(createElement(AuthHydration, null, createElement('div')));
    await flushEffects();

    expect(mockSilentRefresh).toHaveBeenCalledTimes(1);
    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(useAuthStore.getState().isHydrated).toBe(true);
  });

  it('children을 그대로 렌더링한다', async () => {
    mockSilentRefresh.mockRejectedValueOnce(new Error('fail'));

    const { container } = render(
      createElement(AuthHydration, null, createElement('span', null, 'hello')),
    );
    await flushEffects();

    expect(container.querySelector('span')?.textContent).toBe('hello');
  });
});
