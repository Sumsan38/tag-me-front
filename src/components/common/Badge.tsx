import { TAG_PALETTE_CLASSES } from '@/constants/tag';

export interface BadgeProps {
  variant?: 'tag' | 'notification' | 'status';
  /** tag variant: 태그 레이블 (#prefix 자동 추가) */
  label?: string;
  /** tag variant: 팔레트 인덱스 (idx % 6 순환) */
  idx?: number;
  /** notification variant: 카운트 숫자 */
  count?: number;
  /** status variant: 상태 텍스트 */
  status?: string;
  /** status variant 색상 */
  statusColor?: 'success' | 'error' | 'warning' | 'info';
  /** tag sm 사이즈 여부 */
  sm?: boolean;
  className?: string;
}


const statusColorMap = {
  success: 'bg-success-bg text-success border border-success-border',
  error:   'bg-error-bg text-error border border-error-border',
  warning: 'bg-warning-bg text-warning border border-warning-border',
  info:    'bg-info-bg text-info border border-info-border',
} as const;

export default function Badge({
  variant = 'tag',
  label,
  idx = 0,
  count,
  status,
  statusColor = 'info',
  sm = false,
  className = '',
}: BadgeProps) {
  // ── tag variant ──────────────────────────────────────────
  if (variant === 'tag') {
    const { fg, bg } = TAG_PALETTE_CLASSES[idx % 6];
    return (
      <span
        role="listitem"
        className={[
          'inline-flex items-center font-medium rounded-[6px] tracking-[-0.01em]',
          'shadow-[var(--shadow-tag)]',
          fg,
          bg,
          sm ? 'text-[11px] px-2 py-0.5' : 'text-xs px-[10px] py-[3px]',
          className,
        ].join(' ')}
      >
        #{label}
      </span>
    );
  }

  // ── notification variant ─────────────────────────────────
  if (variant === 'notification') {
    const display = count !== undefined && count > 99 ? '99+' : String(count ?? 0);
    return (
      <span
        aria-label={`${count}개 알림`}
        className={[
          'inline-flex items-center justify-center min-w-[18px] h-[18px] px-1',
          'rounded-full bg-error text-white text-[10px] font-semibold leading-none',
          className,
        ].join(' ')}
      >
        {display}
      </span>
    );
  }

  // ── status variant ───────────────────────────────────────
  return (
    <span
      className={[
        'inline-flex items-center rounded-full text-xs font-medium px-2.5 py-0.5',
        statusColorMap[statusColor],
        className,
      ].join(' ')}
    >
      {status}
    </span>
  );
}
