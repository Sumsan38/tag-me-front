'use client';

import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  title?: string;
  children: React.ReactNode;
  onClose: () => void;
  className?: string;
}

export default function Modal({ title, children, onClose, className = '' }: ModalProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  // ESC 키 닫기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // 스크롤 잠금
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  // 포커스 트랩 — 모달 열릴 때 첫 포커스 이동
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const focusable = el.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    if (focusable.length > 0) {
      focusable[0].focus();
    } else {
      el.focus();
    }
  }, []);

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 animate-[fadeIn_180ms_ease]"
    >
      <div
        ref={contentRef}
        tabIndex={-1}
        className={[
          'relative w-full max-w-md bg-surface rounded-[var(--radius-modal)] border border-border',
          'shadow-[var(--shadow-modal)]',
          'animate-[slideUp_180ms_ease]',
          'focus:outline-none',
          className,
        ].join(' ')}
      >
        {/* 헤더 */}
        {title && (
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-base font-semibold text-text tracking-tight">{title}</h2>
            <button
              type="button"
              aria-label="모달 닫기"
              onClick={onClose}
              className="text-muted hover:text-sub transition-colors p-1 rounded-lg focus-visible:outline-2 focus-visible:outline-primary"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {!title && (
          <button
            type="button"
            aria-label="모달 닫기"
            onClick={onClose}
            className="absolute top-4 right-4 text-muted hover:text-sub transition-colors p-1 rounded-lg focus-visible:outline-2 focus-visible:outline-primary z-10"
          >
            <X size={18} />
          </button>
        )}

        {/* 본문 */}
        <div className="p-5">{children}</div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
