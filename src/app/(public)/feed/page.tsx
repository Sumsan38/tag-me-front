/**
 * (public)/feed/page.tsx — 공개 피드 메인 페이지
 *
 * 접근 정책: public (인증 불필요)
 * 렌더링 전략: SSR (SEO) + 클라이언트 인터랙션은 FeedList로 분리
 *
 * 레이아웃:
 *   - 데스크탑(lg+): 피드 컬럼 + 우측 사이드바 (트렌딩·추천·익명공감)
 *   - 모바일: 피드 단일 컬럼, 사이드바 숨김
 */

import type { Metadata } from 'next';
import FeedList from '@/components/feed/FeedList';
import FeedSidebar from '@/components/feed/FeedSidebar';

export const metadata: Metadata = {
  title: '피드 — Tag Me',
  description: '태그 기반 소셜 일기 플랫폼에서 다른 사용자의 이야기를 만나보세요.',
};

export default function FeedPage() {
  return (
    <div className="flex gap-6 items-start">
      {/* 메인 피드 */}
      <div className="flex-1 min-w-0">
        <FeedList />
      </div>

      {/* 우측 사이드바 — lg 이상에서만 표시 */}
      <FeedSidebar />
    </div>
  );
}
