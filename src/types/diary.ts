/**
 * diary.ts
 *
 * Diary 도메인 타입 정의.
 *
 * 백엔드 API 스펙 기준:
 *   - POST   /api/v1/diaries          → CreateDiaryRequest / CreateDiaryResponse
 *   - GET    /api/v1/diaries           → MonthlyDiaryResponse (year, month 쿼리)
 *   - GET    /api/v1/diaries/{id}      → DiaryResponse
 *   - PUT    /api/v1/diaries/{id}      → UpdateDiaryRequest (전체 교체)
 *   - DELETE /api/v1/diaries/{id}      → soft delete
 */

// ---------------------------------------------------------------------------
// 태그 정보 (DiaryResponse 내부)
// ---------------------------------------------------------------------------

export interface DiaryTag {
  id: number;
  name: string;
}

// ---------------------------------------------------------------------------
// 응답 타입
// ---------------------------------------------------------------------------

export interface DiaryResponse {
  id: number;
  userId: number;
  title: string;
  content: string;
  mood: number; // 1~5
  tags: DiaryTag[];
  date: string; // yyyy-MM-dd (LocalDate)
  createdAt: string; // yyyy-MM-ddTHH:mm:ss
  updatedAt: string; // yyyy-MM-ddTHH:mm:ss
}

export interface CreateDiaryResponse {
  diaryId: number;
}

export interface MonthlyDiaryResponse {
  year: number;
  month: number; // 1~12
  averageMood: number;
  diaries: DiaryResponse[];
}

// ---------------------------------------------------------------------------
// 요청 타입
// ---------------------------------------------------------------------------

export interface CreateDiaryRequest {
  title: string; // 1~255자
  content: string; // 1~10,000자
  mood: number; // 1~5
  diaryDate: string; // yyyy-MM-dd (필수)
  tagNames?: string[]; // 최대 10개
}

/** PUT 전체 교체 방식 — 모든 필드 필수. */
export interface UpdateDiaryRequest {
  title: string; // 1~255자
  content: string; // 1~10,000자
  mood: number; // 1~5
  diaryDate: string; // yyyy-MM-dd (필수)
  tagNames?: string[]; // 최대 10개
}

// ---------------------------------------------------------------------------
// 필터
// ---------------------------------------------------------------------------

export interface MonthlyDiaryFilter {
  year: number;
  month: number; // 1~12
  tagIds?: number[];
}
