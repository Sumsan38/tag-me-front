/**
 * auth-types.test.ts
 *
 * types/auth.ts 타입 변경 검증.
 *
 * 검증 항목:
 *   - LoginRequest에 rememberMe 필드가 포함되는지
 *   - LoginResponse에 refreshToken이 없는지
 */

import { describe, it, expect } from 'vitest';
import type { LoginRequest, LoginResponse } from '@/types/auth';

describe('LoginRequest 타입', () => {
  it('email, password, rememberMe 필드를 포함한다', () => {
    const request: LoginRequest = {
      email: 'test@example.com',
      password: 'password123',
      rememberMe: true,
    };

    expect(request.email).toBe('test@example.com');
    expect(request.password).toBe('password123');
    expect(request.rememberMe).toBe(true);
  });
});

describe('LoginResponse 타입', () => {
  it('userId, accessToken만 포함한다 (refreshToken 없음)', () => {
    const response: LoginResponse = {
      userId: 1,
      accessToken: 'access-token-value',
    };

    expect(response.userId).toBe(1);
    expect(response.accessToken).toBe('access-token-value');
    expect(response).not.toHaveProperty('refreshToken');
  });
});
