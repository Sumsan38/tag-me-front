import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createDiary,
  getMonthlyDiaries,
  getDiary,
  updateDiary,
  deleteDiary,
} from '@/api/diary';
import type {
  CreateDiaryRequest,
  UpdateDiaryRequest,
  MonthlyDiaryFilter,
} from '@/types/diary';

// ---------------------------------------------------------------------------
// apiClient mock
// ---------------------------------------------------------------------------

const mockPost = vi.fn();
const mockGet = vi.fn();
const mockPut = vi.fn();
const mockDelete = vi.fn();

vi.mock('@/api/client', () => ({
  default: {
    post: (...args: unknown[]) => mockPost(...args),
    get: (...args: unknown[]) => mockGet(...args),
    put: (...args: unknown[]) => mockPut(...args),
    delete: (...args: unknown[]) => mockDelete(...args),
  },
  ApiError: class extends Error {
    code: string;
    status?: number;
    constructor(message: string, code: string, status?: number) {
      super(message);
      this.code = code;
      this.status = status;
    }
  },
  isApiError: (e: unknown) => e instanceof Error && 'code' in e,
}));

// ---------------------------------------------------------------------------
// 테스트 데이터
// ---------------------------------------------------------------------------

const DIARY_RESPONSE = {
  id: 1,
  userId: 10,
  title: '2026-04-01',
  content: '오늘 하루 기록',
  mood: 4,
  tags: [{ id: 1, name: '산책' }],
  date: '2026-04-01',
  createdAt: '2026-04-01T10:00:00',
  updatedAt: '2026-04-01T10:00:00',
};

// ---------------------------------------------------------------------------
// 테스트
// ---------------------------------------------------------------------------

describe('api/diary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ---- createDiary ----
  describe('createDiary', () => {
    it('POST /api/v1/diaries 호출 후 diaryId를 반환한다', async () => {
      const request: CreateDiaryRequest = {
        title: '오늘의 일기',
        content: '내용입니다',
        mood: 3,
        tagNames: ['산책', '감정'],
      };
      mockPost.mockResolvedValueOnce({ data: { diaryId: 42 } });

      const result = await createDiary(request);

      expect(mockPost).toHaveBeenCalledWith('/api/v1/diaries', request);
      expect(result).toEqual({ diaryId: 42 });
    });

    it('tagNames 없이 호출할 수 있다', async () => {
      const request: CreateDiaryRequest = {
        title: '제목',
        content: '내용',
        mood: 2,
      };
      mockPost.mockResolvedValueOnce({ data: { diaryId: 1 } });

      await createDiary(request);

      expect(mockPost).toHaveBeenCalledWith('/api/v1/diaries', request);
    });
  });

  // ---- getMonthlyDiaries ----
  describe('getMonthlyDiaries', () => {
    it('year, month 쿼리 파라미터로 GET 호출한다', async () => {
      const filter: MonthlyDiaryFilter = { year: 2026, month: 4 };
      const mockResponse = {
        year: 2026,
        month: 4,
        averageMood: 3.5,
        diaries: [DIARY_RESPONSE],
      };
      mockGet.mockResolvedValueOnce({ data: mockResponse });

      const result = await getMonthlyDiaries(filter);

      expect(mockGet).toHaveBeenCalledWith('/api/v1/diaries', {
        params: { year: 2026, month: 4 },
      });
      expect(result.diaries).toHaveLength(1);
      expect(result.averageMood).toBe(3.5);
    });

    it('tagIds가 있으면 쉼표 구분 문자열로 전달한다', async () => {
      const filter: MonthlyDiaryFilter = {
        year: 2026,
        month: 3,
        tagIds: [1, 5, 10],
      };
      mockGet.mockResolvedValueOnce({
        data: { year: 2026, month: 3, averageMood: 0, diaries: [] },
      });

      await getMonthlyDiaries(filter);

      expect(mockGet).toHaveBeenCalledWith('/api/v1/diaries', {
        params: { year: 2026, month: 3, tagIds: '1,5,10' },
      });
    });

    it('tagIds가 빈 배열이면 파라미터에 포함하지 않는다', async () => {
      const filter: MonthlyDiaryFilter = {
        year: 2026,
        month: 3,
        tagIds: [],
      };
      mockGet.mockResolvedValueOnce({
        data: { year: 2026, month: 3, averageMood: 0, diaries: [] },
      });

      await getMonthlyDiaries(filter);

      expect(mockGet).toHaveBeenCalledWith('/api/v1/diaries', {
        params: { year: 2026, month: 3 },
      });
    });
  });

  // ---- getDiary ----
  describe('getDiary', () => {
    it('GET /api/v1/diaries/{id}로 일기를 조회한다', async () => {
      mockGet.mockResolvedValueOnce({ data: DIARY_RESPONSE });

      const result = await getDiary(1);

      expect(mockGet).toHaveBeenCalledWith('/api/v1/diaries/1');
      expect(result.title).toBe('2026-04-01');
      expect(result.tags).toHaveLength(1);
    });
  });

  // ---- updateDiary ----
  describe('updateDiary', () => {
    it('PUT /api/v1/diaries/{id}로 전체 교체 요청한다', async () => {
      const data: UpdateDiaryRequest = {
        title: '수정된 제목',
        content: '수정된 내용',
        mood: 5,
        tagNames: ['여행'],
      };
      mockPut.mockResolvedValueOnce({ data: undefined });

      await updateDiary(1, data);

      expect(mockPut).toHaveBeenCalledWith('/api/v1/diaries/1', data);
    });
  });

  // ---- deleteDiary ----
  describe('deleteDiary', () => {
    it('DELETE /api/v1/diaries/{id}로 삭제한다', async () => {
      mockDelete.mockResolvedValueOnce({ data: undefined });

      await deleteDiary(1);

      expect(mockDelete).toHaveBeenCalledWith('/api/v1/diaries/1');
    });
  });
});
