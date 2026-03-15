'use client';

import { useCallback } from 'react';
import { useToastContext } from '@/providers/ToastProvider';
import type { ToastVariant } from '@/components/common/Toast';

/**
 * Toast 알림을 손쉽게 띄우는 훅.
 *
 * 사용 예시:
 * ```tsx
 * const toast = useToast();
 * toast.success('저장되었습니다.');
 * toast.error('오류가 발생했습니다.');
 * ```
 */
export function useToast() {
  const { addToast, removeToast } = useToastContext();

  const show = useCallback(
    (message: string, variant: ToastVariant = 'info', duration?: number) =>
      addToast(message, variant, duration),
    [addToast],
  );

  return {
    show,
    success: useCallback(
      (message: string, duration?: number) => addToast(message, 'success', duration),
      [addToast],
    ),
    error: useCallback(
      (message: string, duration?: number) => addToast(message, 'error', duration),
      [addToast],
    ),
    warning: useCallback(
      (message: string, duration?: number) => addToast(message, 'warning', duration),
      [addToast],
    ),
    info: useCallback(
      (message: string, duration?: number) => addToast(message, 'info', duration),
      [addToast],
    ),
    dismiss: removeToast,
  };
}
