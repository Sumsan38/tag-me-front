'use client';

/**
 * /register — 회원가입 페이지
 *
 * 렌더링 전략: CSR
 *   - 인증이 필요한 폼 인터랙션 및 OAuth 리다이렉트 처리
 *   - 부모 레이아웃 (guest)/layout.tsx 가 AuthLayout(센터 카드)을 제공하므로
 *     이 컴포넌트는 카드 내부 콘텐츠만 렌더링한다.
 */

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { Check } from 'lucide-react';

import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { useRegister, useOAuthLogin } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';

// ---------------------------------------------------------------------------
// Zod 스키마 (백엔드 검증 규칙 일치)
// ---------------------------------------------------------------------------

const registerSchema = z
  .object({
    email: z.string().email('올바른 이메일을 입력해주세요.'),
    password: z
      .string()
      .min(8, '비밀번호는 8자 이상이어야 합니다.')
      .max(100, '비밀번호는 100자 이하여야 합니다.')
      .regex(/[a-zA-Z]/, '영문자를 포함해야 합니다.')
      .regex(/[0-9]/, '숫자를 포함해야 합니다.')
      .regex(/[^a-zA-Z0-9]/, '특수문자를 포함해야 합니다.'),
    passwordConfirm: z.string().min(1, '비밀번호 확인을 입력해주세요.'),
    nickname: z
      .string()
      .min(2, '닉네임은 2자 이상이어야 합니다.')
      .max(20, '닉네임은 20자 이하여야 합니다.'),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: '비밀번호가 일치하지 않습니다.',
    path: ['passwordConfirm'],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

// ---------------------------------------------------------------------------
// 비밀번호 강도 계산
// ---------------------------------------------------------------------------

interface PasswordStrength {
  score: number; // 0~4 (충족 조건 수)
  checks: {
    minLength: boolean;
    hasLetter: boolean;
    hasNumber: boolean;
    hasSpecial: boolean;
  };
}

function getPasswordStrength(password: string): PasswordStrength {
  const checks = {
    minLength: password.length >= 8,
    hasLetter: /[a-zA-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[^a-zA-Z0-9]/.test(password),
  };
  const score = Object.values(checks).filter(Boolean).length;
  return { score, checks };
}

function getStrengthBarColor(score: number): string {
  if (score <= 1) return 'bg-error';
  if (score <= 3) return 'bg-warning';
  return 'bg-success';
}

function getStrengthLabel(score: number): { text: string; color: string } {
  if (score === 0) return { text: '', color: '' };
  if (score <= 1) return { text: '매우 약함', color: 'text-error' };
  if (score === 2) return { text: '약함', color: 'text-warning' };
  if (score === 3) return { text: '보통', color: 'text-warning' };
  return { text: '강함', color: 'text-success' };
}

// ---------------------------------------------------------------------------
// PasswordStrengthMeter 서브컴포넌트
// ---------------------------------------------------------------------------

function PasswordStrengthMeter({ password }: { password: string }) {
  const { score, checks } = getPasswordStrength(password);
  const barColor = getStrengthBarColor(score);
  const label = getStrengthLabel(score);

  if (!password) return null;

  const checkItems: { key: keyof typeof checks; label: string }[] = [
    { key: 'minLength', label: '8자 이상' },
    { key: 'hasLetter', label: '영문자 포함' },
    { key: 'hasNumber', label: '숫자 포함' },
    { key: 'hasSpecial', label: '특수문자 포함' },
  ];

  return (
    <div className="mt-2 space-y-2" aria-live="polite" aria-label="비밀번호 강도">
      {/* 강도 바 */}
      <div className="flex items-center gap-2">
        <div className="flex flex-1 gap-1" role="progressbar" aria-valuenow={score} aria-valuemin={0} aria-valuemax={4}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className={[
                'h-1.5 flex-1 rounded-full transition-colors duration-300',
                i < score ? barColor : 'bg-border',
              ].join(' ')}
            />
          ))}
        </div>
        {label.text && (
          <span className={['text-xs font-medium', label.color].join(' ')}>
            {label.text}
          </span>
        )}
      </div>

      {/* 조건 체크리스트 */}
      <ul className="grid grid-cols-2 gap-x-4 gap-y-1">
        {checkItems.map(({ key, label: checkLabel }) => (
          <li
            key={key}
            className={[
              'flex items-center gap-1.5 text-xs',
              checks[key] ? 'text-success' : 'text-muted',
            ].join(' ')}
          >
            <Check
              size={12}
              className={[
                'shrink-0 transition-colors duration-200',
                checks[key] ? 'text-success' : 'text-border',
              ].join(' ')}
              aria-hidden="true"
            />
            {checkLabel}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 메인 페이지 컴포넌트
// ---------------------------------------------------------------------------

export default function RegisterPage() {
  const register = useRegister();
  const oAuthLogin = useOAuthLogin();

  const isLoading = register.isPending || oAuthLogin.isPending;

  const {
    register: formRegister,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
  });

  const passwordValue = watch('password', '');

  const onSubmit = (data: RegisterFormValues) => {
    const { email, password, nickname } = data;
    register.mutate({ email, password, nickname });
  };

  return (
    <div className="w-full space-y-6">
      {/* 헤더 */}
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-bold text-text">회원가입</h1>
        <p className="text-sm text-sub">태그로 기록하는 나만의 일기장</p>
      </div>

      {/* 소셜 로그인 */}
      <div className="space-y-3">
        <Button
          variant="outline"
          size="lg"
          type="button"
          className="w-full"
          loading={oAuthLogin.isPending}
          disabled={isLoading}
          onClick={() => oAuthLogin.mutate('google')}
          aria-label="Google 계정으로 회원가입"
        >
          <GoogleIcon />
          Google로 계속하기
        </Button>

        <Button
          variant="outline"
          size="lg"
          type="button"
          className="w-full"
          loading={oAuthLogin.isPending}
          disabled={isLoading}
          onClick={() => oAuthLogin.mutate('kakao')}
          aria-label="카카오 계정으로 회원가입"
        >
          <KakaoIcon />
          카카오로 계속하기
        </Button>
      </div>

      {/* 구분선 */}
      <div className="relative flex items-center gap-3" role="separator">
        <div className="flex-1 border-t border-border" />
        <span className="text-xs text-muted select-none">또는 이메일로 가입</span>
        <div className="flex-1 border-t border-border" />
      </div>

      {/* 이메일 가입 폼 */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="space-y-4"
        aria-label="이메일 회원가입 폼"
      >
        {/* 닉네임 */}
        <Input
          type="text"
          label="닉네임"
          id="nickname"
          placeholder="2~20자 닉네임을 입력해주세요."
          error={errors.nickname?.message}
          disabled={isLoading}
          autoComplete="nickname"
          {...formRegister('nickname')}
        />

        {/* 이메일 */}
        <Input
          type="email"
          label="이메일"
          id="email"
          placeholder="example@email.com"
          error={errors.email?.message}
          disabled={isLoading}
          autoComplete="email"
          {...formRegister('email')}
        />

        {/* 비밀번호 */}
        <div>
          <Input
            type="password"
            label="비밀번호"
            id="password"
            placeholder="8자 이상, 영문+숫자+특수문자"
            error={errors.password?.message}
            disabled={isLoading}
            autoComplete="new-password"
            {...formRegister('password')}
          />
          <PasswordStrengthMeter password={passwordValue} />
        </div>

        {/* 비밀번호 확인 */}
        <Input
          type="password"
          label="비밀번호 확인"
          id="passwordConfirm"
          placeholder="비밀번호를 다시 입력해주세요."
          error={errors.passwordConfirm?.message}
          disabled={isLoading}
          autoComplete="new-password"
          {...formRegister('passwordConfirm')}
        />

        {/* 제출 버튼 */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full mt-2"
          loading={register.isPending}
          disabled={isLoading}
        >
          회원가입
        </Button>
      </form>

      {/* 로그인 링크 */}
      <p className="text-center text-sm text-sub">
        이미 계정이 있으신가요?{' '}
        <Link
          href={ROUTES.LOGIN}
          className="font-medium text-accent hover:underline underline-offset-2 transition-colors"
        >
          로그인
        </Link>
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 소셜 로그인 아이콘 (SVG 인라인)
// ---------------------------------------------------------------------------

function GoogleIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={18}
      height={18}
      aria-hidden="true"
      className="shrink-0"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function KakaoIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={18}
      height={18}
      aria-hidden="true"
      className="shrink-0"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 3C6.477 3 2 6.582 2 11c0 2.773 1.617 5.222 4.08 6.74l-1.04 3.87a.375.375 0 0 0 .548.415L9.97 19.7A11.4 11.4 0 0 0 12 19c5.523 0 10-3.582 10-8S17.523 3 12 3z"
        fill="#3A1D1D"
      />
    </svg>
  );
}
