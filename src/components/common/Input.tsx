'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, Search } from 'lucide-react';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  type?: 'text' | 'password' | 'email' | 'search';
  label?: string;
  error?: string;
  helperText?: string;
  className?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      type = 'text',
      label,
      error,
      helperText,
      className = '',
      id,
      ...props
    },
    ref,
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id ?? (label ? label.replace(/\s+/g, '-').toLowerCase() : undefined);

    const resolvedType =
      type === 'password' ? (showPassword ? 'text' : 'password') : type;

    const hasRightIcon = type === 'password' || type === 'search';

    return (
      <div className={['flex flex-col gap-1.5', className].join(' ')}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-text"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {type === 'search' && (
            <span className="absolute left-3 text-muted pointer-events-none">
              <Search size={16} aria-hidden="true" />
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            type={resolvedType}
            aria-invalid={!!error}
            aria-describedby={
              error
                ? `${inputId}-error`
                : helperText
                  ? `${inputId}-helper`
                  : undefined
            }
            className={[
              'w-full border rounded-lg text-sm text-text bg-[#FAFAF8] placeholder:text-muted',
              'transition-colors duration-[180ms]',
              'focus:outline-2 focus:outline-primary focus:outline-offset-0 focus:border-primary',
              'disabled:opacity-40 disabled:cursor-not-allowed',
              error ? 'border-error focus:outline-error' : 'border-border hover:border-muted',
              type === 'search' ? 'pl-9 pr-3 py-[7px]' : hasRightIcon ? 'pl-3 pr-10 py-[7px]' : 'px-3 py-[7px]',
            ].join(' ')}
            {...props}
          />

          {type === 'password' && (
            <button
              type="button"
              aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
              onClick={() => setShowPassword((v) => !v)}
              tabIndex={0}
              className="absolute right-3 text-muted hover:text-sub transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          )}
        </div>

        {error && (
          <p id={`${inputId}-error`} role="alert" className="text-xs text-error">
            {error}
          </p>
        )}
        {!error && helperText && (
          <p id={`${inputId}-helper`} className="text-xs text-muted">
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

export default Input;
