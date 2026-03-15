/**
 * (public)/layout.tsx — 공개 접근 라우트 그룹 레이아웃
 *
 * 적용 대상:
 *   /feed, /feed/[id], /users/[id], /trending,
 *   /challenges/[id], /circles/[id],
 *   /terms, /privacy, /reports/[id]
 *
 * 접근 정책:
 *   - Guest / User / Admin 모두 접근 가능
 *   - 인증 상태에 따라 UI 일부를 조건부로 렌더링할 수 있으나
 *     접근 자체는 제한하지 않는다
 *
 * 렌더링 전략: 페이지별 혼용
 *   - SSR : /feed, /feed/[id], /users/[id], /challenges/[id],
 *           /circles/[id], /terms, /privacy, /reports/[id]
 *           → SEO 노출 + 초기 로딩 속도
 *   - ISR : /trending (revalidate = 3600)
 *           → 1시간 단위 갱신, 서버 부하 최소화
 *
 * 서버 컴포넌트로 유지하여 SSR/ISR 페이지가 자연스럽게 동작하도록 한다.
 * 하위 페이지에서 클라이언트 인터랙션이 필요한 부분은 별도 Client Component로 분리.
 *
 * TODO(ui): 공통 헤더(네비게이션 바)와 푸터를 이 레이아웃에 배치한다.
 *   - 헤더는 인증 상태에 따라 로그인/프로필 버튼을 조건부로 노출
 *   - 헤더 자체는 Client Component로 분리하여 이 Server Component 안에 포함
 */

import type { ReactNode } from 'react';
import { MainLayout } from '@/components/layout';

// TODO(seo): 공통 Open Graph 기본값 정의
// export const metadata: Metadata = {
//   openGraph: { siteName: 'Tag Me', locale: 'ko_KR', type: 'website' },
// };

export default function PublicLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <MainLayout>{children}</MainLayout>;
}
