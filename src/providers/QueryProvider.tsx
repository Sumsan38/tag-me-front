'use client';

/**
 * QueryProvider.tsx
 *
 * React Query (TanStack Query v5) 전역 설정 프로바이더.
 *
 * 설정 근거:
 *   - staleTime 30초: P95 < 200ms 목표 API 기준, 불필요한 리패치를 줄이되
 *     최신 데이터 보장 간격을 적정하게 유지
 *   - gcTime 5분: 비활성 캐시를 5분간 메모리에 보관 후 GC
 *     (v4의 cacheTime → v5에서 gcTime으로 명칭 변경)
 *   - retry 1: 네트워크 순단에 1회 재시도, 그 이상은 에러 처리로 위임
 *   - refetchOnWindowFocus false: 탭 전환 시 불필요한 API 호출 방지
 *
 * Devtools:
 *   개발 환경에서만 ReactQueryDevtools를 동적 로드한다.
 *   @tanstack/react-query-devtools 패키지를 devDependencies에 추가한 뒤
 *   아래 TODO를 해제하여 활성화한다.
 *   TODO(devtools): `pnpm add -D @tanstack/react-query-devtools` 설치 후 활성화
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { handleApiError } from '@/api/error';

// ---------------------------------------------------------------------------
// QueryClient 팩토리 — useState 초기화 함수로 사용해 SSR 시 싱글턴 보장
// ---------------------------------------------------------------------------

function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000,       // 30초
        gcTime: 5 * 60 * 1000,      // 5분
        retry: 1,
        refetchOnWindowFocus: false,
      },
      mutations: {
        // 뮤테이션 전역 에러 핸들러: 도메인 코드별 toast 표시
        // handleApiError는 toast 미구현 구간에서 console.error로 폴백
        onError: (error) => handleApiError(error),
      },
    },
  });
}

// ---------------------------------------------------------------------------
// Provider 컴포넌트
// ---------------------------------------------------------------------------

interface QueryProviderProps {
  children: ReactNode;
}

export default function QueryProvider({ children }: QueryProviderProps) {
  // useState 초기화 함수를 사용해 컴포넌트 렌더마다 인스턴스가 재생성되지 않도록 한다.
  const [queryClient] = useState(() => makeQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* TODO(devtools): @tanstack/react-query-devtools 설치 후 아래 주석 해제
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )} */}
    </QueryClientProvider>
  );
}
