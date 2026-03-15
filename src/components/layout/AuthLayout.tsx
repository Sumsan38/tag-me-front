import type { ReactNode } from 'react';
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';

export interface AuthLayoutProps {
  /** 폼 컨텐츠 */
  children: ReactNode;
  /** 카드 상단 서비스 소개 텍스트 (기본값 제공) */
  description?: string;
  className?: string;
}

export default function AuthLayout({
  children,
  description = '태그로 기록하고, 감정을 연결하세요.',
  className = '',
}: AuthLayoutProps) {
  return (
    <div
      className={[
        'min-h-screen flex flex-col items-center justify-center',
        'bg-background px-4 py-10',
        className,
      ].join(' ')}
    >
      {/* 로고 + 서비스 소개 */}
      <div className="text-center mb-6">
        <Link
          href={ROUTES.HOME}
          aria-label="Tag Me 홈으로 이동"
          className="inline-block text-2xl font-bold text-text tracking-[-0.03em] hover:opacity-80 transition-opacity"
        >
          Tag Me
        </Link>
        {description && (
          <p className="mt-1.5 text-sm text-sub">{description}</p>
        )}
      </div>

      {/* 카드 */}
      <div
        className={[
          'w-full max-w-[400px]',
          'bg-surface rounded-[var(--radius-modal)]',
          'border border-border',
          'shadow-[var(--shadow-modal)]',
          'p-6',
        ].join(' ')}
      >
        {children}
      </div>

      {/* 이용약관 / 개인정보처리방침 */}
      <p className="mt-6 text-xs text-muted text-center">
        계속 진행하면{' '}
        <Link
          href={ROUTES.TERMS}
          className="underline underline-offset-2 hover:text-sub transition-colors"
        >
          이용약관
        </Link>
        {' 및 '}
        <Link
          href={ROUTES.PRIVACY}
          className="underline underline-offset-2 hover:text-sub transition-colors"
        >
          개인정보처리방침
        </Link>
        에 동의하는 것으로 간주됩니다.
      </p>
    </div>
  );
}
