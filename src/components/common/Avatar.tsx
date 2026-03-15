import Image from 'next/image';

export interface AvatarProps {
  /** next/image src URL. 없으면 emoji 또는 이니셜 fallback */
  src?: string;
  /** 이미지 대체 이모지 (기본값: 🦊) */
  emoji?: string;
  /** 이미지/이모지 없을 때 표시할 이니셜 (1~2자) */
  initials?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** 아바타 배경색 (기본값: #F0EFFF) */
  bg?: string;
  alt?: string;
  className?: string;
}

const sizeMap: Record<NonNullable<AvatarProps['size']>, { px: number; text: string }> = {
  sm: { px: 24, text: 'text-sm' },
  md: { px: 32, text: 'text-base' },
  lg: { px: 48, text: 'text-2xl' },
  xl: { px: 56, text: 'text-3xl' },
};

export default function Avatar({
  src,
  emoji = '🦊',
  initials,
  size = 'md',
  bg = '#F0EFFF',
  alt = '사용자 아바타',
  className = '',
}: AvatarProps) {
  const { px, text } = sizeMap[size];

  const base = [
    'rounded-full overflow-hidden flex items-center justify-center shrink-0',
    'border border-border select-none',
    className,
  ].join(' ');

  if (src) {
    return (
      <div
        className={base}
        style={{ width: px, height: px, minWidth: px, background: bg }}
      >
        <Image
          src={src}
          alt={alt}
          width={px}
          height={px}
          className="object-cover w-full h-full"
        />
      </div>
    );
  }

  const content = initials
    ? initials.slice(0, 2).toUpperCase()
    : emoji;

  return (
    <div
      role="img"
      aria-label={alt}
      className={[base, text].join(' ')}
      style={{ width: px, height: px, minWidth: px, background: bg }}
    >
      {content}
    </div>
  );
}
