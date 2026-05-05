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

// clearAuth / setAccessToken은 실제 store 동작과 동기화한다.
// (실제 store는 accessToken을 갱신/제거하므로 다음 request interceptor 실행 시 헤더 부착 여부가 달라진다.)
const mockState = {
  accessToken: 'test-access-token' as string | null,
  user: null as unknown,
  setAccessToken: vi.fn((token: string) => {
    mockState.accessToken = token;
  }),
  clearAuth: vi.fn(() => {
    mockState.accessToken = null;
    mockState.user = null;
  }),
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

// ---------------------------------------------------------------------------
// isPermitAllGet — permitAll GET 경로 매칭
// ---------------------------------------------------------------------------

describe('isPermitAllGet', () => {
  it('GET /api/v1/feeds 는 permitAll로 인식한다', async () => {
    const { isPermitAllGet } = await import('@/api/client');
    expect(isPermitAllGet('get', '/api/v1/feeds')).toBe(true);
  });

  it('GET /api/v1/feeds/123 (상세)는 permitAll로 인식한다', async () => {
    const { isPermitAllGet } = await import('@/api/client');
    expect(isPermitAllGet('GET', '/api/v1/feeds/123')).toBe(true);
  });

  it('GET /api/v1/feeds/123/comments 는 permitAll로 인식한다', async () => {
    const { isPermitAllGet } = await import('@/api/client');
    expect(isPermitAllGet('get', '/api/v1/feeds/123/comments')).toBe(true);
  });

  it('GET /api/v1/feeds/12/comments/34/replies 는 permitAll로 인식한다', async () => {
    const { isPermitAllGet } = await import('@/api/client');
    expect(isPermitAllGet('get', '/api/v1/feeds/12/comments/34/replies')).toBe(true);
  });

  it('GET /api/v1/search 는 permitAll로 인식한다', async () => {
    const { isPermitAllGet } = await import('@/api/client');
    expect(isPermitAllGet('get', '/api/v1/search?q=hi')).toBe(true);
  });

  it('GET /api/v1/search/autocomplete 는 permitAll로 인식한다', async () => {
    const { isPermitAllGet } = await import('@/api/client');
    expect(isPermitAllGet('get', '/api/v1/search/autocomplete?q=h&limit=5')).toBe(true);
  });

  it('POST /api/v1/feeds 는 permitAll이 아니다 (POST는 강등 대상이 아님)', async () => {
    const { isPermitAllGet } = await import('@/api/client');
    expect(isPermitAllGet('post', '/api/v1/feeds')).toBe(false);
  });

  it('GET /api/v1/diaries 는 permitAll이 아니다', async () => {
    const { isPermitAllGet } = await import('@/api/client');
    expect(isPermitAllGet('get', '/api/v1/diaries')).toBe(false);
  });

  it('GET /api/v1/feeds/following (인증 필수)은 permitAll이 아니다', async () => {
    const { isPermitAllGet } = await import('@/api/client');
    expect(isPermitAllGet('get', '/api/v1/feeds/following')).toBe(false);
  });

  it('url에 origin이 포함되어도 path 기준으로 매칭한다', async () => {
    const { isPermitAllGet } = await import('@/api/client');
    expect(isPermitAllGet('get', 'https://api.example.com/api/v1/search')).toBe(true);
  });

  it('url이 비어있으면 false', async () => {
    const { isPermitAllGet } = await import('@/api/client');
    expect(isPermitAllGet('get', undefined)).toBe(false);
    expect(isPermitAllGet('get', '')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 401 + refresh 실패 → 게스트 강등 회귀 테스트
// ---------------------------------------------------------------------------

describe('apiClient — refresh 실패 시 게스트 강등', () => {
  it('permitAll GET 경로의 401 + refresh 실패 시 Authorization 헤더 없이 재시도하여 200을 반환하고, 사용자는 로그아웃되지 않는다', async () => {
    const { default: apiClient } = await import('@/api/client');

    // refresh 실패
    axiosPostSpy.mockRejectedValueOnce(new Error('Refresh failed'));

    // window.location.href 세팅 방지 (강등 분기에서는 호출되지 않아야 함)
    const originalLocation = window.location;
    const locationStub: { href: string } = { href: '' };
    Object.defineProperty(window, 'location', {
      writable: true,
      value: locationStub,
    });

    const seenAuthHeaders: Array<string | undefined> = [];
    let callCount = 0;
    const mockAdapter: AxiosAdapter = (config) => {
      callCount++;
      seenAuthHeaders.push(config.headers.Authorization as string | undefined);
      if (callCount === 1) {
        return Promise.reject({
          response: {
            status: 401,
            data: { success: false, error: { code: 'AUTH_001', message: 'invalid token' } },
          },
          config,
        });
      }
      // 강등 재시도: 백엔드가 200 게스트 응답을 보낸다고 가정
      return Promise.resolve({
        data: { success: true, data: { items: [], hasNext: false }, timestamp: '' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      } as AxiosResponse);
    };

    const response = await apiClient.get('/api/v1/search?q=hi', { adapter: mockAdapter });

    // 첫 호출은 토큰 첨부, 재시도 호출은 _skipAuth 플래그로 헤더 미첨부
    expect(seenAuthHeaders[0]).toBe('Bearer test-access-token');
    expect(seenAuthHeaders[1]).toBeUndefined();

    // 200 게스트 응답이 정상 통과
    expect(response.data).toEqual({ items: [], hasNext: false });
    expect(callCount).toBe(2);

    // 강등 성공 케이스이므로 인증 상태는 보존되고 로그인 리다이렉트도 없다
    expect(mockState.clearAuth).not.toHaveBeenCalled();
    expect(mockState.accessToken).toBe('test-access-token');
    expect(locationStub.href).toBe('');

    Object.defineProperty(window, 'location', {
      writable: true,
      value: originalLocation,
    });
  });

  it('인증 필수 경로의 401 + refresh 실패 시 /login으로 리다이렉트하고 reject한다', async () => {
    const { default: apiClient } = await import('@/api/client');

    axiosPostSpy.mockRejectedValueOnce(new Error('Refresh failed'));

    const originalLocation = window.location;
    const locationStub: { href: string } = { href: '' };
    Object.defineProperty(window, 'location', {
      writable: true,
      value: locationStub,
    });

    const mockAdapter: AxiosAdapter = (config) =>
      Promise.reject({
        response: {
          status: 401,
          data: {},
        },
        config,
      });

    await expect(
      apiClient.get('/api/v1/diaries', { adapter: mockAdapter }),
    ).rejects.toBeDefined();

    expect(mockState.clearAuth).toHaveBeenCalled();
    expect(locationStub.href).toBe('/login');

    Object.defineProperty(window, 'location', {
      writable: true,
      value: originalLocation,
    });
  });

  it('헤더가 처음부터 없는 게스트 GET 요청은 인터셉터가 건드리지 않고 200을 통과시킨다', async () => {
    mockState.accessToken = null;
    const { default: apiClient } = await import('@/api/client');

    let callCount = 0;
    const mockAdapter: AxiosAdapter = (config) => {
      callCount++;
      return Promise.resolve({
        data: { success: true, data: { items: [], hasNext: false }, timestamp: '' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      } as AxiosResponse);
    };

    const response = await apiClient.get('/api/v1/feeds', { adapter: mockAdapter });

    expect(response.data).toEqual({ items: [], hasNext: false });
    expect(callCount).toBe(1); // 단 한 번만 호출 — refresh 시도 없음
    expect(axiosPostSpy).not.toHaveBeenCalled();
  });
});
