/**
 * middleware.ts — Next.js Edge Middleware
 *
 * 인증 가드의 1차 방어선.
 * Edge Runtime에서 실행되어 페이지 렌더링 전에 리다이렉트를 처리한다.
 *
 * 제한 사항:
 *   - Access Token은 메모리(Zustand)에만 저장하므로 middleware에서 직접 검증 불가.
 *   - 따라서 middleware는 "토큰이 아예 없는 명백한 비인증 접근"만 차단하고,
 *     실제 인증 검증은 클라이언트 레이아웃 가드((auth)/layout.tsx, (guest)/layout.tsx)에서 수행.
 *   - 현재 구현에서는 정적 자산과 API 경로를 제외한 모든 경로에 대해 matcher만 설정.
 *     실질적인 리다이렉트 로직은 레이아웃 가드가 담당한다.
 *
 * 추후 Refresh Token을 HttpOnly Cookie로 전환하면
 * middleware에서 쿠키 기반 인증 검증이 가능해진다.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(_request: NextRequest) {
  // 현재는 레이아웃 가드에 위임 — pass-through
  return NextResponse.next();
}

export const config = {
  // 정적 자산, API 라우트, Next.js 내부 경로 제외
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
