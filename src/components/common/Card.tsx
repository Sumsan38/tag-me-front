import React from 'react';

export interface CardProps {
  variant?: 'default' | 'outlined' | 'elevated';
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
}

const variantClasses: Record<NonNullable<CardProps['variant']>, string> = {
  default:
    'bg-surface border border-border shadow-[var(--shadow-card)]',
  outlined:
    'bg-surface border-2 border-border',
  elevated:
    'bg-surface border border-border shadow-[0_4px_16px_0_rgba(0,0,0,0.08),0_1px_4px_0_rgba(0,0,0,0.04)]',
};

export default function Card({
  variant = 'default',
  children,
  className = '',
  as: Component = 'div',
}: CardProps) {
  return (
    <Component
      className={[
        'rounded-[14px] p-[14px_16px]',
        variantClasses[variant],
        className,
      ].join(' ')}
    >
      {children}
    </Component>
  );
}
