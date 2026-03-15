'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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

// TODO(auth): 실제 로그아웃 액션 연동 시 useAuthStore로 교체
// import { useAuthStore } from '@/stores/authStore';

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
  const router = useRouter();

  // TODO(auth): clearAuth() + router.push(ROUTES.LOGIN) 로 교체
  const handleLogout = () => {
    router.push(ROUTES.LOGIN);
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
        'w-60 shrink-0 h-screen sticky top-0',
        'bg-surface border-r border-border',
        className,
      ].join(' ')}
    >
      {/* 로고 */}
      <div className="px-5 py-4 border-b border-border">
        <Link
          href={ROUTES.HOME}
          aria-label="Tag Me 홈으로 이동"
          className="text-[17px] font-bold text-text tracking-[-0.03em] hover:opacity-80 transition-opacity"
        >
          Tag Me
        </Link>
      </div>

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
          aria-label="로그아웃"
          className={[
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium',
            'text-sub hover:bg-[#F5F5F4] hover:text-text',
            'transition-colors duration-[var(--duration-fast)] cursor-pointer',
          ].join(' ')}
        >
          <LogOut size={18} className="shrink-0 opacity-50" aria-hidden />
          로그아웃
        </button>
      </div>
    </aside>
  );
}
