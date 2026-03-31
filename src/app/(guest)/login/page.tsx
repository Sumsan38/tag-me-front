/**
 * /login — 로그인 페이지
 *
 * 렌더링 전략: CSR ('use client')
 * 이유: OAuth 리다이렉트, 폼 인터랙션 등 클라이언트 의존 동작이 필요하며,
 *       인증이 불필요한 guest 전용 페이지이므로 SSR SEO 이점이 없음.
 *
 * 레이아웃: (guest)/layout.tsx → AuthLayout(센터 카드)이 이미 적용됨.
 * 이 page는 카드 내부 콘텐츠만 렌더링한다.
 */

'use client';

import { useId, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';

import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { useLogin, useOAuthLogin } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';

// ---------------------------------------------------------------------------
// zod 스키마
// ---------------------------------------------------------------------------

const loginSchema = z.object({
  email: z.string().email('올바른 이메일을 입력해주세요.'),
  password: z.string().min(1, '비밀번호를 입력해주세요.'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// ---------------------------------------------------------------------------
// 소셜 로그인 아이콘 컴포넌트
// ---------------------------------------------------------------------------

function GoogleIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58Z"
        fill="#EA4335"
      />
    </svg>
  );
}

function KakaoIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9 0C4.029 0 0 3.134 0 7c0 2.486 1.566 4.666 3.93 5.931l-1.002 3.737a.3.3 0 0 0 .46.325L7.656 14.7A10.6 10.6 0 0 0 9 14.8c4.971 0 9-3.134 9-7S13.971 0 9 0Z"
        fill="#3A1D1D"
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// 로그인 페이지
// ---------------------------------------------------------------------------

export default function LoginPage() {
  const rememberMeId = useId();
  const [rememberMe, setRememberMe] = useState(false);

  const login = useLogin();
  const oAuthLogin = useOAuthLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const isFormPending = login.isPending;
  const isOAuthPending = oAuthLogin.isPending;
  const isAnyPending = isFormPending || isOAuthPending;

  function onSubmit(values: LoginFormValues) {
    if (isAnyPending) return;
    login.mutate({
      email: values.email,
      password: values.password,
      rememberMe,
    });
  }

  function handleOAuthLogin(provider: 'google' | 'kakao') {
    if (isAnyPending) return;
    oAuthLogin.mutate(provider);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* 페이지 제목 */}
      <div>
        <h1 className="text-lg font-bold text-text">로그인</h1>
        <p className="mt-1 text-sm text-sub">계정 정보를 입력해주세요.</p>
      </div>

      {/* 이메일 / 비밀번호 폼 */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        aria-label="이메일 로그인 폼"
        className="flex flex-col gap-4"
      >
        <Input
          type="email"
          label="이메일"
          placeholder="example@email.com"
          autoComplete="email"
          disabled={isAnyPending}
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          type="password"
          label="비밀번호"
          placeholder="비밀번호를 입력해주세요."
          autoComplete="current-password"
          disabled={isAnyPending}
          error={errors.password?.message}
          {...register('password')}
        />

        <div className="flex items-center gap-2">
          <input
            id={rememberMeId}
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 rounded border-border accent-accent cursor-pointer"
            disabled={isAnyPending}
          />
          <label
            htmlFor={rememberMeId}
            className="text-sm text-sub select-none cursor-pointer"
          >
            로그인 상태 유지
          </label>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={isFormPending}
          disabled={isAnyPending}
          className="w-full mt-1"
        >
          로그인
        </Button>
      </form>

      {/* 구분선 */}
      <div className="flex items-center gap-3" role="separator" aria-hidden="true">
        <span className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted shrink-0">또는</span>
        <span className="flex-1 h-px bg-border" />
      </div>

      {/* 소셜 로그인 버튼 */}
      <div className="flex flex-col gap-3">
        <Button
          type="button"
          variant="outline"
          size="lg"
          loading={isOAuthPending && oAuthLogin.variables === 'google'}
          disabled={isAnyPending}
          onClick={() => handleOAuthLogin('google')}
          aria-label="Google 계정으로 로그인"
          className="w-full"
        >
          <GoogleIcon />
          Google로 로그인
        </Button>

        <Button
          type="button"
          variant="outline"
          size="lg"
          loading={isOAuthPending && oAuthLogin.variables === 'kakao'}
          disabled={isAnyPending}
          onClick={() => handleOAuthLogin('kakao')}
          aria-label="Kakao 계정으로 로그인"
          className="w-full"
        >
          <KakaoIcon />
          Kakao로 로그인
        </Button>
      </div>

      {/* 회원가입 링크 */}
      <p className="text-center text-sm text-sub">
        아직 계정이 없으신가요?{' '}
        <Link
          href={ROUTES.REGISTER}
          className="font-semibold text-accent hover:underline underline-offset-2 transition-colors"
        >
          회원가입
        </Link>
      </p>
    </div>
  );
}
