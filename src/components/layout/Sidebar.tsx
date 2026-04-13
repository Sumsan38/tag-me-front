'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  BookOpen,
  CircleDot,
  Search,
  Bell,
  User,
  Settings,
  LogOut,
} from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { useLogout } from '@/hooks/useAuth';

interface SidebarNavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: SidebarNavItem[] = [
  { label: '피드',      href: ROUTES.FEED,          icon: <Home size={18} aria-hidden /> },
  { label: '일기',      href: ROUTES.DIARY,         icon: <BookOpen size={18} aria-hidden /> },
  { label: '마인드맵',  href: ROUTES.MINDMAP,       icon: <CircleDot size={18} aria-hidden /> },
  { label: '검색',      href: ROUTES.SEARCH,        icon: <Search size={18} aria-hidden /> },
  { label: '알림',      href: ROUTES.NOTIFICATIONS, icon: <Bell size={18} aria-hidden /> },
  { label: '마이페이지', href: ROUTES.MYPAGE,       icon: <User size={18} aria-hidden /> },
];

export interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className = '' }: SidebarProps) {
  const pathname = usePathname();
  const logout = useLogout();

  const handleLogout = () => {
    logout.mutate();
  };

  const isActive = (href: string): boolean => {
    if (href === ROUTES.FEED) return pathname === ROUTES.FEED || pathname.startsWith('/feed');
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <aside
      aria-label="사이드 네비게이션"
      className={[
        'hidden md:flex flex-col',
        'w-60 shrink-0 h-[calc(100vh-3.5rem)] sticky top-14',
        'bg-surface border-r border-border',
        className,
      ].join(' ')}
    >
      {/* 네비게이션 링크 */}
      <nav aria-label="주요 메뉴" className="flex-1 overflow-y-auto py-3 px-3">
        <ul role="list" className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-label={item.label}
                  aria-current={active ? 'page' : undefined}
                  className={[
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium',
                    'transition-colors duration-[var(--duration-fast)]',
                    active
                      ? 'bg-[#F5F5F4] text-text font-semibold'
                      : 'text-sub hover:bg-[#F5F5F4] hover:text-text',
                  ].join(' ')}
                >
                  <span
                    className={[
                      'shrink-0 transition-opacity duration-[var(--duration-fast)]',
                      active ? 'opacity-100' : 'opacity-50',
                    ].join(' ')}
                  >
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* 하단: 설정, 로그아웃 */}
      <div className="border-t border-border py-3 px-3 space-y-0.5">
        <Link
          href={ROUTES.MYPAGE_SETTINGS}
          aria-label="설정"
          aria-current={pathname === ROUTES.MYPAGE_SETTINGS ? 'page' : undefined}
          className={[
            'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium',
            'transition-colors duration-[var(--duration-fast)]',
            pathname === ROUTES.MYPAGE_SETTINGS
              ? 'bg-[#F5F5F4] text-text font-semibold'
              : 'text-sub hover:bg-[#F5F5F4] hover:text-text',
          ].join(' ')}
        >
          <Settings size={18} className="shrink-0 opacity-50" aria-hidden />
          설정
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          disabled={logout.isPending}
          aria-label="로그아웃"
          className={[
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium',
            'text-sub hover:bg-[#F5F5F4] hover:text-text',
            'transition-colors duration-[var(--duration-fast)] cursor-pointer',
            'disabled:opacity-50 disabled:cursor-not-allowed',
          ].join(' ')}
        >
          <LogOut size={18} className="shrink-0 opacity-50" aria-hidden />
          {logout.isPending ? '로그아웃 중...' : '로그아웃'}
        </button>
      </div>
    </aside>
  );
}
