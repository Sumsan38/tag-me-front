export interface SkeletonProps {
  variant?: 'text' | 'circle' | 'rect';
  /** 너비 (Tailwind 클래스 또는 px 값 포함 문자열) */
  width?: string;
  /** 높이 (Tailwind 클래스 또는 px 값 포함 문자열) */
  height?: string;
  className?: string;
}

export default function Skeleton({
  variant = 'rect',
  width,
  height,
  className = '',
}: SkeletonProps) {
  const base = 'animate-pulse bg-border';

  const variantClasses: Record<NonNullable<SkeletonProps['variant']>, string> = {
    text:   'rounded h-4',
    circle: 'rounded-full',
    rect:   'rounded-[var(--radius-card)]',
  };

  return (
    <div
      role="status"
      aria-label="로딩 중"
      style={{
        width: width,
        height: height,
      }}
      className={[base, variantClasses[variant], className].join(' ')}
    />
  );
}
