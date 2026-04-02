/**
 * useDiary.ts
 *
 * Diary 도메인 React Query 훅.
 *
 * 훅 목록:
 *   - useCreateDiary()          — 일기 작성 mutation
 *   - useMonthlyDiaries()       — 월별 일기 목록 query
 *   - useDiary()                — 일기 상세 query
 *   - useUpdateDiary()          — 일기 수정 mutation
 *   - useDeleteDiary()          — 일기 삭제 mutation
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/useToast';
import { getErrorMessage } from '@/api/error';
import * as diaryApi from '@/api/diary';
import type {
  CreateDiaryRequest,
  UpdateDiaryRequest,
} from '@/types/diary';

// ---------------------------------------------------------------------------
// Query Keys
// ---------------------------------------------------------------------------

export const diaryKeys = {
  all: ['diary'] as const,
  monthly: (year: number, month: number, tagIds?: number[]) =>
    [...diaryKeys.all, 'monthly', year, month, tagIds ?? []] as const,
  detail: (id: number) => [...diaryKeys.all, 'detail', id] as const,
};

// ---------------------------------------------------------------------------
// useCreateDiary
// ---------------------------------------------------------------------------

/**
 * 일기 작성 mutation.
 * 성공 시 월별 목록 캐시 무효화 + toast.
 * 라우트 이동은 호출부에서 onSuccess 콜백으로 처리.
 */
export function useCreateDiary() {
  const toast = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDiaryRequest) => diaryApi.createDiary(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: diaryKeys.all });
      toast.success('일기가 저장되었습니다.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

// ---------------------------------------------------------------------------
// useMonthlyDiaries
// ---------------------------------------------------------------------------

/**
 * 월별 일기 목록 query.
 * Cursor 기반이 아닌 월 단위 전체 조회이므로 일반 useQuery를 사용한다.
 */
export function useMonthlyDiaries(
  year: number,
  month: number,
  tagIds?: number[],
) {
  return useQuery({
    queryKey: diaryKeys.monthly(year, month, tagIds),
    queryFn: () => diaryApi.getMonthlyDiaries({ year, month, tagIds }),
    staleTime: 5 * 60 * 1000,
  });
}

// ---------------------------------------------------------------------------
// useDiary
// ---------------------------------------------------------------------------

/**
 * 일기 상세 query.
 * id가 truthy일 때만 활성화된다.
 */
export function useDiary(id: number | null | undefined) {
  return useQuery({
    queryKey: diaryKeys.detail(id!),
    queryFn: () => diaryApi.getDiary(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

// ---------------------------------------------------------------------------
// useUpdateDiary
// ---------------------------------------------------------------------------

/**
 * 일기 수정 mutation.
 * 성공 시 상세 + 월별 목록 캐시 무효화 + toast.
 */
export function useUpdateDiary() {
  const toast = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateDiaryRequest }) =>
      diaryApi.updateDiary(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: diaryKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: [...diaryKeys.all, 'monthly'] });
      toast.success('일기가 수정되었습니다.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

// ---------------------------------------------------------------------------
// useDeleteDiary
// ---------------------------------------------------------------------------

/**
 * 일기 삭제 mutation.
 * 성공 시 월별 목록 캐시 무효화 + toast + 일기 목록 리다이렉트.
 */
export function useDeleteDiary() {
  const toast = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => diaryApi.deleteDiary(id),
    onSuccess: (_, deletedId) => {
      queryClient.removeQueries({ queryKey: diaryKeys.detail(deletedId) });
      queryClient.invalidateQueries({
        queryKey: [...diaryKeys.all, 'monthly'],
      });
      toast.success('일기가 삭제되었습니다.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
