'use client';

import React from 'react';
import Spinner from './Spinner';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'bg-text text-white border border-transparent hover:opacity-90 active:opacity-80',
  secondary:
    'bg-secondary text-white border border-transparent hover:opacity-90 active:opacity-80',
  outline:
    'bg-surface text-text border border-border hover:border-muted active:bg-[#F5F5F4]',
  danger:
    'bg-error text-white border border-transparent hover:opacity-90 active:opacity-80',
  ghost:
    'bg-transparent text-sub border border-transparent hover:bg-[#F5F5F4] active:bg-border',
};

const sizeClasses: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'text-xs px-3 py-1.5 rounded-lg gap-1.5',
  md: 'text-sm px-[18px] py-2 rounded-[10px] gap-2',
  lg: 'text-base px-6 py-3 rounded-xl gap-2',
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled,
      children,
      className = '',
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        aria-busy={loading}
        className={[
          'inline-flex items-center justify-center font-semibold transition-opacity cursor-pointer select-none',
          'focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2',
          'disabled:opacity-40 disabled:cursor-not-allowed',
          variantClasses[variant],
          sizeClasses[size],
          className,
        ].join(' ')}
        {...props}
      >
        {loading && (
          <Spinner
            size={size === 'lg' ? 'md' : 'sm'}
            className="shrink-0"
          />
        )}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';

export default Button;
