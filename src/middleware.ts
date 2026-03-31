/**
 * middleware.ts — Next.js Edge Middleware
 *
 * 인증 가드의 1차 방어선 (pass-through).
 *
 * 제한 사항:
 *   - Access Token은 메모리(Zustand)에만 저장하므로 middleware에서 직접 검증 불가.
 *   - Refresh Token HttpOnly Cookie의 path가 /api/v1/auth/refresh로 제한되어 있어
 *     페이지 요청(/login, /diary 등)에서 브라우저가 쿠키를 전송하지 않는다.
 *     따라서 middleware에서 쿠키 존재 여부로 인증을 판단할 수 없다.
 *   - 실제 인증 검증은 클라이언트 레이아웃 가드((auth)/layout.tsx, (guest)/layout.tsx)와
 *     AuthHydration의 silent refresh에서 수행한다.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  // 정적 자산, API 라우트, Next.js 내부 경로 제외
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
