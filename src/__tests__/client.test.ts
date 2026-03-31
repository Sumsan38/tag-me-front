/**
 * client.test.ts
 *
 * API 클라이언트(client.ts) 동작 검증.
 *
 * 검증 항목:
 *   - apiClient에 withCredentials: true가 설정되어 있는지
 *   - Request Interceptor가 Authorization 헤더에 Access Token을 첨부하는지
 *   - 401 응답 시 Response Interceptor가 body 없이 withCredentials: true로 refresh를 호출하는지
 *   - refresh 성공 후 원래 요청을 재시도하는지
 *   - refresh 실패 시 인증 상태가 초기화되는지
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import type { AxiosAdapter, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

// ---------------------------------------------------------------------------
// authStore mock
// ---------------------------------------------------------------------------

const mockState = {
  accessToken: 'test-access-token' as string | null,
  user: null,
  setAccessToken: vi.fn(),
  clearAuth: vi.fn(),
};

vi.mock('@/stores/authStore', () => ({
  useAuthStore: {
    getState: () => mockState,
  },
}));

vi.mock('@/constants/routes', () => ({
  ROUTES: { LOGIN: '/login' },
}));

// ---------------------------------------------------------------------------
// axios.post spy (requestTokenRefresh 내부 호출 감시)
// ---------------------------------------------------------------------------

let axiosPostSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  mockState.accessToken = 'test-access-token';
  mockState.setAccessToken.mockClear();
  mockState.clearAuth.mockClear();
  axiosPostSpy = vi.spyOn(axios, 'post');
});

afterEach(() => {
  axiosPostSpy.mockRestore();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('apiClient — 기본 설정', () => {
  it('withCredentials: true가 설정되어 있다', async () => {
    const { default: apiClient } = await import('@/api/client');
    expect(apiClient.defaults.withCredentials).toBe(true);
  });
});

describe('apiClient — Request Interceptor', () => {
  it('accessToken이 있으면 Authorization 헤더에 Bearer 토큰을 첨부한다', async () => {
    const { default: apiClient } = await import('@/api/client');

    // adapter를 교체하여 실제 HTTP 요청 없이 config를 캡처한다
    let capturedConfig: InternalAxiosRequestConfig | null = null;
    const mockAdapter: AxiosAdapter = (config) => {
      capturedConfig = config;
      return Promise.resolve({
        data: { success: true, data: {}, timestamp: '' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      } as AxiosResponse);
    };

    await apiClient.get('/test', { adapter: mockAdapter });

    expect(capturedConfig).not.toBeNull();
    expect(capturedConfig!.headers.Authorization).toBe('Bearer test-access-token');
  });

  it('accessToken이 없으면 Authorization 헤더를 첨부하지 않는다', async () => {
    mockState.accessToken = null;
    const { default: apiClient } = await import('@/api/client');

    let capturedConfig: InternalAxiosRequestConfig | null = null;
    const mockAdapter: AxiosAdapter = (config) => {
      capturedConfig = config;
      return Promise.resolve({
        data: { success: true, data: {}, timestamp: '' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      } as AxiosResponse);
    };

    await apiClient.get('/test', { adapter: mockAdapter });

    expect(capturedConfig!.headers.Authorization).toBeUndefined();
  });
});

describe('apiClient — 401 Response Interceptor (토큰 갱신)', () => {
  it('401 응답 시 body=null, withCredentials=true로 refresh를 호출하고, 성공 시 원래 요청을 재시도한다', async () => {
    const { default: apiClient } = await import('@/api/client');

    // refresh 성공 응답 mock
    axiosPostSpy.mockResolvedValueOnce({
      data: {
        success: true,
        data: { accessToken: 'new-access-token' },
        timestamp: new Date().toISOString(),
      },
    });

    let callCount = 0;
    const mockAdapter: AxiosAdapter = (config) => {
      callCount++;
      if (callCount === 1) {
        // 첫 번째 호출: 401 에러
        return Promise.reject({
          response: {
            status: 401,
            data: { success: false, error: { code: 'AUTH_001', message: 'Unauthorized' } },
          },
          config,
        });
      }
      // 두 번째 호출(재시도): 성공
      return Promise.resolve({
        data: { success: true, data: { result: 'ok' }, timestamp: '' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      } as AxiosResponse);
    };

    const response = await apiClient.get('/api/v1/some-endpoint', { adapter: mockAdapter });

    // refresh 호출 검증: body=null, withCredentials=true
    expect(axiosPostSpy).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/auth/refresh'),
      null,
      expect.objectContaining({ withCredentials: true }),
    );

    // setAccessToken이 새 토큰으로 호출됨
    expect(mockState.setAccessToken).toHaveBeenCalledWith('new-access-token');

    // 원래 요청 재시도 성공
    expect(response.data).toEqual({ result: 'ok' });
    expect(callCount).toBe(2);
  });

  it('refresh 실패 시 clearAuth가 호출된다', async () => {
    const { default: apiClient } = await import('@/api/client');

    // refresh 실패 mock
    axiosPostSpy.mockRejectedValueOnce(new Error('Refresh failed'));

    // window.location.href 세팅 방지
    const originalLocation = window.location;
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { ...originalLocation, href: '' },
    });

    const mockAdapter: AxiosAdapter = (config) => {
      return Promise.reject({
        response: {
          status: 401,
          data: {},
        },
        config,
      });
    };

    await expect(
      apiClient.get('/api/v1/some-endpoint', { adapter: mockAdapter }),
    ).rejects.toBeDefined();

    expect(mockState.clearAuth).toHaveBeenCalled();

    // location 복원
    Object.defineProperty(window, 'location', {
      writable: true,
      value: originalLocation,
    });
  });

  it('인증 엔드포인트(/api/v1/auth/login 등)의 401에는 refresh를 시도하지 않는다', async () => {
    const { default: apiClient } = await import('@/api/client');

    const mockAdapter: AxiosAdapter = (config) => {
      return Promise.reject({
        response: {
          status: 401,
          data: { success: false, error: { code: 'AUTH_001', message: 'Bad credentials' } },
        },
        config,
      });
    };

    await expect(
      apiClient.post('/api/v1/auth/login', {}, { adapter: mockAdapter }),
    ).rejects.toBeDefined();

    // refresh 호출이 없어야 한다
    expect(axiosPostSpy).not.toHaveBeenCalled();
  });
});
