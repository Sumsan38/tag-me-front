/**
 * (public)/feed/page.tsx — 공개 피드 메인 페이지
 *
 * 접근 정책: public (인증 불필요)
 * 렌더링 전략: SSR (SEO) + 클라이언트 인터랙션은 FeedList로 분리
 *
 * 탭: 전체(공개) / 팔로잉(인증 필요)
 * 무한 스크롤, 게시글 작성 플로팅 버튼(인증 시)
 */

import type { Metadata } from 'next';
import FeedList from '@/components/feed/FeedList';

export const metadata: Metadata = {
  title: '피드 — Tag Me',
  description: '태그 기반 소셜 일기 플랫폼에서 다른 사용자의 이야기를 만나보세요.',
};

export default function FeedPage() {
  return <FeedList />;
}
