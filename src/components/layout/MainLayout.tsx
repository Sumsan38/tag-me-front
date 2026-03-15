import type { ReactNode } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import BottomNavigation from './BottomNavigation';

export interface MainLayoutProps {
  children: ReactNode;
  /**
   * 콘텐츠 영역 최대 너비 클래스.
   * 기본값: 'max-w-2xl' (672px) — 피드, 일기 등 단일 컬럼 레이아웃에 적합.
   * 'max-w-3xl' (768px) 등으로 확장 가능.
   */
  contentMaxWidth?: string;
  /** 알림 카운트 (Header에 전달) */
  notificationCount?: number;
  className?: string;
}

export default function MainLayout({
  children,
  contentMaxWidth = 'max-w-2xl',
  notificationCount,
  className = '',
}: MainLayoutProps) {
  return (
    <div className={['min-h-screen bg-background', className].join(' ')}>
      {/* 상단 헤더 (모바일 + 데스크탑 공통) */}
      <Header notificationCount={notificationCount} />

      {/* 본문: 사이드바 + 콘텐츠 */}
      <div className="flex">
        {/* 사이드바 — 데스크탑 전용 (내부에서 hidden md:flex 처리) */}
        <Sidebar />

        {/* 콘텐츠 영역 */}
        <main
          id="main-content"
          tabIndex={-1}
          className={[
            'flex-1 min-w-0',
            // 모바일: BottomNavigation 높이(pb-16) 확보
            'pb-16 md:pb-0',
          ].join(' ')}
        >
          {/* 최대 너비 + 중앙 정렬 래퍼 */}
          <div className={['w-full mx-auto', contentMaxWidth].join(' ')}>
            {children}
          </div>
        </main>
      </div>

      {/* 하단 네비게이션 — 모바일 전용 (내부에서 md:hidden 처리) */}
      <BottomNavigation />
    </div>
  );
}
