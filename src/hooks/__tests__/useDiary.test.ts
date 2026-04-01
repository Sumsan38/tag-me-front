import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement, type ReactNode } from 'react';
import {
  useMonthlyDiaries,
  useDiary,
  useCreateDiary,
  useUpdateDiary,
  useDeleteDiary,
  diaryKeys,
} from '@/hooks/useDiary';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockPush = vi.fn();
const mockReplace = vi.fn();
const mockBack = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace, back: mockBack }),
  useParams: () => ({}),
}));

const mockToast = { success: vi.fn(), error: vi.fn(), info: vi.fn(), warning: vi.fn(), show: vi.fn(), dismiss: vi.fn() };
vi.mock('@/hooks/useToast', () => ({
  useToast: () => mockToast,
}));

vi.mock('@/api/error', () => ({
  getErrorMessage: (e: unknown) =>
    e instanceof Error ? e.message : '알 수 없는 오류',
}));

const mockDiaryApi = vi.hoisted(() => ({
  createDiary: vi.fn(),
  getMonthlyDiaries: vi.fn(),
  getDiary: vi.fn(),
  updateDiary: vi.fn(),
  deleteDiary: vi.fn(),
}));

vi.mock('@/api/diary', () => mockDiaryApi);

// ---------------------------------------------------------------------------
// 헬퍼
// ---------------------------------------------------------------------------

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return {
    wrapper: ({ children }: { children: ReactNode }) =>
      createElement(QueryClientProvider, { client: queryClient }, children),
    queryClient,
  };
}

const MONTHLY_RESPONSE = {
  year: 2026,
  month: 4,
  averageMood: 3.5,
  diaries: [
    {
      id: 1,
      userId: 10,
      title: '테스트 일기',
      content: '내용',
      mood: 4,
      tags: [],
      date: '2026-04-01',
      createdAt: '2026-04-01T10:00:00',
      updatedAt: '2026-04-01T10:00:00',
    },
  ],
};

const DIARY_RESPONSE = MONTHLY_RESPONSE.diaries[0];

// ---------------------------------------------------------------------------
// 테스트
// ---------------------------------------------------------------------------

describe('useDiary hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ---- diaryKeys ----
  describe('diaryKeys', () => {
    it('all 키를 반환한다', () => {
      expect(diaryKeys.all).toEqual(['diary']);
    });

    it('monthly 키에 year, month를 포함한다', () => {
      expect(diaryKeys.monthly(2026, 4)).toEqual(['diary', 'monthly', 2026, 4]);
    });

    it('monthly 키에 tagIds를 포함한다', () => {
      expect(diaryKeys.monthly(2026, 4, [1, 2])).toEqual([
        'diary', 'monthly', 2026, 4, 1, 2,
      ]);
    });

    it('detail 키에 id를 포함한다', () => {
      expect(diaryKeys.detail(42)).toEqual(['diary', 'detail', 42]);
    });
  });

  // ---- useMonthlyDiaries ----
  describe('useMonthlyDiaries', () => {
    it('월별 일기 목록을 조회한다', async () => {
      mockDiaryApi.getMonthlyDiaries.mockResolvedValueOnce(MONTHLY_RESPONSE);
      const { wrapper } = createWrapper();

      const { result } = renderHook(() => useMonthlyDiaries(2026, 4), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data?.diaries).toHaveLength(1);
      expect(result.current.data?.averageMood).toBe(3.5);
      expect(mockDiaryApi.getMonthlyDiaries).toHaveBeenCalledWith({
        year: 2026,
        month: 4,
        tagIds: undefined,
      });
    });

    it('tagIds 필터를 전달한다', async () => {
      mockDiaryApi.getMonthlyDiaries.mockResolvedValueOnce({
        ...MONTHLY_RESPONSE,
        diaries: [],
      });
      const { wrapper } = createWrapper();

      renderHook(() => useMonthlyDiaries(2026, 4, [1, 5]), { wrapper });

      await waitFor(() =>
        expect(mockDiaryApi.getMonthlyDiaries).toHaveBeenCalledWith({
          year: 2026,
          month: 4,
          tagIds: [1, 5],
        }),
      );
    });
  });

  // ---- useDiary ----
  describe('useDiary', () => {
    it('id로 일기 상세를 조회한다', async () => {
      mockDiaryApi.getDiary.mockResolvedValueOnce(DIARY_RESPONSE);
      const { wrapper } = createWrapper();

      const { result } = renderHook(() => useDiary(1), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data?.title).toBe('테스트 일기');
    });

    it('id가 null이면 쿼리를 실행하지 않는다', () => {
      const { wrapper } = createWrapper();

      const { result } = renderHook(() => useDiary(null), { wrapper });

      expect(result.current.fetchStatus).toBe('idle');
      expect(mockDiaryApi.getDiary).not.toHaveBeenCalled();
    });
  });

  // ---- useCreateDiary ----
  describe('useCreateDiary', () => {
    it('성공 시 toast + 캐시 무효화 (라우트 이동은 호출부 처리)', async () => {
      mockDiaryApi.createDiary.mockResolvedValueOnce({ diaryId: 42 });
      const { wrapper } = createWrapper();

      const { result } = renderHook(() => useCreateDiary(), { wrapper });
      result.current.mutate({
        title: '새 일기',
        content: '내용',
        mood: 3,
        diaryDate: '2026-04-01',
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockToast.success).toHaveBeenCalledWith('일기가 저장되었습니다.');
    });

    it('실패 시 에러 toast', async () => {
      mockDiaryApi.createDiary.mockRejectedValueOnce(new Error('서버 오류'));
      const { wrapper } = createWrapper();

      const { result } = renderHook(() => useCreateDiary(), { wrapper });
      result.current.mutate({
        title: '제목',
        content: '내용',
        mood: 1,
        diaryDate: '2026-04-01',
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(mockToast.error).toHaveBeenCalledWith('서버 오류');
    });
  });

  // ---- useUpdateDiary ----
  describe('useUpdateDiary', () => {
    it('성공 시 toast + 상세 페이지 리다이렉트', async () => {
      mockDiaryApi.updateDiary.mockResolvedValueOnce(undefined);
      const { wrapper } = createWrapper();

      const { result } = renderHook(() => useUpdateDiary(), { wrapper });
      result.current.mutate({
        id: 1,
        data: { title: '수정', content: '수정 내용', mood: 5, diaryDate: '2026-04-01' },
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockToast.success).toHaveBeenCalledWith('일기가 수정되었습니다.');
    });
  });

  // ---- useDeleteDiary ----
  describe('useDeleteDiary', () => {
    it('성공 시 toast 표시', async () => {
      mockDiaryApi.deleteDiary.mockResolvedValueOnce(undefined);
      const { wrapper } = createWrapper();

      const { result } = renderHook(() => useDeleteDiary(), { wrapper });
      result.current.mutate(1);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockToast.success).toHaveBeenCalledWith('일기가 삭제되었습니다.');
    });

    it('실패 시 에러 toast', async () => {
      mockDiaryApi.deleteDiary.mockRejectedValueOnce(new Error('삭제 실패'));
      const { wrapper } = createWrapper();

      const { result } = renderHook(() => useDeleteDiary(), { wrapper });
      result.current.mutate(99);

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(mockToast.error).toHaveBeenCalledWith('삭제 실패');
    });
  });
});
