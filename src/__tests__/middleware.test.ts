/**
 * middleware.test.ts
 *
 * Next.js Edge Middleware 동작 검증.
 *
 * 현재 middleware는 pass-through 동작이다.
 * Refresh Token 쿠키의 path가 /api/v1/auth/refresh로 제한되어 있어
 * 페이지 요청에서 브라우저가 쿠키를 전송하지 않으므로,
 * 인증 가드는 클라이언트 레이아웃 가드(AuthHydration + layout.tsx)에 위임한다.
 */

import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { middleware } from '@/middleware';

function createRequest(pathname: string): NextRequest {
  const url = new URL(pathname, 'http://localhost:3000');
  return new NextRequest(url);
}

describe('middleware — pass-through', () => {
  it('모든 경로에 대해 NextResponse.next()를 반환한다 (리다이렉트 없음)', () => {
    const paths = ['/login', '/register', '/diary', '/feed', '/mypage/settings', '/mindmap', '/'];

    for (const path of paths) {
      const response = middleware(createRequest(path));
      expect(response.headers.get('location')).toBeNull();
    }
  });
});
