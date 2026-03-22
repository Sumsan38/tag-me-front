/**
 * /mypage/settings — 설정 페이지
 *
 * 로그아웃 기능을 제공한다.
 * 알림 설정, 비밀번호 변경, 회원 탈퇴 등은 추후 구현.
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, LogOut, Shield, FileText, ChevronRight } from 'lucide-react';
import Button from '@/components/common/Button';
import { Modal } from '@/components/common';
import { useLogout } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';

export default function SettingsPage() {
  const router = useRouter();
  const logout = useLogout();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    logout.mutate();
  };

  return (
    <div className="py-4 px-4 space-y-4">
      {/* 헤더 */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="뒤로 가기"
          className="flex items-center justify-center w-9 h-9 rounded-xl text-sub hover:bg-[#F5F5F4] transition-colors"
        >
          <ArrowLeft size={20} aria-hidden />
        </button>
        <h1 className="text-lg font-bold text-text">설정</h1>
      </div>

      {/* 기타 메뉴 */}
      <div className="bg-surface rounded-2xl border border-border overflow-hidden">
        <Link
          href={ROUTES.PRIVACY}
          className="flex items-center justify-between px-4 py-3.5 hover:bg-[#F5F5F4] transition-colors"
        >
          <div className="flex items-center gap-3">
            <Shield size={18} className="text-sub" aria-hidden />
            <span className="text-sm font-medium text-text">
              개인정보처리방침
            </span>
          </div>
          <ChevronRight size={16} className="text-muted" aria-hidden />
        </Link>

        <div className="h-px bg-border mx-4" />

        <Link
          href={ROUTES.TERMS}
          className="flex items-center justify-between px-4 py-3.5 hover:bg-[#F5F5F4] transition-colors"
        >
          <div className="flex items-center gap-3">
            <FileText size={18} className="text-sub" aria-hidden />
            <span className="text-sm font-medium text-text">이용약관</span>
          </div>
          <ChevronRight size={16} className="text-muted" aria-hidden />
        </Link>
      </div>

      {/* 로그아웃 */}
      <button
        type="button"
        onClick={() => setShowLogoutModal(true)}
        className="w-full flex items-center gap-3 bg-surface rounded-2xl border border-border px-4 py-3.5 hover:bg-[#F5F5F4] transition-colors cursor-pointer"
      >
        <LogOut size={18} className="text-error" aria-hidden />
        <span className="text-sm font-medium text-error">로그아웃</span>
      </button>

      {/* 회원 탈퇴 */}
      <div className="text-center pt-4">
        <button
          type="button"
          className="text-xs text-muted underline underline-offset-4 hover:text-sub transition-colors cursor-pointer"
        >
          회원 탈퇴
        </button>
      </div>

      {/* 로그아웃 확인 모달 */}
      {showLogoutModal && (
        <Modal
          title="로그아웃"
          onClose={() => setShowLogoutModal(false)}
        >
          <p className="text-sm text-sub mb-6">
            정말 로그아웃하시겠습니까?
          </p>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              size="md"
              className="flex-1"
              onClick={() => setShowLogoutModal(false)}
            >
              취소
            </Button>
            <Button
              type="button"
              variant="primary"
              size="md"
              className="flex-1 !bg-error hover:!bg-red-600"
              loading={logout.isPending}
              onClick={handleLogout}
            >
              로그아웃
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
