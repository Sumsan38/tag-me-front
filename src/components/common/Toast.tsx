'use client';

import { useEffect, useRef } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  variant: ToastVariant;
  message: string;
  duration?: number;
}

interface ToastProps extends ToastItem {
  onClose: (id: string) => void;
}

const variantConfig: Record<
  ToastVariant,
  { icon: React.ElementType; classes: string }
> = {
  success: {
    icon: CheckCircle,
    classes: 'bg-success-bg border-success-border text-success',
  },
  error: {
    icon: XCircle,
    classes: 'bg-error-bg border-error-border text-error',
  },
  warning: {
    icon: AlertTriangle,
    classes: 'bg-warning-bg border-warning-border text-warning',
  },
  info: {
    icon: Info,
    classes: 'bg-info-bg border-info-border text-info',
  },
};

export default function Toast({ id, variant, message, duration = 3000, onClose }: ToastProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => onClose(id), duration);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [id, duration, onClose]);

  const { icon: Icon, classes } = variantConfig[variant];

  return (
    <div
      role="alert"
      aria-live="polite"
      className={[
        'flex items-start gap-3 w-full max-w-sm px-4 py-3 rounded-[var(--radius-card)]',
        'border shadow-[var(--shadow-modal)]',
        'animate-[slideDown_180ms_ease]',
        classes,
      ].join(' ')}
    >
      <Icon size={18} className="shrink-0 mt-0.5" aria-hidden="true" />
      <p className="flex-1 text-sm font-medium leading-snug">{message}</p>
      <button
        type="button"
        aria-label="알림 닫기"
        onClick={() => onClose(id)}
        className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
      >
        <X size={16} />
      </button>

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
