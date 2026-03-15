/**
 * diary.ts
 *
 * Diary 도메인 타입 정의.
 *
 * - Diary: 개인 일기 엔티티
 * - CreateDiaryRequest / UpdateDiaryRequest: 일기 작성/수정 요청 바디
 * - DiaryListFilter: 일기 목록 조회 필터 (Cursor 기반 페이지네이션 + 태그/날짜 필터)
 *
 * 모든 날짜 필드는 ISO 8601 형식의 string으로 관리한다. (Date 객체 미사용)
 * ID는 백엔드 UUID 체계에 맞춰 string으로 정의한다.
 */

// ---------------------------------------------------------------------------
// 엔티티
// ---------------------------------------------------------------------------

/**
 * 개인 일기.
 * 일기는 본인만 조회 가능하며, URL 직접 접근 시 소유권 검증이 필요하다.
 * mood는 1(매우 나쁨) ~ 5(매우 좋음) 범위의 정수이다.
 */
export interface Diary {
  id: string;
  title: string;
  content: string;
  mood: number; // 1~5
  tags: string[];
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

// ---------------------------------------------------------------------------
// 요청 타입
// ---------------------------------------------------------------------------

export interface CreateDiaryRequest {
  title: string;
  content: string;
  mood: number; // 1~5
  tags: string[];
}

/**
 * PATCH 시맨틱: 변경할 필드만 포함한다. 미포함 필드는 서버에서 기존 값을 유지한다.
 */
export interface UpdateDiaryRequest {
  title?: string;
  content?: string;
  mood?: number; // 1~5
  tags?: string[];
}

// ---------------------------------------------------------------------------
// 필터
// ---------------------------------------------------------------------------

/**
 * 일기 목록 조회 필터.
 * cursor는 CursorPage 페이지네이션에서 이전 응답의 nextCursor 값을 그대로 전달한다.
 * fromDate / toDate는 'yyyy-MM-dd' 형식으로 전달한다.
 */
export interface DiaryListFilter {
  cursor?: string;
  tag?: string;
  fromDate?: string; // yyyy-MM-dd
  toDate?: string;   // yyyy-MM-dd
}
