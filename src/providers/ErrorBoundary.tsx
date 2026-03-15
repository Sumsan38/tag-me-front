'use client';

/**
 * ErrorBoundary.tsx
 *
 * React Query와 연동된 에러 바운더리 컴포넌트.
 *
 * - useQueryErrorResetBoundary를 통해 바운더리 내부 쿼리 에러 상태를 일괄 초기화
 * - "다시 시도" 버튼 클릭 시 reset() → componentDidUpdate에서 hasError를 false로 전환
 * - throwOnError: true 옵션을 사용한 쿼리의 에러가 이 바운더리로 전파된다
 *
 * 사용 예시:
 * ```tsx
 * <QueryErrorBoundary>
 *   <SomeDataComponent />
 * </QueryErrorBoundary>
 * ```
 *
 * 에러 전파 활성화 (개별 쿼리):
 * ```ts
 * useQuery({ ..., throwOnError: true })
 * ```
 */

import { Component, type ReactNode } from 'react';
import { useQueryErrorResetBoundary } from '@tanstack/react-query';
import { getErrorMessage } from '@/api/error';

// ---------------------------------------------------------------------------
// 내부 클래스 바운더리 — 훅 사용 불가, 함수형 래퍼로 분리
// ---------------------------------------------------------------------------

interface ErrorBoundaryState {
  hasError: boolean;
  error: unknown;
}

interface InnerErrorBoundaryProps {
  children: ReactNode;
  onReset: () => void;
  fallback?: (props: { error: unknown; reset: () => void }) => ReactNode;
}

class InnerErrorBoundary extends Component<
  InnerErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: InnerErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidUpdate(prevProps: InnerErrorBoundaryProps): void {
    // onReset이 호출되어 참조가 바뀌면 에러 상태를 초기화한다.
    // (useQueryErrorResetBoundary의 reset 함수와 동기화)
    if (this.state.hasError && prevProps.onReset !== this.props.onReset) {
      this.setState({ hasError: false, error: null });
    }
  }

  render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const reset = () => {
      this.props.onReset();
      this.setState({ hasError: false, error: null });
    };

    if (this.props.fallback) {
      return this.props.fallback({ error: this.state.error, reset });
    }

    return <DefaultErrorUI error={this.state.error} reset={reset} />;
  }
}

// ---------------------------------------------------------------------------
// 기본 에러 UI
// ---------------------------------------------------------------------------

interface DefaultErrorUIProps {
  error: unknown;
  reset: () => void;
}

function DefaultErrorUI({ error, reset }: DefaultErrorUIProps): ReactNode {
  const message = getErrorMessage(error);

  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center gap-4 rounded-xl border border-red-100 bg-red-50 p-6 text-center">
      <div className="flex flex-col items-center gap-2">
        <span className="text-2xl" aria-hidden="true">
          !
        </span>
        <p className="text-sm font-medium text-red-700">{message}</p>
      </div>
      <button
        type="button"
        onClick={reset}
        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
      >
        다시 시도
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 공개 래퍼 컴포넌트 — useQueryErrorResetBoundary 훅을 주입한다
// ---------------------------------------------------------------------------

export interface QueryErrorBoundaryProps {
  children: ReactNode;
  /**
   * 커스텀 에러 fallback UI.
   * 제공하지 않으면 DefaultErrorUI를 사용한다.
   */
  fallback?: (props: { error: unknown; reset: () => void }) => ReactNode;
}

/**
 * React Query throwOnError 에러를 포착하는 에러 바운더리.
 *
 * useQueryErrorResetBoundary().reset()을 InnerErrorBoundary에 주입하여
 * "다시 시도" 클릭 시 바운더리 내부의 모든 쿼리 에러 상태를 초기화한다.
 */
export default function QueryErrorBoundary({
  children,
  fallback,
}: QueryErrorBoundaryProps) {
  const { reset } = useQueryErrorResetBoundary();

  return (
    <InnerErrorBoundary onReset={reset} fallback={fallback}>
      {children}
    </InnerErrorBoundary>
  );
}
