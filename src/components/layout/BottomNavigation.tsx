'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, CircleDot, Bell, User } from 'lucide-react';
import { ROUTES } from '@/constants/routes';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  activeIcon?: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: '피드',
    href: ROUTES.FEED,
    icon: <Home size={22} aria-hidden />,
  },
  {
    label: '일기',
    href: ROUTES.DIARY,
    icon: <BookOpen size={22} aria-hidden />,
  },
  {
    label: '마인드맵',
    href: ROUTES.MINDMAP,
    icon: <CircleDot size={22} aria-hidden />,
  },
  {
    label: '알림',
    href: ROUTES.NOTIFICATIONS,
    icon: <Bell size={22} aria-hidden />,
  },
  {
    label: '프로필',
    href: ROUTES.MYPAGE,
    icon: <User size={22} aria-hidden />,
  },
];

export interface BottomNavigationProps {
  className?: string;
}

export default function BottomNavigation({ className = '' }: BottomNavigationProps) {
  const pathname = usePathname();

  /**
   * 현재 경로가 해당 탭의 활성 경로인지 확인한다.
   * FEED는 /feed로 시작하는 모든 경로에서 활성화한다.
   */
  const isActive = (href: string): boolean => {
    if (href === ROUTES.FEED) return pathname === ROUTES.FEED || pathname.startsWith('/feed');
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <nav
      aria-label="하단 탐색"
      className={[
        'md:hidden fixed bottom-0 left-0 right-0 z-40',
        'bg-surface border-t border-border',
        'flex items-stretch',
        // 홈 인디케이터 영역 확보 (iOS Safari)
        'pb-safe',
        className,
      ].join(' ')}
    >
      {NAV_ITEMS.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-label={item.label}
            aria-current={active ? 'page' : undefined}
            className={[
              'flex flex-1 flex-col items-center justify-center gap-1 pt-2 pb-3',
              'transition-colors duration-[var(--duration-fast)]',
              active
                ? 'text-text'
                : 'text-muted hover:text-sub',
            ].join(' ')}
          >
            <span
              className={[
                'transition-opacity duration-[var(--duration-fast)]',
                active ? 'opacity-100' : 'opacity-30',
              ].join(' ')}
            >
              {item.icon}
            </span>
            <span
              className={[
                'text-[10px] leading-none',
                active ? 'font-bold' : 'font-normal',
              ].join(' ')}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
