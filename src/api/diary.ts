/**
 * diary.ts
 *
 * Diary 도메인 API 클라이언트.
 *
 * 엔드포인트:
 *   - POST   /api/v1/diaries              — 일기 작성
 *   - GET    /api/v1/diaries               — 월별 일기 조회 (year, month 필수)
 *   - GET    /api/v1/diaries/{id}          — 일기 상세 조회
 *   - PUT    /api/v1/diaries/{id}          — 일기 수정 (전체 교체)
 *   - DELETE /api/v1/diaries/{id}          — 일기 삭제 (soft delete)
 */

import apiClient from '@/api/client';
import type {
  CreateDiaryRequest,
  CreateDiaryResponse,
  DiaryResponse,
  MonthlyDiaryFilter,
  MonthlyDiaryResponse,
  UpdateDiaryRequest,
} from '@/types/diary';

// ---------------------------------------------------------------------------
// 일기 CRUD
// ---------------------------------------------------------------------------

/** 일기 작성. 성공 시 생성된 diaryId 반환. */
export async function createDiary(
  data: CreateDiaryRequest,
): Promise<CreateDiaryResponse> {
  const response = await apiClient.post<CreateDiaryResponse>(
    '/api/v1/diaries',
    data,
  );
  return response.data;
}

/**
 * 월별 일기 목록 조회.
 * Cursor 기반이 아닌 월별 전체 조회 방식이다.
 * tagIds가 있으면 쉼표로 구분하여 쿼리 파라미터로 전달한다.
 */
export async function getMonthlyDiaries(
  filter: MonthlyDiaryFilter,
): Promise<MonthlyDiaryResponse> {
  const params: Record<string, string | number> = {
    year: filter.year,
    month: filter.month,
  };
  if (filter.tagIds && filter.tagIds.length > 0) {
    params.tagIds = filter.tagIds.join(',');
  }

  const response = await apiClient.get<MonthlyDiaryResponse>(
    '/api/v1/diaries',
    { params },
  );
  return response.data;
}

/** 일기 상세 조회. */
export async function getDiary(id: number): Promise<DiaryResponse> {
  const response = await apiClient.get<DiaryResponse>(
    `/api/v1/diaries/${id}`,
  );
  return response.data;
}

/** 일기 수정. PUT 전체 교체 방식 — 모든 필드 필수. */
export async function updateDiary(
  id: number,
  data: UpdateDiaryRequest,
): Promise<void> {
  await apiClient.put(`/api/v1/diaries/${id}`, data);
}

/** 일기 삭제 (soft delete). */
export async function deleteDiary(id: number): Promise<void> {
  await apiClient.delete(`/api/v1/diaries/${id}`);
}
